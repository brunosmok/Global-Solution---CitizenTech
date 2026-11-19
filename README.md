ArborIA

> Global Solution 2026.2 · CitizenTech · Engenharia de Software 1º ano · FIAP Rio de Janeiro

## Ficha da CitizenTech

| Campo | Resposta da equipe |
|---|---|
| **Nome da CitizenTech** | ArborIA |
| **Cidade e bairro** | Rio de Janeiro, com análise de toda a cidade. Bairro de referência: Cosmos, onde fica a área de nota mais alta |
| **Cidadão beneficiado** | Quem mora em bairro quente e com poucas árvores e quer mais sombra na rua. Em segundo lugar, quem planeja a arborização da cidade |
| **Problema, em uma frase** | Quem mora em áreas quentes do Rio não sabe onde plantar, qual muda usar nem a quem pedir, e a cidade precisa decidir onde plantar primeiro com mudas e orçamento limitados |
| **Como funciona** | O site cruza satélite, Censo e mapas, dá uma nota a cada área e leva o morador ao ponto prioritário mais próximo, com muda, época e pedido pronto para o 1746. Depois do plantio, o Guardião da Muda mede o solo, rega sozinho e acompanha o ar e o calor |
| **O que cada parte faz** | Python - Recebe as leituras da muda, calcula o resumo e decide o aviso. / Matemática - Calcula a janela de calor forte e quantas árvores plantar. / Edge - Guardião da Muda: ESP32 no Wokwi que mede, decide e rega sem internet. / Site (Front e Web) - Página inicial, página dos moradores e área técnica. / Experience - Escopo, requisitos, backlog e priorização. / Pitch - Roteiro do vídeo de 3 minutos. / Dados - Gera os mapas e a nota usados pelo site. |
| **Link do repositório** | [https://github.com/brunosmok/](https://github.com/brunosmok/Global-Solution---CitizenTech) |
| **Indicador de impacto** | Pedidos de plantio abertos a partir do site, mudas vivas depois de um ano e cobertura de árvores nas 473 áreas que seguem no topo da lista, hoje em 4,7%. Ainda não medimos o efeito do projeto |
| **ODS conectados** | ODS 3 - Saúde e bem-estar / ODS 11 - Cidades e comunidades sustentáveis / ODS 13 - Ação contra a mudança global do clima| |

### O que cada parte faz

| Parte | Disciplina | Pasta | O que faz |
|---|---|---|---|
| Lógica | Computational Thinking with Python | `python/` | [classifica os dados e gera o aviso] |
| Matemática | Differentiated Problem Solving | `matematica/` | [o cálculo que ajuda a decidir] |
| Sensor | Edge Computing & Computer Systems | `edge/` | [o circuito que mede e reage] |
| Interface | Front-end Design | `frontend/` | [a página que o cidadão vê] |
| Experiência | Software & Total Experience Design | `experience/` | [a jornada e os requisitos] |
| Interação | Web Development | `frontend/` | [o JavaScript da página] |
| Pitch | Storytelling & Inspiração Empreendedora | — | [link do vídeo no YouTube] |

## Equipe

| Nome completo | RM |
|---|---|
| Anauã Vieitas | 576103 |
| Bruno Smoktunowicz Baptista | 574739 |
| Caio Medeiros Machado | 575113 |