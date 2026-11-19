# Registro de uso de IA

A IA pode ser usada como copiloto, para aprender e revisar. Registrem aqui **todos** os prompts usados nesta parte do projeto.
Código que a equipe não sabe explicar não pontua.

Se a equipe não usou IA, escreva: **Não utilizamos IA nesta parte.**

---

## Prompt 1

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** organizar os requisitos em RF, RNF e RN, cada um com identificador, descrição, categoria e justificativa

**Prompt enviado:**

```
Estamos fazendo a especificação da ArborIA para Software & Total
Experience Design. Hoje os requisitos estão em três parágrafos, um para
funcionais, um para não funcionais e um para regras de negócio.

A partir do que o site (mapa, /plantar e /tecnico) e o Guardião da Muda
já fazem, organize os requisitos em uma tabela com: identificador (RF01,
RNF01, RN01...), descrição clara e que dê para verificar, categoria e
uma justificativa ligada ao problema, ao cidadão ou ao escopo.

Use os limites do Guardião que a equipe definiu (60%, 30%, 40% com
36 °C, luz de 90%, 2 regas e temperatura de -10 a 60 °C). Não invente
funções que o site ou o Guardião não têm.
```

**O que aproveitamos da resposta:** O formato da tabela com ID, descrição, categoria e justificativa, e a separação dos requisitos do site e dos requisitos do Guardião da Muda (RF08 a RF10 e RN06 a RN09).

**O que mudamos ou descartamos, e por quê:** As regras, os limites e os pesos da nota são da equipe. A equipe conferiu cada requisito no site e no Wokwi, tirou os que não dava para verificar e reescreveu as justificativas com as palavras do grupo.

---

## Prompt 2

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** escrever critérios de aceite observáveis para as histórias do backlog

**Prompt enviado:**

```
Este é o nosso product backlog, com as histórias das personas Pedro,
Jorge, Matheus, Roberto, Melina e Marta, e uma história nova para o
Guardião da Muda. Dê um ID para cada uma (PB01 a PB07) e escreva de 2 a
3 critérios de aceite para cada história.

Cada critério precisa descrever algo que dá para ver na tela do site ou
na simulação do Wokwi, como um texto, uma camada do mapa, um LED ou o
servo. Não mude as histórias nem as personas.
```

**O que aproveitamos da resposta:** Os IDs PB01 a PB07 e o formato "Aceito quando", com critérios que dá para testar no site e no Wokwi.

**O que mudamos ou descartamos, e por quê:** As personas e as histórias são da equipe. A equipe testou cada critério no site publicado e na simulação, trocou os nomes de botões e camadas pelos que aparecem de verdade na tela e descartou critérios que dependiam de algo que o site não mostra.

---

## Prompt 3

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** listar o que está dentro e fora do escopo, com premissas e limitações

**Prompt enviado:**

```
Com base no problema, no cidadão e no objetivo da ArborIA, monte uma
lista do que está dentro e do que está fora do escopo, mais as
premissas e as limitações da solução. Inclua o Guardião da Muda, que é
um protótipo simulado no Wokwi.

Lembre que o sistema não prevê alagamento nem queda de temperatura e
que plantar em área pública depende da Fundação Parques e Jardins.
```

**O que aproveitamos da resposta:** A divisão em dentro e fora do escopo, premissas e limitações, em listas curtas.

**O que mudamos ou descartamos, e por quê:** A equipe ajustou as listas ao que o projeto entrega de fato e tirou do deck a frase de que o sistema não faz "intervenções físicas no solo", porque o Guardião rega a muda sozinho.

---

## Prompt 4

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** acrescentar esforço e dependências à priorização MoSCoW

**Prompt enviado:**

```
Esta é a nossa priorização MoSCoW, com a ordem e a justificativa de cada
item. Sem mudar a ordem nem a classificação, sugira para cada item um
esforço relativo (baixo, médio ou alto) e de quais outros itens, dados
ou regras ele depende. Coloque também onde entra a história do Guardião
da Muda e o que fica como Won't have.
```

**O que aproveitamos da resposta:** O campo de esforço e de dependências em cada item e a lista de Won't have.

**O que mudamos ou descartamos, e por quê:** A ordem e a classificação MoSCoW são da equipe. A equipe decidiu colocar o Guardião da Muda como Should have, porque ele só gera valor depois que a muda está plantada, e revisou cada estimativa de esforço.

---

## Prompt 5

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** revisar os slides contra a avaliação e diagramar os slides novos no mesmo visual

**Prompt enviado:**

```
Compare os nossos slides com os critérios de avaliação de Software &
Total Experience Design (escopo, requisitos, backlog e priorização) e
aponte o que falta. Depois, monte os slides novos no mesmo visual dos
atuais, com as mesmas cores, fontes e grade.

O slide de uso de IA precisa bater com os prompts.md das outras pastas.
```

**O que aproveitamos da resposta:** A lista do que faltava em cada critério e a diagramação dos slides novos no visual do deck.

**O que mudamos ou descartamos, e por quê:** Os textos de contexto, da proposta e dos benefícios continuam os da equipe. A equipe conferiu o slide de uso de IA com os prompts.md de frontend, edge, matematica e python e revisou todos os slides antes de entregar.

---
