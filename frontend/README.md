# Interface e Interação · ArborIA

Landing page da ArborIA, entregue em **Front-end Design** (HTML e CSS) e **Web Development** (JavaScript).

## Como abrir
Abra `index.html` no navegador. Não precisa de servidor nem de instalação. A versão completa, com mapa e página dos moradores, está em [arboria-ai.vercel.app](https://arboria-ai.vercel.app).

## Estrutura
| Arquivo | O que tem |
|---|---|
| `index.html` | A página: menu, seções e rodapé |
| `css/style.css` | Todo o visual, nos modos claro e escuro |
| `js/tema.js` | Modo claro e escuro, lembrado no navegador |
| `js/main.js` | Menu do celular, seletor de bairro e a sala 3D |
| `js/guardiao.js` | Planejar e acompanhar a muda: as mesmas regras de `python/main.py`, em JavaScript |
| `js/bairros.js` | Os números de cada bairro, gerados a partir dos dados do projeto |
| `js/sala.js` e `ts/sala.ts` | A sala 3D da abertura (`sala.ts` é o código-fonte; `sala.js`, a versão que o navegador abre) |
| `imagens/` | Mapas, fotos e ícone |
| `integrantes.txt` | Nome completo e RM da equipe |

## Seções
Abertura; o calor, a sombra, a nota e o caminho até a calçada; seu bairro; planejar e acompanhar a muda; a conta aberta (método); o que ela não promete (limites); ODS; e as portas para o site completo, com rodapé.

## Interações (Web Development)
1. **Modo claro e escuro:** botão no topo; a escolha fica salva.
2. **Seu bairro:** ao escolher um bairro, a página mostra as áreas com nota alta, o calor, a copa e um aviso.
3. **A muda:** antes do plantio, calcula o espaço para as mudas; depois, classifica as leituras do Guardião da Muda e mostra o aviso.
4. **Menu do celular:** abre e fecha a navegação em telas pequenas.
5. **Assistente de IA:** painel de conversa que responde perguntas sobre o projeto. Usa o servidor do site publicado, então precisa de internet.

Registro de IA: [`AI.md`](../AI.md) e [`prompts.md`](prompts.md).
