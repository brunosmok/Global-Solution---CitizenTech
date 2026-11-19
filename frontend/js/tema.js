// Modo claro e escuro das três páginas do site.
// Este arquivo roda antes de a página aparecer, para ela já abrir com o tema certo.

const CHAVE_TEMA = 'arboria-tema'
const COR_DA_BARRA = { dark: '#0e1512', light: '#f4f2e6' }

// O navegador pode bloquear o armazenamento (janela anônima, por exemplo).
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

// Primeiro vale a escolha da pessoa. Se não houver, vale a preferência do aparelho.
function escolherTemaInicial() {
  const salvo = lerTemaSalvo()
  if (salvo === 'light' || salvo === 'dark') return salvo
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema
  const corDaBarra = document.querySelector('meta[name="theme-color"]')
  if (corDaBarra) corDaBarra.content = COR_DA_BARRA[tema]
  // O mapa escuta este aviso para trocar as cores das linhas.
  window.dispatchEvent(new CustomEvent('temachange'))
}

function alternarTema() {
  const novoTema = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'
  salvarTema(novoTema)
  aplicarTema(novoTema)
}

aplicarTema(escolherTemaInicial())

// O clique é ouvido no documento porque, em /plantar e /tecnico, o botão é criado depois.
document.addEventListener('click', (evento) => {
  if (evento.target.closest('[data-tema-botao]')) alternarTema()
})
