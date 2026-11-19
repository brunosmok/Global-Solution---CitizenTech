# Uso de IA no projeto

## IA como ferramenta de desenvolvimento

Usamos o **Claude (Anthropic)** como copiloto, para escrever, converter e revisar. Os prompts de cada parte estão no `prompts.md` da pasta correspondente.

| Parte | Como a IA ajudou | Prompts |
|---|---|---|
| Análise de dados (gera os mapas e a nota do site) | Escrever os scripts, os testes e a documentação das limitações. O código fica no repositório do site, fora deste | No repositório do site |
| Site de mapeamento (Vercel) | Gerar o site completo, a partir dos dados e das regras da equipe | `frontend/prompts.md`, Prompt 3 |
| Página inicial (`frontend/`) | Escrever a sala 3D em TypeScript, converter funções do Python para JavaScript, escrever as páginas e as interações, revisar a acessibilidade e deixar o código com nomes em português e comentários, sem mudar o funcionamento | `frontend/prompts.md` |
| Programa em Python (`python/`) | Reestruturar o programa em funções, sem mudar as regras, e revisar o README | `python/prompts.md` |
| Sensor (`edge/`) | Escrever a base do código e o circuito (`diagram.json`) do Guardião da Muda, colocar nele as regras definidas pela equipe e montar o roteiro de testes no Wokwi | `edge/prompts.md` |
| Matemática (`matematica/`) | Sugerir a estrutura do `modelo.py` e levar os dados para dentro dele | `matematica/prompts.md` |
| Experiência (`experience/`) e pitch | Organizar os requisitos com ID, categoria e justificativa, escrever os critérios de aceite do backlog, revisar escopo e priorização MoSCoW com esforço e dependências, diagramar os slides e apoiar a ideação do roteiro do pitch | `experience/prompts.md` e slide 08 do deck de Experience |
| Revisão final | Comparar as entregas com o PDF do desafio, listar o que faltava e atualizar os textos dos READMEs | — |

**O que a equipe definiu:** o problema, o cidadão e a ideia do Guardião da Muda; os limites de solo, calor e luz, os estados e as respostas do dispositivo, a partir das próprias pesquisas; os quatro modelos matemáticos, as fórmulas, a taxa de crescimento, os tamanhos de copa e a meta de 20%; as leituras simuladas; a cena, as cores e os textos da página inicial; e a versão final do backlog. A IA só escreveu, converteu e organizou a partir dessas decisões.

**O que continua com a equipe:** conversar com quem convive com o problema, revisar todo o conteúdo e saber explicar o código de cada entrega. A IA não fez a escuta nem substitui essa etapa.

## IA dentro do produto

| Modelo | O que faz | Situação |
|---|---|---|
| Assistente IA da página inicial (Claude Haiku, da Anthropic) | Responde perguntas sobre o calor do bairro, a nota de cada área e como pedir uma árvore. A chave fica no servidor do site publicado | Em teste. O próprio assistente avisa que pode errar |
| Random Forest | Estima a cobertura de árvores a partir do satélite Sentinel-2 | Reprovou em um de três critérios e **fica fora da nota** |
| Mask2Former pré-treinado | Lê calçada, meio-fio e postes em fotos de rua | Ficou abaixo da meta de 80% e **fica fora da nota** |

A nota de cada área usa só dados medidos e estimados de fontes públicas. A orientação de plantio para os moradores não usa IA: a conversa segue botões e regras escritas, com base nas normas da Prefeitura.
