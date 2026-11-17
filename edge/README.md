# Sensor: o Guardião da Muda

**Cidadão:** quem plantou ou cuida de uma muda em um bairro quente, como Cosmos.

**Problema:** a ArborIA mostra onde plantar e orienta a regar a muda no primeiro ano, mas nada acompanha a muda depois do plantio. Sem água nos períodos secos, ela pode não vingar.

**Onde fica:** preso ao lado da muda, na calçada, na praça ou no quintal. Ele mede, decide e age sozinho, sem internet.

**ODS:** 11 (espaços verdes nas cidades), 13 (adaptação ao clima) e 3 (riscos do calor à saúde).

**Integrantes:** Anauã Vieitas (RM 576103), Bruno Smoktunowicz (RM 574739) e Caio Machado (RM 575113).

## Como abrir no Wokwi
1. Entre em [wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32).
2. Cole `sketch.ino` e `diagram.json` nas abas de mesmo nome.
3. Na aba **Library Manager**, adicione as três bibliotecas de `libraries.txt`.
4. Faça login, clique em **Save** e depois em **Share** para gerar o link público.

## Componentes
| Componente | Por que está ali |
|---|---|
| ESP32 | Lê os sensores e decide sozinho |
| Potenciômetro | Faz o papel do sensor de umidade do solo, que o Wokwi não tem |
| Sensor de luz (LDR) | Diz se há sol forte, quando a água evapora mais |
| DHT22 | Mede a temperatura do ar |
| Sensor de gás | Acompanha o ar como um índice relativo, desde o plantio |
| Servo | Faz o papel da válvula que libera a água |
| Botão azul | Guarda a linha de base no dia do plantio |
| Tela LCD 20x4 | Mostra o estado, a orientação e os números |
| LEDs verde, amarelo e vermelho | Mostram o estado de longe |
| Buzzer | Avisa quando o dispositivo precisa de ajuda |
| Resistores de 220 Ω | Limitam a corrente dos LEDs |

## Estados
| Estado | Quando | LEDs | Válvula e buzzer | Tela |
|---|---|---|---|---|
| SOLO OK | Solo com 60% ou mais | Verde fixo | Fechada, mudo | Muda bem cuidada |
| ATENCAO | Solo acima do limite de seco | Amarelo fixo | Fechada, mudo | Solo secando |
| REGANDO | Solo seco, sem sol forte | Verde piscando | Abre por um tempo | Regando a muda |
| AGUARDANDO | Solo seco, com sol forte | Amarelo piscando | Fechada, mudo | Esperando o sol |
| ALERTA | Solo segue seco depois de 2 regas | Vermelho fixo | Fechada, bipe a cada 5 s | Sem agua? Peca ajuda |
| ERRO | Temperatura fora de −10 a 60 °C | Vermelho piscando | Fechada, mudo | Verificar sensor |

## Por que esses limites
São decisões do projeto e precisam de teste com uma muda de verdade:
- **60% e 30% de umidade:** separam o solo bom, o solo secando e o solo seco.
- **Calor de 36 °C:** com calor forte, o solo seca mais rápido, então o limite de seco sobe de 30% para 40%. É o mesmo limite de `python/main.py` e de `matematica/`.
- **Luz de 90%:** com sol forte, a rega perde mais água por evaporação, então o dispositivo espera.
- **2 regas sem resultado:** indicam falta de água, vazamento ou defeito, e aí só uma pessoa resolve.

Na demonstração, a rega dura 8 segundos e a pausa, 10. Na rua, esses tempos seriam minutos e horas.

## Como o código decide
1. A cada 2 segundos, `lerSensores()` lê todos os sensores.
2. `temperaturaValida()` descarta o que estiver fora do intervalo. Sem temperatura confiável, o dispositivo não rega.
3. `adicionarNaMedia()` faz a média das 3 últimas leituras, para um valor isolado não mudar o estado.
4. `decidirEstado()` junta solo, calor e luz e escolhe o estado.
5. `atualizarValvula()` e `atualizarRespostas()` agem usando `millis()`, sem travar o programa.

## O que ele diz sobre o impacto
No dia do plantio, alguém aperta o botão azul. A partir daí, a última linha da tela mostra quanto o calor e o ar mudaram desde esse dia, e o Serial Monitor registra os números.

Isso é um **acompanhamento, não uma prova de impacto**:
- O sensor de gás é barato e dá só um índice relativo. Não mede partículas nem calcula o índice oficial de qualidade do ar, que usa outras medições.
- Clima, estação e trânsito também mudam esses números. Uma comparação justa pediria um segundo dispositivo em um lugar parecido, sem a árvore.
- Árvores nem sempre melhoram o ar. Uma [revisão de 2017](https://core.ac.uk/download/226714826.pdf) indica que copas densas podem piorar o ar em ruas estreitas, porque atrapalham a dispersão dos poluentes.
- A linha de base fica na memória temporária: se a energia acabar, ela se perde. Um dispositivo real precisaria gravá-la.

O indicador mais direto continua sendo saber se a muda segue viva depois de um ano.

## Roteiro do vídeo (até 5 minutos)
1. **A ideia (1 min):** quem é o cidadão, o problema em uma frase, onde o dispositivo fica e os ODS.
2. **O circuito (1 min):** cada componente e por que está ali. Digam que o potenciômetro faz o papel do sensor de solo e o servo, o da válvula.
3. **A lógica (1 min):** limites e estados, mostrando `decidirEstado()` e `adicionarNaMedia()`.
4. **A simulação (2 min):** com o Serial Monitor aberto, mudem os valores e esperem cerca de 6 segundos a cada mudança, o tempo da média:
   - Solo alto: SOLO OK.
   - Solo em 50%: ATENCAO.
   - Solo em 20% com pouca luz: REGANDO, e o servo gira.
   - Solo em 20% com a luz no máximo: AGUARDANDO.
   - Solo seco por duas regas: ALERTA.
   - Temperatura em 70 °C: ERRO.
   - Apertem o botão azul e mudem o ar e a temperatura para mostrar a comparação com a base.
