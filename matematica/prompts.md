# Registro de uso de IA

A IA pode ser usada como copiloto, para aprender e revisar. Registrem aqui **todos** os prompts usados nesta parte do projeto.
Código que a equipe não sabe explicar não pontua.

Se a equipe não usou IA, escreva: **Não utilizamos IA nesta parte.**

---

## Prompt 1

- **Quem usou:** Anauã Vieitas, Bruno Smoktunowicz e Caio Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** organizar a estrutura geral do modelo.py, com uma seção para cada modelo matemático

**Prompt enviado:**

```
Estamos fazendo a parte de Matemática do projeto ArborIA. Já temos os
quatro modelos definidos pela equipe:
- trigonométrica: temperatura ao longo do dia;
- exponencial: crescimento da copa de uma árvore;
- logarítmica: tempo para a copa chegar a uma parte do tamanho adulto;
- polinomial do 1º grau: copa e calor da superfície.

Sugira só a ESTRUTURA de um arquivo modelo.py: a ordem das seções, onde
ficam as constantes, a tabela de valores, a equação resolvida com sympy e
o gráfico de cada modelo. Não mude as fórmulas nem os valores escolhidos
pela equipe.
```

**O que aproveitamos da resposta:** A divisão do modelo.py em uma seção por modelo, cada uma com as constantes no topo, a tabela de valores, a equação resolvida com o sympy e o gráfico salvo na pasta graficos/.

**O que mudamos ou descartamos, e por quê:** As fórmulas, os valores (média, amplitude, hora do pico, taxa de crescimento, tamanhos de copa e meta de 20%) e as conclusões são da equipe. A IA só sugeriu a organização do arquivo. A equipe revisou, testou e entendeu o código final antes de entregar.

---

## Prompt 2

- **Quem usou:** Anauã Vieitas, Bruno Smoktunowicz e Caio Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** deixar o modelo.py com tudo dentro dele, para a entrega ter só modelo.py e relatorio.pdf

**Prompt enviado:**

```
A entrega de Matemática precisa ter só dois arquivos: modelo.py e
relatorio.pdf. Hoje o modelo.py lê hexes.json e meta.json e depende do
requirements.txt.

Leve para dentro do modelo.py só os dados que ele usa, com comentários
explicando de onde eles vieram, e coloque no topo como instalar as
bibliotecas. A saída e os gráficos precisam continuar exatamente iguais.
Não altere os cálculos.
```

**O que aproveitamos da resposta:** Os dados das 100 áreas de Cosmos com nota e os números da regressão térmica passaram para dentro do modelo.py, com comentários sobre a origem de cada um, e a instrução de instalação foi para o cabeçalho.

**O que mudamos ou descartamos, e por quê:** Nenhum cálculo foi alterado: a lógica é da equipe e a IA só reorganizou o código existente. A equipe conferiu que o texto impresso e os gráficos ficaram iguais aos de antes, e entendeu o código final antes de entregar.

---
