/*
  ArborIA: Guardião da Muda
  Fica ao lado de uma muda recém-plantada. Mede o solo, a luz e o calor,
  rega sozinho quando precisa e acompanha o ar e o calor desde o dia do plantio.
  Funciona sem internet.

  Integrantes:
  Anauã Vieitas (RM 576103)
  Bruno Smoktunowicz (RM 574739)
  Caio Machado (RM 575113)
*/

#include <DHTesp.h>
#include <ESP32Servo.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// Pinos
const int PINO_SOLO = 36;  // No Wokwi, um potenciômetro faz o papel do sensor de solo.
const int PINO_LUZ = 32;
const int PINO_AR = 33;
const int PINO_DHT = 16;
const int PINO_BOTAO = 15;
const int PINO_VALVULA = 4;  // No Wokwi, um servo faz o papel da válvula de água.
const int PINO_LED_VERDE = 19;
const int PINO_LED_AMARELO = 18;
const int PINO_LED_VERMELHO = 17;
const int PINO_BUZZER = 13;

// Limites escolhidos pelo projeto. Precisam de teste com uma muda de verdade.
const int LIMITE_UMIDO = 60;            // % de umidade: acima disso, o solo está bom.
const int LIMITE_SECO = 30;             // % de umidade: abaixo disso, precisa regar.
const int LIMITE_SECO_COM_CALOR = 40;   // Com calor forte, o solo seca mais rápido.
const float LIMITE_CALOR = 36.0;        // °C, o mesmo limite de python/main.py.
const int LIMITE_SOL = 90;              // % de luz: acima disso, a água evapora mais.

// Fora deste intervalo, a leitura de temperatura é tratada como erro do sensor.
const float TEMPERATURA_MINIMA = -10.0;
const float TEMPERATURA_MAXIMA = 60.0;

// Tempos em milissegundos. São curtos para a demonstração; na rua seriam minutos e horas.
const unsigned long INTERVALO_LEITURA = 2000;
const unsigned long TEMPO_REGA = 8000;
const unsigned long PAUSA_ABSORCAO = 10000;
const unsigned long INTERVALO_PISCA = 500;
const unsigned long INTERVALO_BIPE = 5000;
const unsigned long DURACAO_BIPE = 150;
const unsigned long ESPERA_BOTAO = 300;
const int FREQUENCIA_BIPE = 2000;

const int MAX_TENTATIVAS = 2;  // Regas sem resultado antes de pedir ajuda.
const int VALVULA_FECHADA = 0;
const int VALVULA_ABERTA = 90;

// A média das últimas leituras evita que um valor isolado mude o estado.
const int TAMANHO_MEDIA = 3;

enum Estado { SOLO_OK, ATENCAO, REGANDO, AGUARDANDO, ALERTA, ERRO };

struct Media {
  float valores[TAMANHO_MEDIA];
  int quantidade;
  int proxima;
};

DHTesp sensorTemperatura;
Servo valvula;
LiquidCrystal_I2C tela(0x27, 20, 4);

Media mediaSolo = {};
Media mediaLuz = {};
Media mediaAr = {};
Media mediaTemperatura = {};

float solo = 0;
float luz = 0;
float ar = 0;
float temperatura = 0;

Estado estadoAtual = SOLO_OK;
bool valvulaAberta = false;
int tentativas = 0;

bool baseSalva = false;
float baseTemperatura = 0;
float baseAr = 0;

unsigned long ultimaLeitura = 0;
unsigned long inicioRega = 0;
unsigned long fimUltimaRega = 0;
unsigned long ultimoPisca = 0;
unsigned long ultimoBipe = 0;
unsigned long ultimoBotao = 0;
bool ledAceso = false;

// Guarda a leitura e devolve a média das últimas guardadas.
float adicionarNaMedia(Media &media, float valor) {
  media.valores[media.proxima] = valor;
  media.proxima = (media.proxima + 1) % TAMANHO_MEDIA;
  if (media.quantidade < TAMANHO_MEDIA) {
    media.quantidade++;
  }

  float soma = 0;
  for (int i = 0; i < media.quantidade; i++) {
    soma += media.valores[i];
  }
  return soma / media.quantidade;
}

// Converte a leitura analógica do ESP32, de 0 a 4095, em um valor de 0 a 100.
float lerPercentual(int pino) {
  return analogRead(pino) * 100.0 / 4095.0;
}

bool temperaturaValida(float valor) {
  return !isnan(valor) && valor >= TEMPERATURA_MINIMA && valor <= TEMPERATURA_MAXIMA;
}

// A decisão junta três sensores: solo, calor e luz.
Estado decidirEstado(unsigned long agora) {
  int limiteSeco = temperatura >= LIMITE_CALOR ? LIMITE_SECO_COM_CALOR : LIMITE_SECO;

  if (solo >= LIMITE_UMIDO) {
    tentativas = 0;
    return SOLO_OK;
  } else if (solo >= limiteSeco) {
    tentativas = 0;
    return ATENCAO;
  } else if (tentativas >= MAX_TENTATIVAS) {
    return ALERTA;
  } else if (valvulaAberta) {
    return REGANDO;
  } else if (fimUltimaRega != 0 && agora - fimUltimaRega < PAUSA_ABSORCAO) {
    return ATENCAO;  // Dá tempo para a água chegar ao sensor antes de regar de novo.
  } else if (luz >= LIMITE_SOL) {
    return AGUARDANDO;
  }
  return REGANDO;
}

const char* nomeDoEstado(Estado estado) {
  switch (estado) {
    case SOLO_OK: return "SOLO OK";
    case ATENCAO: return "ATENCAO";
    case REGANDO: return "REGANDO";
    case AGUARDANDO: return "AGUARDANDO";
    case ALERTA: return "ALERTA";
    default: return "ERRO";
  }
}

const char* mensagemDoEstado(Estado estado) {
  switch (estado) {
    case SOLO_OK: return "Muda bem cuidada";
    case ATENCAO: return "Solo secando";
    case REGANDO: return "Regando a muda";
    case AGUARDANDO: return "Esperando o sol";
    case ALERTA: return "Sem agua? Peca ajuda";
    default: return "Verificar sensor";
  }
}

void escreverLinha(int linha, const char* texto) {
  char completa[21];
  snprintf(completa, sizeof(completa), "%-20s", texto);
  tela.setCursor(0, linha);
  tela.print(completa);
}

void atualizarTela() {
  char texto[32];

  snprintf(texto, sizeof(texto), "Solo %3d%% %s", (int)solo, nomeDoEstado(estadoAtual));
  escreverLinha(0, texto);
  escreverLinha(1, mensagemDoEstado(estadoAtual));

  if (estadoAtual == ERRO) {
    snprintf(texto, sizeof(texto), "--.-C Ar %2d Luz %2d%%", (int)ar, (int)luz);
  } else {
    snprintf(texto, sizeof(texto), "%4.1fC Ar %2d Luz %2d%%", temperatura, (int)ar, (int)luz);
  }
  escreverLinha(2, texto);

  if (baseSalva) {
    snprintf(texto, sizeof(texto), "Base: T%+.1f Ar%+d", temperatura - baseTemperatura, (int)(ar - baseAr));
  } else {
    snprintf(texto, sizeof(texto), "Botao: salvar base");
  }
  escreverLinha(3, texto);
}

void mostrarNoSerial() {
  if (estadoAtual == ERRO) {
    Serial.println("Estado: ERRO | Sensor de temperatura sem leitura confiavel");
    return;
  }

  Serial.print("Solo: ");
  Serial.print(solo, 0);
  Serial.print("% | Temp: ");
  Serial.print(temperatura, 1);
  Serial.print(" C | Luz: ");
  Serial.print(luz, 0);
  Serial.print("% | Ar: ");
  Serial.print(ar, 0);
  Serial.print(" | Estado: ");
  Serial.print(nomeDoEstado(estadoAtual));
  if (baseSalva) {
    Serial.print(" | Desde a base: T ");
    Serial.print(temperatura - baseTemperatura, 1);
    Serial.print(" C, Ar ");
    Serial.print(ar - baseAr, 0);
  }
  Serial.println();
}

void lerSensores(unsigned long agora) {
  solo = adicionarNaMedia(mediaSolo, lerPercentual(PINO_SOLO));
  // O sensor de luz dá um valor menor quanto mais luz recebe, então a conta é invertida.
  luz = adicionarNaMedia(mediaLuz, 100.0 - lerPercentual(PINO_LUZ));
  ar = adicionarNaMedia(mediaAr, lerPercentual(PINO_AR));

  float leituraTemperatura = sensorTemperatura.getTemperature();
  if (temperaturaValida(leituraTemperatura)) {
    temperatura = adicionarNaMedia(mediaTemperatura, leituraTemperatura);
    estadoAtual = decidirEstado(agora);
  } else {
    // Sem saber a temperatura, o dispositivo não rega e não usa a leitura na média.
    Serial.print("Leitura invalida: ");
    Serial.println(leituraTemperatura);
    estadoAtual = ERRO;
  }

  mostrarNoSerial();
  atualizarTela();
}

void tocarBipe() {
  tone(PINO_BUZZER, FREQUENCIA_BIPE, DURACAO_BIPE);
}

void abrirValvula(unsigned long agora) {
  valvula.write(VALVULA_ABERTA);
  valvulaAberta = true;
  inicioRega = agora;
  Serial.println("Valvula aberta");
}

void fecharValvula(unsigned long agora) {
  valvula.write(VALVULA_FECHADA);
  valvulaAberta = false;
  fimUltimaRega = agora;
  Serial.println("Valvula fechada");
}

// Abre a válvula na hora de regar e fecha quando o tempo acaba ou o estado muda.
void atualizarValvula(unsigned long agora) {
  if (estadoAtual == REGANDO && !valvulaAberta) {
    abrirValvula(agora);
  } else if (valvulaAberta && estadoAtual != REGANDO) {
    fecharValvula(agora);
  } else if (valvulaAberta && agora - inicioRega >= TEMPO_REGA) {
    fecharValvula(agora);
    tentativas++;
    estadoAtual = ATENCAO;
    atualizarTela();
  }
}

void escreverLeds(bool verde, bool amarelo, bool vermelho) {
  digitalWrite(PINO_LED_VERDE, verde ? HIGH : LOW);
  digitalWrite(PINO_LED_AMARELO, amarelo ? HIGH : LOW);
  digitalWrite(PINO_LED_VERMELHO, vermelho ? HIGH : LOW);
}

// Cada estado tem uma resposta diferente nos LEDs e no buzzer.
void atualizarRespostas(unsigned long agora) {
  if (agora - ultimoPisca >= INTERVALO_PISCA) {
    ultimoPisca = agora;
    ledAceso = !ledAceso;
  }

  switch (estadoAtual) {
    case SOLO_OK:
      escreverLeds(true, false, false);
      break;
    case ATENCAO:
      escreverLeds(false, true, false);
      break;
    case REGANDO:
      escreverLeds(ledAceso, false, false);
      break;
    case AGUARDANDO:
      escreverLeds(false, ledAceso, false);
      break;
    case ALERTA:
      escreverLeds(false, false, true);
      if (agora - ultimoBipe >= INTERVALO_BIPE) {
        ultimoBipe = agora;
        tocarBipe();
      }
      break;
    case ERRO:
      escreverLeds(false, false, ledAceso);
      break;
  }
}

// O botão guarda a linha de base: como estavam o ar e o calor no dia do plantio.
void verificarBotao(unsigned long agora) {
  if (digitalRead(PINO_BOTAO) == LOW && agora - ultimoBotao >= ESPERA_BOTAO) {
    ultimoBotao = agora;
    baseSalva = true;
    baseTemperatura = temperatura;
    baseAr = ar;
    tocarBipe();
    Serial.println("Linha de base salva");
    atualizarTela();
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(PINO_LED_VERDE, OUTPUT);
  pinMode(PINO_LED_AMARELO, OUTPUT);
  pinMode(PINO_LED_VERMELHO, OUTPUT);
  pinMode(PINO_BUZZER, OUTPUT);
  pinMode(PINO_BOTAO, INPUT_PULLUP);

  valvula.attach(PINO_VALVULA);
  valvula.write(VALVULA_FECHADA);
  sensorTemperatura.setup(PINO_DHT, DHTesp::DHT22);

  tela.init();
  tela.backlight();
  escreverLinha(0, "ArborIA");
  escreverLinha(1, "Guardiao da Muda");

  Serial.println("ArborIA: Guardiao da Muda iniciado");
}

void loop() {
  unsigned long agora = millis();

  if (agora - ultimaLeitura >= INTERVALO_LEITURA) {
    ultimaLeitura = agora;
    lerSensores(agora);
  }

  verificarBotao(agora);
  atualizarValvula(agora);
  atualizarRespostas(agora);
}
