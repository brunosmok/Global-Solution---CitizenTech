# Registro de uso de IA

A IA pode ser usada como copiloto, para aprender e revisar. Registrem aqui **todos** os prompts usados nesta parte do projeto.
Código que a equipe não sabe explicar não pontua.

Se a equipe não usou IA, escreva: **Não utilizamos IA nesta parte.**

---

## Prompt 1

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** converter para JavaScript a parte da Muda que a equipe escreveu em Python

**Prompt enviado:**

```
Temos um programa em Python (python/main.py) que mostra os dados de um
bairro e escolhe o aviso pela parte das áreas com nota alta, nas funções
aviso_do_bairro(), formatar() e formatar_diferenca().

Converta essas funções para JavaScript puro, sem bibliotecas, para usar
na página inicial. As regras precisam ficar iguais às do Python. Os
números devem aparecer no jeito brasileiro, como 4,7% e +6,8 °C.
```

**O que aproveitamos da resposta:** As funções avisoDoBairro(), formatarNumero() e formatarDiferenca(), em js/main.js, usadas pelo seletor de bairro da página.

**O que mudamos ou descartamos, e por quê:** As regras são as mesmas do Python, que é da equipe: a IA só traduziu o código de uma linguagem para a outra. A equipe comparou os resultados das duas versões e entendeu o código final antes de entregar.

---

## Prompt 2

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** implementar em TypeScript o fundo animado em 3D da abertura da página

**Prompt enviado:**

```
Queremos que a abertura da página inicial tenha um fundo animado em 3D:
uma sala com uma mesa e uma varanda com vista para o Cristo Redentor no
fim de tarde. A câmera deve andar pela sala conforme a pessoa rola a
página, com uma parada para cada bloco de texto.

Escreva em TypeScript, com a biblioteca Three.js, em um arquivo
ts/sala.ts. Use nomes em português e explique cada parte nos comentários.
Quem pediu menos animações no aparelho ou não tem WebGL deve ver a página
normal, sem a parte 3D.
```

**O que aproveitamos da resposta:** O arquivo ts/sala.ts, com a sala, a vista em camadas, as paradas da câmera e as texturas desenhadas em canvas, e a verificação de WebGL e de pouco movimento em js/main.js. O js/sala.js é a versão pronta desse arquivo para abrir sem servidor.

**O que mudamos ou descartamos, e por quê:** A equipe escolheu a cena, as cores e os textos de cada parada, e pediu explicações de cada parte do Three.js até conseguir explicar o código.

---

## Prompt 3

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima, Bruno Smoktunowicz Baptista e Caio Medeiros Machado
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** gerar por completo o site de mapeamento da cidade do Rio de Janeiro, e sua área técnica, publicados na Vercel

**Prompt enviado:**

```
Crie o site de mapeamento da ArborIA para a cidade do Rio de Janeiro. 
Utilize as mesmas fontes e paletas de cores, bem como a logo, que foram 
utilizada na landing page do ArborIA. Ele deve mostrar no mapa as áreas
da cidade com a nota de prioridade para plantar árvores, a copa e o calor de cada área, e ter:
- uma página para moradores, que acha a área mais perto da pessoa;
- uma página técnica, que mostra o método e os dados de cada área.

Use os dados que já calculamos (hexes.json e meta.json) e deixe o site
pronto para publicar na Vercel.
```

**O que aproveitamos da resposta:** O site de mapeamento inteiro foi gerado pela IA e está publicado em https://arboria-ai.vercel.app/plantar, com as páginas /plantar e /tecnico, para onde os links desta página levam.

**O que mudamos ou descartamos, e por quê:** Os dados das áreas e as regras de prioridade são da equipe. A equipe revisou, testou o site publicado e conferiu os números de cada página antes de entregar. Os arquivos `hexes.json` e `meta.json` citados no prompt são os dados gerados pela equipe na análise de dados. Eles ficam no projeto do site e não estão neste repositório; os números que a página inicial usa estão em `js/bairros.js`.

---

## Prompt 4

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** trocar o fundo da sala 3D da abertura por uma sala com outra cor e uma varanda com vista para o Cristo Redentor

**Prompt enviado:**

```
cara sabe o que eu pensei em fazer pra usarmos em um site de teste , trocar o fundo da sala que esta na pagina inicial pra uma sala com uma cor diferente e com uma janela / varanda pro cristo redentor do rj
```

**O que aproveitamos da resposta:** a sala com paredes azul-petróleo e a varanda com a vista ilustrada do Cristo, em `ts/sala.ts` (e `js/sala.js`). Sem 3D, a página mostra a foto do Cristo (`imagens/cristo.jpg`).

**O que mudamos ou descartamos, e por quê:** a ideia e a escolha da vista foram da equipe. Testamos primeiro em um site de teste e só depois levamos para a página inicial.

---

## Prompt 5

- **Quem usou:** Anauã Paulo Campolina Vieitas Lima
- **Ferramenta:** Claude (Anthropic)
- **Para quê:** criar o Assistente IA da página inicial e colocar nele as informações básicas do projeto

**Prompts enviados:**

```
https://centrovlr.com.br/time/179 Quero um assistente IA parecido com o desse site no meu projeto, consegue fazer isso?
```

```
Coloca dados básicos do projeto no assistente, por exemplo as informações dos integrantes.
```

**O que aproveitamos da resposta:** o painel do assistente na página (`index.html`, `css/style.css` e a função `iniciarAssistente()` em `js/main.js`), com sugestões de perguntas e a apresentação da equipe.

**O que mudamos ou descartamos, e por quê:** a equipe definiu o que o assistente deve saber sobre o projeto e o grupo. O assistente avisa que está em teste e pode errar, e a nota das áreas não depende dele.
