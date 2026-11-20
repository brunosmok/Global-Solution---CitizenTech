# ArborIA

> Global Solution 2026.2 · CitizenTech · Engenharia de Software 1º ano · FIAP Rio de Janeiro

Site publicado: [arboria-ai.vercel.app](https://arboria-ai.vercel.app)

## Vídeo do pitch

[![Assista ao pitch da ArborIA no YouTube](https://img.youtube.com/vi/Ze6i0NY8RRQ/hqdefault.jpg)](https://youtu.be/Ze6i0NY8RRQ)

**Assista:** [youtu.be/Ze6i0NY8RRQ](https://youtu.be/Ze6i0NY8RRQ)

## Ficha da CitizenTech

| Campo | Resposta da equipe |
|---|---|
| **Nome da CitizenTech** | ArborIA |
| **Cidade e bairro** | Rio de Janeiro, com análise de toda a cidade. Bairro de referência: Cosmos, onde fica a área de nota mais alta |
| **Cidadão beneficiado** | Quem mora em bairro quente e com poucas árvores e quer mais sombra na rua. Em segundo lugar, quem planeja a arborização da cidade |
| **Problema, em uma frase** | Quem mora em áreas quentes do Rio não sabe onde plantar, qual muda usar nem a quem pedir, e a cidade precisa decidir onde plantar primeiro com mudas e orçamento limitados |
| **Como funciona** | O site cruza satélite, Censo e mapas, dá uma nota a cada área e leva o morador ao ponto prioritário mais próximo, com muda, época e pedido pronto para o 1746. Depois do plantio, o Guardião da Muda mede o solo, rega sozinho e acompanha o ar e o calor |
| **O que cada parte faz** | Python: recebe as leituras da muda, calcula o resumo e decide o aviso. Matemática: calcula a janela de calor forte e quantas árvores plantar. Edge: o Guardião da Muda, um ESP32 no Wokwi que mede, decide e rega sem internet. Site (Front-end e Web Development): a página que o cidadão vê e as interações em JavaScript. Experiência: escopo, requisitos, backlog e priorização. Pitch: vídeo de 3 minutos ([youtu.be/Ze6i0NY8RRQ](https://youtu.be/Ze6i0NY8RRQ)) |
| **Link do repositório** | [github.com/brunosmok/Global-Solution---CitizenTech](https://github.com/brunosmok/Global-Solution---CitizenTech) |
| **Indicador de impacto** | Pedidos de plantio abertos a partir do site, mudas vivas depois de um ano e cobertura de árvores nas 473 áreas que seguem no topo da lista, hoje em 4,7%. Ainda não medimos o efeito do projeto |
| **ODS conectados** | ODS 3, ODS 11 e ODS 13 (veja abaixo como o projeto contribui com cada um) |

### Como contribuímos com os ODS

| ODS | Meta | Como a ArborIA contribui |
|---|---|---|
| **3 · Saúde e bem-estar** | 3.9 e 3.d | O calor extremo faz mal à saúde, sobretudo de idosos e de quem trabalha na rua. A ArborIA indica onde mais sombra faz diferença e mostra as horas de calor forte |
| **11 · Cidades e comunidades sustentáveis** | 11.7 | Ajuda a levar árvores e áreas verdes primeiro aos bairros que mais precisam, com a conta aberta para quem decide |
| **13 · Ação contra a mudança global do clima** | 13.1 e 13.3 | Apoia a adaptação da cidade às ondas de calor e explica ao morador, em linguagem simples, por que plantar e onde |

### O que cada parte faz

| Parte | Disciplina | Pasta | O que faz |
|---|---|---|---|
| Lógica | Computational Thinking with Python | [`python/`](python/) | Recebe as leituras do Guardião da Muda, classifica cada uma em faixas, calcula o resumo e decide o aviso. Também calcula o espaço para o plantio |
| Matemática | Differentiated Problem Solving | [`matematica/`](matematica/) | Modela o calor ao longo do dia e o crescimento da copa para decidir quando evitar a rega e quantas árvores plantar em Cosmos |
| Sensor | Edge Computing & Computer Systems | [`edge/`](edge/) | Guardião da Muda: ESP32 que mede solo, luz, calor e ar e rega sozinho, sem internet ([projeto no Wokwi](https://wokwi.com/projects/480444508590213121)) |
| Interface | Front-end Design | [`frontend/`](frontend/) | A landing page em HTML e CSS, com menu, seções, imagens e rodapé |
| Experiência | Software & Total Experience Design | [`experience/`](experience/) | Escopo, requisitos, product backlog e priorização |
| Interação | Web Development | [`frontend/js/`](frontend/js/) | O JavaScript da página: modo claro e escuro, seletor de bairro, planejamento e acompanhamento da muda e menu do celular |
| Pitch | Storytelling & Inspiração Empreendedora | — | Vídeo de até 3 minutos no YouTube: [youtu.be/Ze6i0NY8RRQ](https://youtu.be/Ze6i0NY8RRQ) (link também enviado no Teams da disciplina) |

Uso de IA no projeto: [`AI.md`](AI.md). Prompts de cada parte: `prompts.md` dentro de cada pasta (a etapa de dados fica no repositório do site).

## Equipe

| Nome completo | RM |
|---|---|
| Anauã Paulo Campolina Vieitas Lima | 576103 |
| Bruno Smoktunowicz Baptista | 574739 |
| Caio Medeiros Machado | 575113 |

Também em [`Integrantes.md`](Integrantes.md).
