const CHAVE_TEMA = 'arboria-tema'
const COR_DA_BARRA = { dark: '#0e1512', light: '#f4f2e6' }

function lerTemaSalvo() {
  try {
    return localStorage.getItem(CHAVE_TEMA)
  } catch {
    return null
  }
}

function salvarTema(tema) {
  try {
    localStorage.setItem(CHAVE_TEMA, tema)
  } catch {
    // Sem armazenamento, o tema vale só até fechar a página.
  }
}

function escolherTemaInicial() {
  const salvo = lerTemaSalvo()
  if (salvo === 'light' || salvo === 'dark') return salvo
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema
  const corDaBarra = document.querySelector('meta[name="theme-color"]')
  if (corDaBarra) corDaBarra.content = COR_DA_BARRA[tema]
  window.dispatchEvent(new CustomEvent('temachange'))
}

function alternarTema() {
  const novoTema = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'
  salvarTema(novoTema)
  aplicarTema(novoTema)
}

aplicarTema(escolherTemaInicial())

document.addEventListener('click', (evento) => {
  if (evento.target.closest('[data-tema-botao]')) alternarTema()
})