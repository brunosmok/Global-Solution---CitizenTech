# ArborIA: Guardião da Muda

Um ecossistema de software integrado desenvolvido em Python para auxiliar no planejamento e no monitoramento do plantio de árvores em áreas urbanas e domésticas. O projeto atua em duas frentes dentro de um único sistema: **Pré-plantio** (cálculos e planejamento) e **Pós-plantio** (dashboard de monitoramento integrado ao hardware Arduino/ESP32).

## Módulos do Sistema

Ao iniciar o programa, um Menu Principal permite escolher qual dos dois módulos abaixo você deseja executar.

### 1. Planejamento de Arborização (Pré-Plantio)
Módulo executado **antes** de colocar a muda na terra. A partir do porte da árvore (ou da largura do espaço livre) e da quantidade de mudas, ele calcula o espaçamento ideal, a área total de solo necessária, classifica o tamanho da obra e mostra dicas de benefícios ambientais.

**Regras principais (Pré-plantio):**

| Porte   | Espaçamento | Espaço livre indicado |
|---------|-------------|-----------------------|
| Pequeno | 4,0 m       | 150 a 249 cm          |
| Médio   | 7,0 m       | 250 a 399 cm          |
| Grande  | 10,0 m      | a partir de 400 cm    |

| Área total       | Classificação                                  |
|------------------|------------------------------------------------|
| até 500 m²       | Plantio doméstico (quintal, praça pequena)     |
| até 2.000 m²     | Plantio médio (condomínio, rua arborizada)     |
| até 10.000 m²    | Plantio grande (parque, sítio)                 |
| acima de 10.000 m² | ALERTA: acima de 1 hectare, exige planejamento |

### 2. Dashboard Pós-Plantio (Monitoramento)
Módulo executado **depois** do plantio. Ele atua como o "cérebro" de análise, recebendo dados dos sensores físicos do Guardião da Muda (ESP32) que fica no jardim. 

**Funcionalidades do Painel:**
- Recebe leituras manuais ou coladas do Monitor Serial referentes à Umidade do Solo, Temperatura, Luz e Qualidade do Ar.
- Classifica o estado da muda com a mesma lógica embarcada no microcontrolador (ex: `SOLO OK`, `ATENÇÃO`, `REGANDO`, `ALERTA`).
- Mantém um histórico diário e compara os dados climáticos atuais com a "Linha de Base" do dia do plantio.
- Permite consultar dados simulados do microclima de bairros do Rio de Janeiro.

## Requisitos

- **Python 3.10 ou superior** (o código usa a estrutura de controle `match/case`).
- Nenhuma biblioteca externa necessária.

Para conferir sua versão de Python, digite no terminal:
```bash
python3 --version
```

## Estrutura da Pasta

```text
.
├── main.py       # Sistema central unificado (Módulos Pré e Pós-plantio)
└── README.md     # Este arquivo de documentação
```

## Como rodar

1. Abra um terminal nesta pasta do projeto.
2. Execute o sistema principal:
```bash
python main.py
```

3. O sistema exibirá o **Menu Principal**. Digite `1` para acessar a calculadora de planejamento ou `2` para acessar o painel de monitoramento dos sensores.
4. Siga as instruções dos submenus interativos. Para encerrar ou trocar de módulo, use as opções de voltar ou sair.