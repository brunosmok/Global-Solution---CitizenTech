# Registro de uso de IA

A IA pode ser usada como copiloto, para aprender e revisar. Registrem aqui **todos** os prompts usados nesta parte do projeto.
Código que a equipe não sabe explicar não pontua.

Se a equipe não usou IA, escreva: **Não utilizamos IA nesta parte.**

---

## Prompt 1

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** escrever a base do código do Guardião da Muda para o ESP32 no Wokwi

**Prompt enviado:**

```
Estamos criando o Guardião da Muda, um dispositivo com ESP32 que fica ao
lado de uma muda recém-plantada e funciona sem internet. Ele vai ter:
- um potenciômetro no papel do sensor de umidade do solo;
- um LDR para a luz e um DHT22 para a temperatura;
- um sensor de gás para acompanhar o ar;
- um servo no papel da válvula de água;
- LEDs verde, amarelo e vermelho, um buzzer, um botão e uma tela LCD 20x4 I2C.

Escreva a BASE do sketch.ino para o Wokwi: os pinos, a leitura dos
sensores em setup() e loop(), e a escrita na tela e no Serial Monitor.
Use millis() no lugar de delay(), para não travar o programa. Ainda não
coloque as regras de rega: elas virão da equipe.
```

**O que aproveitamos da resposta:** A estrutura do sketch.ino: os pinos, o setup(), o loop() com millis(), a leitura dos sensores em lerSensores() e a escrita na tela e no Serial Monitor.

**O que mudamos ou descartamos, e por quê:** Os nomes das funções e das variáveis foram trocados para português, e os comentários foram reescritos pela equipe. A equipe revisou e entendeu o código antes de seguir.

---

## Prompt 2

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** colocar no código as regras que a equipe definiu a partir das próprias pesquisas

**Prompt enviado:**

```
A equipe pesquisou e definiu as regras do Guardião da Muda:
- solo com 60% ou mais está bom; abaixo de 30% precisa regar;
- com calor de 36 °C ou mais, o limite de seco sobe para 40%;
- com luz de 90% ou mais, ele espera, porque a água evapora mais;
- depois de 2 regas sem resultado, ele pede ajuda;
- temperatura fora de -10 a 60 °C é erro do sensor, e aí ele não rega.

Os estados são SOLO OK, ATENCAO, REGANDO, AGUARDANDO, ALERTA e ERRO.
Coloque essas regras em uma função decidirEstado() e mostre mais de uma
forma de evitar que uma leitura isolada mude o estado.
```

**O que aproveitamos da resposta:** A função decidirEstado() com os seis estados e as opções para suavizar as leituras. A equipe avaliou as opções geradas e escolheu a média das 3 últimas leituras, em adicionarNaMedia().

**O que mudamos ou descartamos, e por quê:** Os limites, os estados e o que cada um faz nos LEDs, no buzzer e na válvula vieram das pesquisas da equipe, não da IA. As outras opções de suavização foram descartadas por serem mais difíceis de explicar e de testar na demonstração.

---

## Prompt 3

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** testar os estados lógicos do Guardião da Muda na simulação do Wokwi

**Prompt enviado:**

```
Monte um roteiro de testes para a simulação no Wokwi que passe por todos
os estados: SOLO OK, ATENCAO, REGANDO, AGUARDANDO, ALERTA e ERRO. Para
cada um, diga em que valor colocar o potenciômetro, o LDR e o DHT22, e o
que deve aparecer na tela, nos LEDs e no Serial Monitor.

Inclua também o teste do botão que salva a linha de base. Se algum estado
não puder ser alcançado com o código atual, aponte antes de corrigir.
```

**O que aproveitamos da resposta:** O roteiro de testes, que a equipe rodou no Wokwi estado por estado e que virou a parte da simulação do roteiro do vídeo, no README.md.

**O que mudamos ou descartamos, e por quê:** A equipe ajustou os tempos de espera do roteiro depois de ver na simulação que a média leva cerca de 6 segundos para mudar o estado. Nenhuma regra foi alterada nos testes.

---
