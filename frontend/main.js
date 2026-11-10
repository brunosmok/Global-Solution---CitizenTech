function formatarNumero(valor, casas = 0) {
  const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
  return formatador.format(valor)
}

function formatarDiferenca(valor) {
  let sinal = ''
  if (valor > 0) sinal = '+'
  else if (valor < 0) sinal = '−'
  return `${sinal}${formatarNumero(Math.abs(valor), 1)} °C`
}

function escrever(id, texto) {
  document.getElementById(id).textContent = texto
}

function avisoDoBairro(alta, areas) {
  if (alta === 0) return 'Nenhuma área deste bairro tem nota alta hoje.'
  if (alta / areas >= 0.5) return 'Mais da metade das áreas deste bairro tem nota alta. Aqui, uma árvore nova tende a fazer mais diferença.'
  return 'Parte deste bairro tem nota alta. Vale ver qual é o ponto mais perto de você.'
}

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

async function carregarBairros() {
  if (window.ARBORIA_PACOTE) return window.ARBORIA_PACOTE
  const resposta = await fetch('/landing/bairros.json')
  if (!resposta.ok) throw new Error(String(resposta.status))
  return resposta.json()
}

async function iniciarBairros() {
  const seletor = document.getElementById('bairro-select')
  try {
    const dados = await carregarBairros()
    const nomes = Object.keys(dados.bairros)
    nomes.sort(function (a, b) {
      return a.localeCompare(b, 'pt-BR')
    })
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
    botao.setAttribute('aria-expanded', String(aberto))
  }

  botao.addEventListener('click', function () {
    definirAberto(!menu.classList.contains('aberto'))
  })
  menu.addEventListener('click', function (evento) {
    if (evento.target.closest('a')) definirAberto(false)
  })
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menu.classList.contains('aberto')) {
      definirAberto(false)
      botao.focus()
    }
  })
}

function iniciarEntradas() {
  const grupos = document.querySelectorAll('.copy, .probe-head, .readout, .method, .limits ul, .ods-lista, .doors')
  const itens = []
  for (const grupo of grupos) {
    const filhos = grupo.children
    for (let posicao = 0; posicao < filhos.length; posicao++) {
      const filho = filhos[posicao]
      if (filho.closest('.hero')) continue
      filho.dataset.reveal = ''
      filho.style.setProperty('--delay', Math.min(posicao, 5) * 80 + 'ms')
      itens.push(filho)
    }
  }
  for (const imagem of document.querySelectorAll('.station > .flat')) {
    imagem.dataset.reveal = ''
    imagem.style.setProperty('--delay', '120ms')
    itens.push(imagem)
  }
  const observador = new IntersectionObserver(function (entradas) {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue
      entrada.target.classList.add('in')
      if (entrada.target.classList.contains('stat')) contarAte(entrada.target.querySelector('strong'))
      observador.unobserve(entrada.target)
    }
  }, { rootMargin: '0px 0px -8% 0px' })
  for (const item of itens) observador.observe(item)
}

function iniciarTopo() {
  const barra = document.querySelector('.bar')
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
  }, { rootMargin: '-45% 0px -50% 0px' })
  for (const link of links) {
    const secao = document.querySelector(link.getAttribute('href'))
    if (secao) observador.observe(secao)
  }
}

function iniciarLetreiro() {
  const letreiro = document.querySelector('.wordmark')
  if (!letreiro) return
  const texto = letreiro.textContent.trim()
  letreiro.textContent = ''
  for (let posicao = 0; posicao < texto.length; posicao++) {
    const letra = document.createElement('span')
    letra.textContent = texto[posicao]
    letra.style.setProperty('--i', posicao)
    letreiro.appendChild(letra)
  }

  function ajustar() {
    letreiro.style.fontSize = '100px'
    let larguraDoTexto = 0
    for (const letra of letreiro.children) larguraDoTexto += letra.getBoundingClientRect().width
    if (larguraDoTexto > 0) letreiro.style.fontSize = (97 * letreiro.clientWidth / larguraDoTexto).toFixed(2) + 'px'
  }
  ajustar()
  if (document.fonts) document.fonts.ready.then(ajustar)
  window.addEventListener('resize', ajustar)

  letreiro.classList.add('letras')
  const observador = new IntersectionObserver(function (entradas) {
    if (!entradas[0].isIntersecting) return
    letreiro.classList.add('in')
    observador.disconnect()
  }, { rootMargin: '0px 0px -10% 0px' })
  observador.observe(letreiro)
}

function poucoMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

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
    const suave = 1 - Math.pow(1 - t, 3)
    elemento.textContent = sinal + formatarNumero(alvo * suave, casas) + resto
    if (t < 1) requestAnimationFrame(passo)
    else elemento.textContent = textoFinal
  }
  requestAnimationFrame(passo)
}

function iniciarFotoDaAbertura() {
  document.documentElement.classList.add('sem-sala')
  const foto = document.querySelector('.hero-foto')
  if (!foto || poucoMovimento()) return
  let agendado = false
  window.addEventListener('scroll', function () {
    if (agendado) return
    agendado = true
    requestAnimationFrame(function () {
      agendado = false
      const rolagem = window.scrollY
      if (rolagem > window.innerHeight * 1.2) return
      foto.style.setProperty('--paralaxe', (rolagem * 0.3).toFixed(1) + 'px')
    })
  }, { passive: true })
}

function aparelhoMostra3D() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    const tela = document.createElement('canvas')
    let contexto = tela.getContext('webgl2')
    if (!contexto) contexto = tela.getContext('webgl')
    return Boolean(contexto)
  } catch {
    return false
  }
}

iniciarBairros()
iniciarMenu()
iniciarEntradas()
iniciarTopo()
iniciarLetreiro()

if (!window.ARBORIA_PACOTE && aparelhoMostra3D()) {
  document.documentElement.classList.add('has-room')
  import('./sala')
    .then(function (modulo) {
      modulo.iniciarSala(document.getElementById('room'), document.getElementById('scene'))
    })
    .catch(function () {
      document.documentElement.classList.remove('has-room')
      iniciarFotoDaAbertura()
    })
} else {
  iniciarFotoDaAbertura()
}