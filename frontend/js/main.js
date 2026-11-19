/* =========================================================================
   ArborIA — main.js (interações da página inicial)
   Global Solution 2026.2 · CitizenTech · FIAP, Engenharia de Software, 1º ano
   Integrantes: Anauã Paulo Campolina Vieitas Lima (RM 576103) · Bruno Smoktunowicz Baptista (RM 574739) · Caio Medeiros Machado (RM 575113)
   ========================================================================= */

// Interações da página inicial, em JavaScript puro (sem React):
// - o menu do celular;
// - o seletor de bairro, com os números e o aviso do bairro;
// - a entrada suave dos blocos de texto ao rolar a página;
// - o Assistente IA, que conversa com api/assistente.ts;
// - a sala 3D, que fica em sala.ts e só é carregada quando o aparelho consegue mostrá-la.
// Este mesmo arquivo vai no zip da entrega (site-pronto), que abre sem servidor. Lá, js/bairros.js
// traz window.ARBORIA_SITE, o endereço do site publicado, e a sala vem pronta em js/sala.js.

// Escreve um número do jeito brasileiro, com a quantidade de casas decimais pedida.
function formatarNumero(valor, casas = 0) {
  const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
  return formatador.format(valor)
}

// Escreve a diferença de temperatura com sinal: +6,8 °C ou −1,2 °C.
function formatarDiferenca(valor) {
  let sinal = ''
  if (valor > 0) sinal = '+'
  else if (valor < 0) sinal = '−'
  return `${sinal}${formatarNumero(Math.abs(valor), 1)} °C`
}

// Troca o texto do elemento que tem esse id.
function escrever(id, texto) {
  document.getElementById(id).textContent = texto
}

// Escolhe a mensagem do bairro pela parte das áreas com nota alta.
// É a mesma regra de aviso_do_bairro, em python/main.py.
function avisoDoBairro(alta, areas) {
  if (alta === 0) return 'Nenhuma área deste bairro tem nota alta hoje.'
  if (alta / areas >= 0.5) return 'Mais da metade das áreas deste bairro tem nota alta. Aqui, uma árvore nova tende a fazer mais diferença.'
  return 'Parte deste bairro tem nota alta. Vale ver qual é o ponto mais perto de você.'
}

// Mostra os números do bairro escolhido. "total" é quantas áreas a cidade tem.
function mostrarBairro(bairro, total) {
  let palavraAvaliada = 'avaliadas'
  if (bairro.areas === 1) palavraAvaliada = 'avaliada'
  let calor = 'sem dado'
  if (bairro.calor !== null) calor = formatarDiferenca(bairro.calor)

  escrever('r-alta', formatarNumero(bairro.alta))
  escrever('r-total', `áreas com nota alta ou muito alta, de ${formatarNumero(bairro.areas)} ${palavraAvaliada} neste bairro`)
  escrever('r-melhor', `${formatarNumero(bairro.melhor)}º de ${formatarNumero(total)}`)
  escrever('r-calor', calor)
  escrever('r-copa', `${formatarNumero(bairro.copa, 1)}%`)
  escrever('r-aviso', avisoDoBairro(bairro.alta, bairro.areas))
}

// Busca os dados dos bairros. No site, eles vêm do arquivo bairros.json.
// O zip da entrega abre sem servidor, então já traz os dados prontos em window.ARBORIA_PACOTE.
async function carregarBairros() {
  if (window.ARBORIA_PACOTE) return window.ARBORIA_PACOTE
  const resposta = await fetch('/landing/bairros.json')
  if (!resposta.ok) throw new Error(String(resposta.status))
  return resposta.json()
}

// Preenche o seletor com os bairros em ordem alfabética e já mostra Cosmos.
async function iniciarBairros() {
  const seletor = document.getElementById('bairro-select')
  try {
    const dados = await carregarBairros()
    const nomes = Object.keys(dados.bairros)
    nomes.sort(function (a, b) {
      return a.localeCompare(b, 'pt-BR')
    })
    // Troca a opção provisória do HTML pelas opções de verdade.
    seletor.innerHTML = ''
    for (const nome of nomes) {
      const opcao = document.createElement('option')
      opcao.value = nome
      opcao.textContent = nome
      if (nome === 'Cosmos') opcao.selected = true
      seletor.appendChild(opcao)
    }
    seletor.addEventListener('change', function () {
      mostrarBairro(dados.bairros[seletor.value], dados.total)
    })
    mostrarBairro(dados.bairros[seletor.value], dados.total)
  } catch {
    escrever('r-total', 'Não foi possível carregar os dados. A área técnica mostra os mesmos números.')
  }
}

// Menu do celular: abre e fecha pelo botão, ao escolher um link ou com a tecla Esc.
function iniciarMenu() {
  const botao = document.getElementById('menu-botao')
  const menu = document.getElementById('menu')

  function definirAberto(aberto) {
    if (aberto) {
      menu.classList.add('aberto')
      botao.textContent = 'Fechar'
    } else {
      menu.classList.remove('aberto')
      botao.textContent = 'Menu'
    }
    // aria-expanded avisa aos leitores de tela se o menu está aberto.
    botao.setAttribute('aria-expanded', String(aberto))
  }

  botao.addEventListener('click', function () {
    definirAberto(!menu.classList.contains('aberto'))
  })
  // Escolher um link fecha o menu.
  menu.addEventListener('click', function (evento) {
    if (evento.target.closest('a')) definirAberto(false)
  })
  // A tecla Esc também fecha, e o foco volta para o botão.
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menu.classList.contains('aberto')) {
      definirAberto(false)
      botao.focus()
    }
  })
}

// Faz os blocos de texto aparecerem aos poucos quando entram na tela.
// O IntersectionObserver é uma ferramenta do navegador que avisa quando um elemento aparece na tela.
// Quem esconde e mostra é o CSS (as classes data-reveal e "in", em landing.css).
function iniciarEntradas() {
  const grupos = document.querySelectorAll('.capitulo__texto, .bairro__intro, .bairro__numeros, .metodo, .limites__lista, .ods__lista, .portas')
  const itens = []
  for (const grupo of grupos) {
    const filhos = grupo.children
    for (let posicao = 0; posicao < filhos.length; posicao++) {
      const filho = filhos[posicao]
      if (filho.closest('.abertura')) continue // a abertura já aparece pronta
      filho.dataset.reveal = ''
      // Cada item entra um pouco depois do anterior, até o sexto.
      filho.style.setProperty('--delay', Math.min(posicao, 5) * 80 + 'ms')
      itens.push(filho)
    }
  }
  // As imagens dos capítulos ficam ao lado do texto e se abrem como uma cortina (ver landing.css).
  for (const imagem of document.querySelectorAll('.capitulo > .capitulo__mapa')) {
    imagem.dataset.reveal = ''
    imagem.style.setProperty('--delay', '120ms')
    itens.push(imagem)
  }
  const observador = new IntersectionObserver(function (entradas) {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue
      mostrar(entrada.target)
      if (entrada.target.classList.contains('capitulo__numero')) contarAte(entrada.target.querySelector('strong'))
      observador.unobserve(entrada.target) // já apareceu, não precisa mais observar
    }
  }, { rootMargin: '0px 0px -8% 0px' })
  for (const item of itens) observador.observe(item)

  // Uma imagem só começa a aparecer depois de carregada: sem isso, a animação passaria sobre um espaço vazio.
  function mostrar(item) {
    if (item.tagName !== 'IMG' || item.complete) {
      item.classList.add('in')
      return
    }
    item.addEventListener('load', function () { item.classList.add('in') }, { once: true })
    item.addEventListener('error', function () { item.classList.add('in') }, { once: true })
  }
}

// Topo da página: ganha uma linha embaixo depois de rolar, e o link da seção que está na tela fica marcado.
function iniciarTopo() {
  const barra = document.querySelector('.topo')
  function atualizarBarra() {
    barra.classList.toggle('rolou', window.scrollY > 12)
  }
  atualizarBarra()
  window.addEventListener('scroll', atualizarBarra, { passive: true })

  const links = document.querySelectorAll('#menu a[href^="#"]')
  const observador = new IntersectionObserver(function (entradas) {
    for (const entrada of entradas) {
      const link = document.querySelector(`#menu a[href="#${entrada.target.id}"]`)
      if (link) link.classList.toggle('atual', entrada.isIntersecting)
    }
  }, { rootMargin: '-45% 0px -50% 0px' }) // conta só a faixa do meio da tela
  for (const link of links) {
    const secao = document.querySelector(link.getAttribute('href'))
    if (secao) observador.observe(secao)
  }
}

// Rodapé: o nome ArborIA é ajustado para ocupar a coluna do meio, e o rodapé inteiro sobe e aparece
// conforme a rolagem. O script só escreve --entrada (de 0 a 1); quem move e mostra é o CSS (landing.css).
function iniciarRodape() {
  const rodape = document.querySelector('.rodape')
  const conteudo = document.querySelector('.rodape__conteudo')
  const letreiro = document.querySelector('.rodape__marca')
  if (!rodape || !conteudo || !letreiro) return
  const nome = letreiro.firstElementChild

  function ajustarLetreiro() {
    letreiro.style.fontSize = '100px'
    const larguraDoTexto = nome.getBoundingClientRect().width
    if (larguraDoTexto > 0) letreiro.style.fontSize = (97 * letreiro.clientWidth / larguraDoTexto).toFixed(2) + 'px' // 3% de folga: a ponta do A passa um pouco da largura da letra
  }
  ajustarLetreiro()
  if (document.fonts) document.fonts.ready.then(ajustarLetreiro) // a fonte pode chegar depois e mudar a largura
  window.addEventListener('resize', ajustarLetreiro)

  if (poucoMovimento()) return
  // Começa quando o topo do rodapé chega a 90% da altura da tela e termina no fim da página.
  function atualizar() {
    const inicio = rodape.offsetTop - window.innerHeight * 0.9
    const fim = document.documentElement.scrollHeight - window.innerHeight
    const avanco = Math.min(1, Math.max(0, (window.scrollY - inicio) / Math.max(1, fim - inicio)))
    const suave = 1 - Math.pow(1 - avanco, 2) // anda rápido no começo e desacelera no fim
    conteudo.style.setProperty('--entrada', suave.toFixed(3))
  }
  let agendado = false
  function agendar() {
    if (agendado) return
    agendado = true
    requestAnimationFrame(function () {
      agendado = false
      atualizar()
    })
  }
  atualizar()
  window.addEventListener('scroll', agendar, { passive: true })
  window.addEventListener('resize', agendar)
}

// Quem pediu menos animações no aparelho vê tudo parado.
function poucoMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Faz o número de destaque contar do zero até o valor escrito, como "+6,8 °C", "4,7%" ou "7.225".
// Textos sem número, como "Grátis", ficam como estão.
function contarAte(elemento) {
  if (!elemento || poucoMovimento() || elemento.dataset.contado) return
  const partes = elemento.textContent.match(/^([+−-]?)(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d+))?(.*)$/)
  if (!partes) return
  elemento.dataset.contado = 'sim'
  const [, sinal, inteiro, decimais = '', resto] = partes
  const casas = decimais.length
  const alvo = Number(inteiro.replaceAll('.', '') + '.' + (decimais || '0'))
  const textoFinal = elemento.textContent
  const duracao = 1400
  const inicio = performance.now()
  function passo(agora) {
    const t = Math.min(1, (agora - inicio) / duracao)
    const suave = 1 - Math.pow(1 - t, 3) // começa rápido e desacelera no fim
    elemento.textContent = sinal + formatarNumero(alvo * suave, casas) + resto
    if (t < 1) requestAnimationFrame(passo)
    else elemento.textContent = textoFinal
  }
  requestAnimationFrame(passo)
}

// A foto da abertura desce um pouco mais devagar que a página ao rolar, dando profundidade.
function iniciarFotoDaAbertura() {
  document.documentElement.classList.add('sem-sala')
  const foto = document.querySelector('.abertura__foto')
  if (!foto || poucoMovimento()) return
  let agendado = false
  window.addEventListener('scroll', function () {
    if (agendado) return
    agendado = true
    requestAnimationFrame(function () {
      agendado = false
      const rolagem = window.scrollY
      if (rolagem > window.innerHeight * 1.2) return // a abertura já saiu da tela
      foto.style.setProperty('--paralaxe', (rolagem * 0.3).toFixed(1) + 'px')
    })
  }, { passive: true })
}

// A sala 3D precisa de WebGL, e só aparece se a pessoa não pediu menos animações no aparelho.
function aparelhoMostra3D() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return temWebGL()
}

// WebGL é a parte do navegador que desenha em 3D. Aparelhos muito antigos não têm.
function temWebGL() {
  try {
    const tela = document.createElement('canvas')
    let contexto = tela.getContext('webgl2')
    if (!contexto) contexto = tela.getContext('webgl')
    return Boolean(contexto)
  } catch {
    return false
  }
}

// Assistente IA: abre o painel, manda a conversa para /api/assistente e mostra a resposta enquanto ela chega.
// A chave da IA fica no servidor (api/assistente.ts). No zip, que não tem servidor, as perguntas
// vão para o site publicado (window.ARBORIA_SITE), e por isso ele precisa de internet.
function iniciarAssistente() {
  const botao = document.getElementById('assistente-abrir')
  const painel = document.getElementById('assistente')
  const servidor = window.ARBORIA_SITE || ''
  if (!botao || !painel) return
  if (!servidor && !location.protocol.startsWith('http')) return
  const fechar = document.getElementById('assistente-fechar')
  const conversa = document.getElementById('assistente-conversa')
  const sugestoes = document.getElementById('assistente-sugestoes')
  const formulario = document.getElementById('assistente-form')
  const campo = document.getElementById('assistente-texto')
  const enviar = formulario.querySelector('button')
  const historico = [] // { papel: 'pessoa' | 'assistente', texto }
  let ocupado = false

  botao.hidden = false

  function definirAberto(aberto) {
    painel.hidden = !aberto
    botao.setAttribute('aria-expanded', String(aberto))
    if (aberto) campo.focus()
    else botao.focus()
  }

  function adicionarMensagem(classe, texto) {
    const mensagem = document.createElement('p')
    mensagem.className = `assistente__msg assistente__msg--${classe}`
    mensagem.textContent = texto
    conversa.appendChild(mensagem)
    conversa.scrollTop = conversa.scrollHeight
    return mensagem
  }

  async function perguntar(texto) {
    texto = texto.trim()
    if (!texto || ocupado) return
    ocupado = true
    enviar.disabled = true
    sugestoes.hidden = true
    campo.value = ''
    adicionarMensagem('pessoa', texto)
    historico.push({ papel: 'pessoa', texto })
    const resposta = adicionarMensagem('ia', '')

    try {
      const pedido = await fetch(servidor + '/api/assistente', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mensagens: historico }),
      })
      if (!pedido.ok || !pedido.body) {
        const corpo = await pedido.json().catch(function () { return {} })
        throw new Error(corpo.erro || 'Não consegui responder agora. Tente de novo em instantes.')
      }
      const leitor = pedido.body.getReader()
      const decodificador = new TextDecoder()
      for (;;) {
        const { done, value } = await leitor.read()
        if (done) break
        resposta.textContent += decodificador.decode(value, { stream: true })
        conversa.scrollTop = conversa.scrollHeight
      }
      historico.push({ papel: 'assistente', texto: resposta.textContent })
    } catch (falha) {
      historico.pop() // a pergunta sem resposta não volta para a IA
      resposta.classList.add('assistente__msg--erro')
      resposta.textContent = falha instanceof TypeError
        ? 'Sem conexão com o assistente. Confira a internet e tente de novo.'
        : falha.message
    } finally {
      ocupado = false
      enviar.disabled = false
      campo.focus()
    }
  }

  botao.addEventListener('click', function () { definirAberto(painel.hidden) })
  fechar.addEventListener('click', function () { definirAberto(false) })
  sugestoes.addEventListener('click', function (evento) {
    const escolhido = evento.target.closest('button')
    if (escolhido) perguntar(escolhido.textContent)
  })
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault()
    perguntar(campo.value)
  })
  painel.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') definirAberto(false)
  })
}

iniciarBairros()
iniciarAssistente()
iniciarMenu()
iniciarEntradas()
iniciarTopo()
iniciarRodape()

// Baixa a parte 3D só quando ela vai ser usada. Quem não pode usá-la lê a página normal, sem baixar nada.
// No site, o import() traz sala.ts. No zip, que abre direto do arquivo, o navegador não aceita import(),
// então a página ganha um <script> com js/sala.js (a mesma sala.ts já convertida para JavaScript),
// que deixa a sala pronta em window.ArboriaSala.
function carregarSala() {
  if (!window.ARBORIA_PACOTE) return import('./sala')
  return new Promise(function (pronto, falhou) {
    const script = document.createElement('script')
    script.src = 'js/sala.js'
    script.onload = function () {
      if (window.ArboriaSala) pronto(window.ArboriaSala)
      else falhou(new Error('A sala não carregou.'))
    }
    script.onerror = falhou
    document.head.appendChild(script)
  })
}

// A sala 3D só aparece em aparelhos que conseguem mostrá-la.
if (aparelhoMostra3D()) {
  document.documentElement.classList.add('has-room')
  // Se der algum erro, a classe sai e a página volta a mostrar as imagens no lugar da sala.
  carregarSala()
    .then(function (modulo) {
      modulo.iniciarSala(document.getElementById('room'), document.getElementById('scene'))
    })
    .catch(function () {
      document.documentElement.classList.remove('has-room')
      iniciarFotoDaAbertura()
    })
} else {
  // Sem sala 3D (aparelho sem WebGL ou com menos animações): a abertura mostra a foto do Cristo entre as árvores.
  iniciarFotoDaAbertura()
}
