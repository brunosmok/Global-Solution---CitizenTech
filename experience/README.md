# Experiência · Da necessidade à especificação

Parte de **Software & Total Experience Design** da CitizenTech **ArborIA · Guardião da Muda**.

O deck completo está em [`Projeto ArborIA — Global Solution.pdf`](Projeto%20ArborIA%20—%20Global%20Solution.pdf). Este arquivo reúne a especificação em texto: escopo, requisitos, product backlog e priorização.

## 1. Escopo da solução

**Problema e contexto.** O Rio de Janeiro tem bairros quentes e com poucas árvores. O morador não sabe onde plantar, qual muda usar nem a quem pedir, e a cidade precisa decidir onde plantar primeiro com mudas e orçamento limitados.

**Cidadão beneficiado e necessidade.** Quem mora em bairro quente e com poucas árvores e quer mais sombra na rua. Em segundo lugar, quem planeja a arborização da cidade.

**Objetivo e solução.** A ArborIA é uma plataforma web que cruza dados de satélite, Censo e mapas, dá uma nota de prioridade de 0 a 100 a cada área e leva o morador ao ponto prioritário mais próximo, com orientação sobre mudas e o caminho para pedir o plantio à Prefeitura. Depois do plantio, o Guardião da Muda (ESP32) mede o solo, a luz e o calor ao lado da muda e rega sozinho, sem internet.

| Dentro do escopo | Fora do escopo |
|---|---|
| Mapas de calor e de cobertura de copa do Rio | Previsão ou simulação de alagamentos |
| Nota de prioridade de plantio por área | Plantio ou qualquer intervenção em área pública feita pelo sistema |
| Área prioritária mais próxima do morador, por geolocalização | Aprovar plantios: isso é da Prefeitura |
| Orientação sobre mudas e regras da Prefeitura | Medir o efeito real do plantio no calor ou no ar |
| Guardião da Muda: medir solo, luz e calor e regar a muda (simulado no Wokwi) | Cadastro de usuários e armazenamento de dados pessoais |

**Premissas e limitações.**
- Os dados de calor, copa e população vêm de fontes públicas (Landsat 8 e 9, Meta, ESA WorldCover, IBGE, OpenStreetMap) e podem estar defasados.
- A nota é um diagnóstico orientativo, não uma decisão. Plantios em área pública dependem dos órgãos competentes.
- A associação entre copa e calor compara lugares como estão hoje e não prova quanto um plantio vai esfriar.
- O Guardião da Muda foi simulado. Os limites de solo, calor e luz precisam de teste com uma muda de verdade.
- As leituras do sensor e dos bairros usados nos programas são simuladas pela equipe.

## 2. Requisitos

| ID | Descrição | Categoria | Justificativa |
|---|---|---|---|
| RF01 | Permitir que o cidadão use a geolocalização do aparelho para consultar a área prioritária de plantio mais próxima | RF | É uma ação oferecida pelo sistema e responde à necessidade de saber onde plantar |
| RF02 | Exibir mapa interativo do calor de superfície do Rio | RF | Mostra ao morador o problema do calor na região dele |
| RF03 | Exibir mapa interativo da cobertura de árvores | RF | Mostra onde falta sombra e apoia a escolha do local |
| RF04 | Calcular e mostrar uma nota de prioridade de 0 a 100 para cada área, com critérios ponderados | RF | Transforma dados complexos em uma decisão simples sobre onde plantar primeiro |
| RF05 | Orientar o morador sobre espécies de mudas, época de plantio e como fazer o pedido à Prefeitura | RF | Resolve a falta de informação de quem nunca plantou uma árvore |
| RF06 | Medir solo, luz e temperatura da muda, decidir entre 6 estados e regar sozinho quando o solo está seco | RF | Cuida da muda no primeiro ano, quando ela mais corre risco, e atende o Guardião da Muda |
| RNF01 | Funcionar em celular e computador, nos principais navegadores, sem exigir cadastro | RNF | Usabilidade e inclusão: o cidadão real não é especialista |
| RNF02 | Manter a localização do cidadão só no aparelho dele | RNF | Segurança e privacidade dos dados |
| RNF03 | Ter letras legíveis, bom contraste, modo claro e escuro e respeitar a preferência de menos animações | RNF | Acessibilidade para quem tem mais dificuldade de usar a solução |
| RNF04 | O Guardião da Muda deve decidir e agir sem internet e ignorar leituras de temperatura inválidas | RNF | Confiabilidade onde a conectividade é fraca |
| RN01 | As sugestões de mudas seguem as normas de arborização urbana do município | RN | Regra do serviço: evita orientação que contrarie a lei |
| RN02 | Plantios em área pública dependem da aprovação da Prefeitura; o sistema só orienta | RN | Restrição legal que define o limite da plataforma |
| RN03 | Depois de 2 regas sem resultado, o Guardião da Muda pede ajuda e para de regar | RN | Regra do serviço: indica falta de água, vazamento ou defeito que só uma pessoa resolve |

## 3. Product backlog

| ID | Perfil | História | Critérios de aceite |
|---|---|---|---|
| US01 | Morador afetado | Como morador afetado, quero visualizar o mapa térmico, para compreender o estresse térmico da minha região | Ao abrir o mapa, as áreas aparecem coloridas pelo calor, com legenda; ao tocar em uma área, mostra a diferença de temperatura |
| US02 | Cidadã | Como cidadã, quero ver a nota de prioridade (0 a 100) do meu setor urbano, para saber a urgência de arborização local | Ao selecionar uma área ou bairro, o sistema mostra a nota de 0 a 100 e a posição em relação às outras áreas |
| US03 | Cidadão engajado | Como cidadão engajado, quero ativar a geolocalização, para encontrar a área prioritária de plantio mais próxima e começar a fazer a diferença | Ao permitir a localização, o sistema mostra a área prioritária mais próxima e a distância; se a pessoa recusar, ela pode escolher o bairro |
| US04 | Morador | Como morador, quero visualizar o mapa de cobertura arbórea da cidade, para ver como está o déficit de vegetação no meu bairro | O mapa mostra a copa de cada área em %, com legenda e a mesma escolha de bairro do mapa térmico |
| US05 | Leigo | Como leigo, quero receber orientações sobre espécies de mudas, para realizar o plantio de forma correta e segura | Para a área escolhida, o sistema mostra a muda indicada, a melhor época e os cuidados do primeiro ano |
| US06 | Moradora | Como moradora, quero consultar as diretrizes e regras de aprovação da Prefeitura na aba de plantio, para garantir que minha intervenção em área pública seja legal | A aba de plantio mostra as regras e o aviso de que a aprovação é da Prefeitura, com o caminho para o pedido (1746) |
| US07 | Quem cuida de uma muda | Como quem plantou uma muda, quero ser avisado quando o solo estiver seco, para que ela não morra no primeiro ano | O Guardião da Muda mostra o estado na tela e nos LEDs; com o solo seco e sem sol forte ele rega; depois de 2 regas sem resultado, pede ajuda com LED vermelho e bipe |

## 4. Priorização

**Método:** MoSCoW, aplicado a todos os itens e ordenado por benefício ao cidadão, urgência para o problema, esforço e dependências.

| Ordem | Item | MoSCoW | Justificativa | Esforço e dependências |
|---|---|---|---|---|
| 1 | US01 · Mapa térmico | Must | Base de todo o diagnóstico: sem ele o morador não enxerga o problema | Médio. Depende dos dados de satélite já processados |
| 2 | US02 · Nota de prioridade | Must | É a inteligência central: traduz dados complexos em uma decisão | Médio. Depende do mapa de calor e da cobertura de copa |
| 3 | US03 · Geolocalização | Must | É a ação direta: leva o morador ao ponto de plantio mais próximo | Médio. Depende da nota (US02) para saber qual área é prioritária |
| 4 | US04 · Mapa de cobertura | Should | Complementa o mapa térmico, mas o sistema já funciona sem ele | Baixo. Reaproveita os dados e a estrutura do mapa térmico |
| 5 | US05 · Orientação sobre mudas | Should | Alto valor prático e educativo para o leigo | Baixo. Texto e tabelas, sem dependência técnica |
| 6 | US07 · Guardião da Muda | Should | Cuida da muda depois do plantio e liga o projeto ao dispositivo | Alto. Depende de circuito, código embarcado e teste com muda real |
| 7 | US06 · Regras da Prefeitura | Could | É importante para a segurança jurídica, mas o morador pode consultar a regra fora do site no início | Baixo. Depende de manter o texto atualizado com a Prefeitura |

## 5. Uso de IA

Ferramenta: Claude (Anthropic). A IA ajudou a organizar os requisitos em RF, RNF e RN, a estruturar o Product Backlog e a priorização MoSCoW, a redigir os slides e a apoiar a ideação do roteiro do pitch. A equipe revisou tudo e definiu o problema, o cidadão, o escopo e a versão final dos itens. O registro está em [`prompts.md`](prompts.md).

Texto sugerido para o slide "Como a IA foi utilizada" do deck, para ficar igual aos registros de cada pasta:

| Parte | Como a IA foi usada |
|---|---|
| Produto e Experiência | Organizar requisitos, estruturar o Product Backlog e a priorização, redigir os slides e apoiar a ideação do roteiro do pitch |
| Site (Front-end e Web) | Gerar o site de mapeamento publicado na Vercel, escrever a sala 3D em TypeScript, converter funções do Python para JavaScript e revisar a acessibilidade |
| Python | Reestruturar o programa em funções, sem mudar as regras |
| Edge Computing | Escrever a base do código do Guardião da Muda, colocar nele as regras definidas pela equipe e montar o roteiro de testes no Wokwi. Os limites e os estados vieram das pesquisas da equipe |
| Matemática | Sugerir a estrutura do `modelo.py`, levar os dados para dentro dele e auxiliar no relatório. Os modelos, as fórmulas e os valores são da equipe |

## Equipe

- Anauã Paulo Campolina Vieitas Lima · RM 576103
- Bruno Smoktunowicz Baptista · RM 574739
- Caio Medeiros Machado · RM 575113
