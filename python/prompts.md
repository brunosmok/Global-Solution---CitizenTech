# Registro de uso de IA

A IA pode ser usada como copiloto, para aprender e revisar. Registrem aqui **todos** os prompts usados nesta parte do projeto.
Código que a equipe não sabe explicar não pontua.

Se a equipe não usou IA, escreva: **Não utilizamos IA nesta parte.**

---

## Prompt 1

- **Quem usou:** Bruno Smoktunowicz Baptista
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** reestruturar em funções os loops while True que concentravam quase toda a lógica do programa

**Prompt enviado:**

```
Tenho um programa em Python com dois módulos (planejamento pré-plantio e
dashboard pós-plantio do Guardião da Muda, com ESP32). Hoje, quase toda a
lógica está dentro de loops while True dentro do programa principal, e o
código está difícil de ler.

Quero que você REESTRUTURE esses loops em funções, sem mudar o
comportamento do programa. Cada loop deve virar uma função com um nome
claro e uma única responsabilidade. Não adicione novas funcionalidades e
não altere as regras de cálculo.

```

**O que aproveitamos da resposta:** Os blocos dentro dos loops viraram funções com nomes claros e uma responsabilidade cada, no main.py inteiro (Partes 2, 3 e 4).

**O que mudamos ou descartamos, e por quê:** Nenhuma regra de negócio foi alterada e nenhuma funcionalidade nova foi criada: a lógica é da equipe e a IA só reorganizou o código existente. A equipe revisou, testou e entendeu o código final antes de entregar.

---

## Prompt 2

- **Quem usou:** Bruno Smoktunowicz Baptista
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** separar o loop de cada módulo em executar_pre() e executar_pos(), cada um com seu menu e a opção de voltar

**Prompt enviado:**

```
Agora separe o loop do módulo de Pré-plantio em uma função chamada
executar_pre(), e o loop do módulo de Pós-plantio em uma função chamada
executar_pos(). Cada uma deve conter o seu próprio menu, o seu próprio
loop e a opção de voltar ao Menu Principal.

Mantenha o uso de match/case.
```

**O que aproveitamos da resposta:** As funções executar_pre() e executar_pos(), cada uma com seu menu, seu loop e a opção de voltar ao Menu Principal, na Parte 3, mantendo match/case (Python 3.10+).

**O que mudamos ou descartamos, e por quê:** Nenhuma regra de negócio foi alterada e nenhuma funcionalidade nova foi criada: a lógica é da equipe e a IA só reorganizou o código existente. A equipe revisou, testou e entendeu o código final antes de entregar.

---

## Prompt 3

- **Quem usou:** Bruno Smoktunowicz Baptista
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** extrair o conteúdo de cada opção dos menus para funções próprias

**Prompt enviado:**

```
Dentro de executar_pre() e executar_pos(), algumas opções ainda têm muito
código. Extraia o conteúdo de cada opção para uma função própria, por
exemplo:
- exibir a tabela de espaçamentos
- exibir o resumo dos plantios registrados
- exibir as leituras diárias do sensor
- exibir o resumo e os avisos da planta
- comparar com a linha de base
- consultar os dados de um bairro
- registrar uma leitura manual

Assim, cada opção do menu deve chamar apenas uma função.
```

**O que aproveitamos da resposta:** Funções como mostrar_espacamentos(), mostrar_resumo_pre(), mostrar_leituras(), mostrar_resumo_pos(), comparar_com_base(), consultar_bairro() e registrar_leitura(), na Parte 4.

**O que mudamos ou descartamos, e por quê:** Nenhuma regra de negócio foi alterada e nenhuma funcionalidade nova foi criada: a lógica é da equipe e a IA só reorganizou o código existente. A equipe revisou, testou e entendeu o código final antes de entregar.

---

## Prompt 4

- **Quem usou:** Bruno Smoktunowicz Baptista
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** deixar a main() enxuta, só com o Menu Principal e o direcionamento para os módulos

**Prompt enviado:**

```
Agora deixe a função main() o menor possível. Ela deve apenas:
1. exibir o Menu Principal (Pré-plantio, Pós-plantio ou Encerrar);
2. chamar executar_pre() ou executar_pos() conforme a escolha;
3. encerrar o programa com uma mensagem final.

Não deve haver cálculos nem regras de negócio dentro de main().
```

**O que aproveitamos da resposta:** A main() na Parte 3, que só exibe o Menu Principal, chama executar_pre() ou executar_pos() e encerra com a mensagem final.

**O que mudamos ou descartamos, e por quê:** Nenhuma regra de negócio foi alterada e nenhuma funcionalidade nova foi criada: a lógica é da equipe e a IA só reorganizou o código existente. A equipe revisou, testou e entendeu o código final antes de entregar.

---

## Prompt 5

- **Quem usou:** Bruno Smoktunowicz Baptista
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** conferir se o comportamento do programa não mudou depois da reestruturação

**Prompt enviado:**

```
Revise o código reestruturado e confirme que:
- as regras de espaçamento (4 m, 7 m e 10 m) e as faixas de área
  continuam iguais;
- a classificação da muda (SOLO OK, ATENÇÃO, REGANDO, AGUARDANDO, ALERTA e
  ERRO) continua igual;
- nenhuma variável global foi perdida;
- as opções de voltar ao Menu Principal continuam funcionando.

Se encontrar qualquer diferença de comportamento, aponte antes de corrigir.
```

**O que aproveitamos da resposta:** A conferência das regras de espaçamento, das faixas de área, dos estados da muda, das variáveis globais e das opções de voltar ao Menu Principal.

**O que mudamos ou descartamos, e por quê:** Nenhuma regra de negócio foi alterada e nenhuma funcionalidade nova foi criada: a lógica é da equipe e a IA só reorganizou o código existente. A equipe revisou, testou e entendeu o código final antes de entregar.

---