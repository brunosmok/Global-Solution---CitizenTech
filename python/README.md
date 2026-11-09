# Menu de Arborização

Programa de terminal em Python que ajuda a planejar um plantio de árvores. A partir do porte da árvore (ou da largura do espaço livre) e da quantidade de sementes, ele calcula o espaçamento, a área total necessária, classifica o plantio e mostra dicas de benefício e época de plantio.

## Funcionalidades

- **Novo plantio**: escolhe o porte (Pequeno, Médio ou Grande) ou deixa o programa indicar o porte pela largura do espaço livre (em cm), e calcula a área total (`sementes × espaçamento²`).
- **Consultar espaçamento**: mostra a tabela de espaçamentos por porte e a melhor época de plantio.
- **Ver resumo**: lista todos os plantios da sessão, com área média, maior área e percentual de plantios em alerta.
- **Sair**: encerra o programa.

### Regras principais

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

## Requisitos

- **Python 3.10 ou superior** (o código usa `match/case`).
- Nenhuma biblioteca externa.

Para conferir sua versão:

```bash
python3 --version
```

## Como rodar

1. Abra um terminal na pasta do projeto (onde está o `main.py`).
2. Execute:

```bash
python3 main.py
```

No Windows, se `python3` não funcionar, use `python main.py` ou `py main.py`.

3. Digite o número da opção desejada no menu e pressione Enter. Use a opção `4` para sair.

## Exemplo de execução

Saída de uma sessão real do programa (o que o usuário digita aparece depois de `>`):

```text
=== Menu de Arborização ===

Opção: [1] Novo plantio   [2] Consultar espaçamento   [3] Ver resumo   [4] Sair
> 2
Pequeno: 4.0 m  (espaço livre de 150 a 249 cm)
Médio: 7.0 m  (espaço livre de 250 a 399 cm)
Grande: 10.0 m  (espaço livre a partir de 400 cm)
Muito junto: as árvores competem por luz e água.
Muito longe: perde-se sombra e proteção do solo.
Melhor época de plantio: outubro a dezembro (início das chuvas); até março, com rega frequente.

Opção: [1] Novo plantio   [2] Consultar espaçamento   [3] Ver resumo   [4] Sair
> 1
Porte da árvore ([1] Pequeno  [2] Médio  [3] Grande  [4] Não sei, medir pelo espaço): > 1
Quantidade de sementes (1 a 1000): > 30

30 sementes de porte Pequeno
Distância entre cada plantio: 4.0 m
Área total necessária: 480 m²
Classificação: Plantio doméstico (quintal, praça pequena)
Benefício: Sombra pontual e boa atração de polinizadores.
Melhor época de plantio: outubro a dezembro (início das chuvas); até março, com rega frequente

Opção: [1] Novo plantio   [2] Consultar espaçamento   [3] Ver resumo   [4] Sair
> 1
Porte da árvore ([1] Pequeno  [2] Médio  [3] Grande  [4] Não sei, medir pelo espaço): > 4
Largura do espaço livre em cm (50 a 2000): > 300
Para 300 cm de largura, o porte indicado é Médio.
Quantidade de sementes (1 a 1000): > 20

20 sementes de porte Médio
Distância entre cada plantio: 7.0 m
Área total necessária: 980 m²
Classificação: Plantio médio (condomínio, rua arborizada)
Benefício: Sombra contínua e espaço para as raízes captarem água.
Melhor época de plantio: outubro a dezembro (início das chuvas); até março, com rega frequente

Opção: [1] Novo plantio   [2] Consultar espaçamento   [3] Ver resumo   [4] Sair
> 1
Porte da árvore ([1] Pequeno  [2] Médio  [3] Grande  [4] Não sei, medir pelo espaço): > 3
Quantidade de sementes (1 a 1000): > 150

150 sementes de porte Grande
Distância entre cada plantio: 10.0 m
Área total necessária: 15000 m²
Classificação: ALERTA: acima de 1 hectare, exige planejamento
Benefício: Máxima sombra e filtragem do ar; raízes fundas melhoram o solo.
Melhor época de plantio: outubro a dezembro (início das chuvas); até março, com rega frequente

Opção: [1] Novo plantio   [2] Consultar espaçamento   [3] Ver resumo   [4] Sair
> 3
  1. 480 m² - Plantio doméstico (quintal, praça pequena)
  2. 980 m² - Plantio médio (condomínio, rua arborizada)
  3. 15000 m² - ALERTA: acima de 1 hectare, exige planejamento
Plantios registrados: 3
Área média: 5486.7 m²
Maior área: 15000.0 m²
Plantios em alerta: 33.3%

Opção: [1] Novo plantio   [2] Consultar espaçamento   [3] Ver resumo   [4] Sair
> 4

Programa encerrado. Boas plantações!
```

> Se quiser incluir uma imagem de captura de tela no lugar (ou além) do bloco acima, salve o print na pasta (por exemplo `print-execucao.png`) e adicione `![Execução do programa](print-execucao.png)` nesta seção.

## Estrutura da pasta

```text
.
├── main.py       # código do programa
├── README.md     # este arquivo
└── prompts.md    # prompts usados no desenvolvimento
```

## Prompts

Os prompts usados na construção do projeto estão registrados em [prompts.md](prompts.md).