# Experiência · ArborIA

Parte de **Software & Total Experience Design** da CitizenTech **ArborIA · Guardião da Muda**: a jornada do cidadão e os requisitos que orientam toda a solução.

**Integrantes:** Anauã Paulo Campolina Vieitas Lima (RM 576103), Bruno Smoktunowicz Baptista (RM 574739) e Caio Medeiros Machado (RM 575113).

## Como abrir
Abra `Projeto ArborIA — Global Solution.pdf` em qualquer leitor de PDF. Os mesmos slides foram entregues no Teams e no portal do aluno.

## O que tem na pasta
| Arquivo | O que tem |
|---|---|
| `Projeto ArborIA — Global Solution.pdf` | Os slides da especificação: escopo, requisitos, backlog, priorização e uso de IA |
| `README.md` | Este arquivo |
| `prompts.md` | Os prompts usados nesta parte do projeto |

## A solução em uma frase
A ArborIA usa imagens de satélite para mostrar onde uma árvore nova faz mais diferença no Rio e leva o morador ao ponto prioritário mais próximo ([arboria-ai.vercel.app](https://arboria-ai.vercel.app), com `/plantar` e `/tecnico`). Depois do plantio, o **Guardião da Muda**, um ESP32 preso ao lado da muda, mede o solo, o calor, a luz e o ar e rega sozinho, sem internet.

## Onde está cada critério da avaliação
| Critério | Slides | O que mostrar |
|---|---|---|
| Escopo da solução (20) | 7 a 11 | Problema, cidadão e objetivo; o Guardião da Muda; o que está dentro e fora do escopo; premissas e limitações |
| Requisitos (35) | 12 a 16 | 10 RF, 7 RNF e 9 RN, cada um com ID, descrição verificável, categoria e justificativa |
| Product Backlog (25) | 17 a 19 | 7 histórias (PB01 a PB07) com perfil, necessidade e benefício, e critérios de aceite observáveis |
| Priorização (20) | 20 a 22 | MoSCoW em todos os itens, com a ordem justificada, o esforço e as dependências de cada um |
| Uso de IA | 23 | O que a IA fez em cada parte do projeto e o que é da equipe |

## Resumo dos requisitos
| Tipo | IDs | Exemplos |
|---|---|---|
| Funcionais (RF) | RF01 a RF10 | Mapa de calor e de copa, nota de 0 a 100, área prioritária mais próxima, sugestão de muda, texto para o 1746 e, no Guardião, medir, regar e comparar com a linha de base |
| Não funcionais (RNF) | RNF01 a RNF07 | Privacidade da localização, contraste de 4,5:1, uso em tela de 375 px, Guardião sem internet e estado pela média de 3 leituras |
| Regras de negócio (RN) | RN01 a RN09 | Plantio em área pública só pelo 1746, calçada de 1,90 m (Portaria FPJ nº 03/2025), pesos da nota e limites de rega do Guardião |

## Priorização (MoSCoW)
| Ordem | Item | MoSCoW | Esforço | Depende de |
|---|---|---|---|---|
| 1 | PB01 · Pedro, mapa térmico | Must have | Médio | Imagens Landsat processadas por área |
| 2 | PB06 · Marta, nota de prioridade | Must have | Alto | PB01 e dados de copa, população e construção |
| 3 | PB02 · Jorge, área mais próxima | Must have | Médio | PB06 e a permissão de localização |
| 4 | PB03 · Matheus, cobertura arbórea | Should have | Baixo | PB01 e dados de copa |
| 5 | PB04 · Roberto, espécie de muda | Should have | Médio | PB02 e RN02 a RN04 |
| 6 | PB07 · Lúcia, Guardião da Muda | Should have | Alto | RN06 a RN09 e o circuito no Wokwi |
| 7 | PB05 · Melina, regras de aprovação | Could have | Baixo | PB04 e RN01 |

**Won't have por enquanto:** vistoria em campo, abrir o pedido direto no 1746, prever alagamento ou queda de temperatura, e fabricar e instalar o Guardião físico.

## Limites
A solução não prevê alagamento nem queda de temperatura e não autoriza plantio: em área pública, quem decide local e espécie é a Fundação Parques e Jardins, com pedido pelo 1746. A única ação física do sistema é a rega da muda feita pelo Guardião.

Registro de IA: [`prompts.md`](prompts.md).
