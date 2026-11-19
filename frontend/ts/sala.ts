// A sala 3D da página inicial, feita com a biblioteca Three.js.
//
// É a parte mais avançada do site. A lógica, as medidas e as cores continuam as mesmas:
// trocamos os nomes por nomes em português e explicamos cada pedaço. Ideias do Three.js usadas aqui:
// - cena (Scene): o "mundo" onde ficam os objetos;
// - malha (Mesh): um objeto 3D, feito de uma forma (geometria) e de um material (cor, textura, brilho);
// - câmera: de onde olhamos a cena; luzes: o que ilumina a cena;
// - renderizador (WebGLRenderer): desenha a cena no <canvas> da página, muitas vezes por segundo.
// As medidas estão em unidades da cena (mais ou menos 1 metro). As posições são [x, y, z]:
// x vai para a direita, y para cima e z na direção de quem olha.
import * as THREE from 'three'

// O zip da entrega (site-pronto) abre com dois cliques, sem servidor. Lá, o navegador não deixa a sala
// ler as imagens da pasta, então elas já vêm dentro de js/sala.js, em window.ARBORIA_ENDERECOS.
// O mesmo objeto troca os links do site (como /plantar) pelo endereço do site publicado.
declare global {
  interface Window {
    ARBORIA_ENDERECOS?: Record<string, string>
  }
}

// Devolve o endereço certo para usar agora: o do site ou, no zip, o que veio pronto.
function endereco(caminho: string): string {
  return window.ARBORIA_ENDERECOS?.[caminho] ?? caminho
}

type Ponto = [number, number, number]

// Uma parada da câmera. Cada uma acompanha um bloco de texto da página.
interface Parada {
  camera: Ponto // onde a câmera fica
  alvo: Ponto // para onde ela olha
  luz: string // cor da luz que enche a sala neste trecho
}

const PARADAS: Parada[] = [
  { camera: [0, 3.5, 11.5], alvo: [0.9, 3.05, -2], luz: '#fff2d9' },
  { camera: [-2.1, 4, 1.7], alvo: [-3.9, 4.2, -4.3], luz: '#ffd9b3' },
  { camera: [-2.6, 7.3, 1.4], alvo: [-4.2, 7.35, -4.3], luz: '#e3f5e0' },
  { camera: [4.7, 4.5, 1.7], alvo: [3.9, 4.75, -4.3], luz: '#ffe9bd' },
  { camera: [1.6, 3.0, 3.6], alvo: [0.15, 2.95, -1.6], luz: '#f4f8d8' },
]

// Suaviza o movimento: começa devagar, acelera e termina devagar.
function suavizar(t: number): number {
  return t * t * (3 - 2 * t)
}

// Sorteio com semente: a mesma semente dá sempre os mesmos números.
// Assim a árvore e as células têm sempre o mesmo formato (o Math.random mudaria a cada visita).
let semente = 1
function comecarSorteio(novaSemente: number) {
  semente = novaSemente
}
function sortear(): number {
  semente = (semente * 16807) % 2147483647
  return semente / 2147483647
}

// Textura manchada: muitas elipses quase transparentes sobre uma cor de base.
// Serve para a parede e o piso não parecerem de plástico.
function texturaManchada(corDeBase: string, coresDasManchas: string[], quantidade: number, tamanho = 512): THREE.CanvasTexture {
  const desenho = document.createElement('canvas')
  desenho.width = tamanho
  desenho.height = tamanho
  const ctx = desenho.getContext('2d')!
  ctx.fillStyle = corDeBase
  ctx.fillRect(0, 0, tamanho, tamanho)
  for (let i = 0; i < quantidade; i++) {
    ctx.globalAlpha = 0.04 + Math.random() * 0.09
    ctx.fillStyle = coresDasManchas[i % coresDasManchas.length]
    const raio = 4 + Math.random() * 60
    ctx.beginPath()
    // O ângulo final 7 é um pouco mais que uma volta inteira (2π ≈ 6,28), então a elipse fecha.
    ctx.ellipse(Math.random() * tamanho, Math.random() * tamanho, raio, raio * (0.3 + Math.random()), Math.random() * 3, 0, 7)
    ctx.fill()
  }
  const textura = new THREE.CanvasTexture(desenho)
  // A textura se repete quando a superfície é maior que ela.
  textura.wrapS = THREE.RepeatWrapping
  textura.wrapT = THREE.RepeatWrapping
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

// Textura do piso: tábuas desencontradas com veios curvos.
function texturaDeMadeira(): THREE.CanvasTexture {
  const tamanho = 1024
  const desenho = document.createElement('canvas')
  desenho.width = tamanho
  desenho.height = tamanho
  const ctx = desenho.getContext('2d')!
  const tabua = 128 // altura de cada tábua, em pixels
  for (let y = 0; y < tamanho; y += tabua) {
    for (let x = -tabua * 2; x < tamanho; x += tabua * 3) {
      // Cada fileira começa num ponto diferente, para as emendas não ficarem alinhadas.
      const inicio = x + ((y / tabua) % 3) * tabua
      ctx.fillStyle = `hsl(28 ${24 + Math.random() * 8}% ${25 + Math.random() * 7}%)`
      ctx.fillRect(inicio, y, tabua * 3 - 1, tabua - 1)
      ctx.globalAlpha = 0.14
      ctx.strokeStyle = '#1b0f07'
      for (let i = 0; i < 8; i++) {
        const linha = y + Math.random() * tabua
        ctx.beginPath()
        ctx.moveTo(inicio, linha)
        ctx.bezierCurveTo(inicio + tabua, linha + 6, inicio + tabua * 2, linha - 6, inicio + tabua * 3, linha)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
  }
  const textura = new THREE.CanvasTexture(desenho)
  textura.wrapS = THREE.RepeatWrapping
  textura.wrapT = THREE.RepeatWrapping
  textura.repeat.set(7, 10)
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

// Textura da cortina: faixas que vão do escuro ao claro e voltam, imitando as dobras.
function texturaDaCortina(): THREE.CanvasTexture {
  const desenho = document.createElement('canvas')
  desenho.width = 256
  desenho.height = 16
  const ctx = desenho.getContext('2d')!
  for (let x = 0; x < 256; x += 32) {
    const dobra = ctx.createLinearGradient(x, 0, x + 32, 0)
    dobra.addColorStop(0, '#b9a98c')
    dobra.addColorStop(0.5, '#efe4cc')
    dobra.addColorStop(1, '#b9a98c')
    ctx.fillStyle = dobra
    ctx.fillRect(x, 0, 32, 16)
  }
  const textura = new THREE.CanvasTexture(desenho)
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

// Uma caixa de largura × altura × profundidade, já no lugar e com sombra.
function caixa(largura: number, altura: number, profundidade: number, material: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const malha = new THREE.Mesh(new THREE.BoxGeometry(largura, altura, profundidade), material)
  malha.position.set(x, y, z)
  malha.castShadow = true // faz sombra
  malha.receiveShadow = true // recebe sombra
  return malha
}

// Coloca um plano (piso, teto ou parede) na cena.
function adicionarPlano(cena: THREE.Scene, geometria: THREE.BufferGeometry, material: THREE.Material, posicao: Ponto, rotacao: Ponto) {
  const malha = new THREE.Mesh(geometria, material)
  malha.position.set(posicao[0], posicao[1], posicao[2])
  malha.rotation.set(rotacao[0], rotacao[1], rotacao[2])
  malha.receiveShadow = true
  cena.add(malha)
}

// A sala: piso, teto, paredes, o vão da varanda, o rodapé e as cortinas.
function montarSala(cena: THREE.Scene) {
  const parede = new THREE.MeshStandardMaterial({ map: texturaManchada('#2e6d73', ['#1f5358', '#3f8489', '#265f64'], 900), roughness: 0.95 })
  const piso = new THREE.MeshStandardMaterial({ map: texturaDeMadeira(), roughness: 0.62 })
  // Math.PI / 2 é um quarto de volta (90 graus). É girando o plano que ele vira chão, teto ou parede.
  adicionarPlano(cena, new THREE.PlaneGeometry(18, 26), piso, [0, 0, 4], [-Math.PI / 2, 0, 0])
  adicionarPlano(cena, new THREE.PlaneGeometry(18, 26), parede, [0, 9, 4], [Math.PI / 2, 0, 0])
  adicionarPlano(cena, new THREE.PlaneGeometry(26, 9), parede, [-9, 4.5, 4], [0, Math.PI / 2, 0])
  adicionarPlano(cena, new THREE.PlaneGeometry(26, 9), parede, [9, 4.5, 4], [0, -Math.PI / 2, 0])
  // A parede do fundo tem um vão para a varanda, então é feita de três partes.
  adicionarPlano(cena, new THREE.PlaneGeometry(2.5, 9), parede, [-7.75, 4.5, -9], [0, 0, 0])
  adicionarPlano(cena, new THREE.PlaneGeometry(2.5, 9), parede, [7.75, 4.5, -9], [0, 0, 0])
  adicionarPlano(cena, new THREE.PlaneGeometry(13, 0.8), parede, [0, 8.6, -9], [0, 0, 0])
  adicionarPlano(cena, new THREE.PlaneGeometry(18, 9), parede, [0, 4.5, 17], [0, Math.PI, 0])
  // Portas de correr abertas para a varanda.
  const moldura = new THREE.MeshStandardMaterial({ color: '#15130d', roughness: 0.6 })
  for (const x of [-6.5, -3.6, 3.6, 6.5]) cena.add(caixa(0.14, 8.2, 0.2, moldura, x, 4.1, -8.95))
  cena.add(caixa(13.14, 0.14, 0.2, moldura, 0, 8.2, -8.95))
  // Rodapé, só onde há parede.
  const rodape = new THREE.MeshStandardMaterial({ color: '#d4d1c1', roughness: 0.7 })
  for (const x of [-7.75, 7.75]) cena.add(caixa(2.5, 0.34, 0.08, rodape, x, 0.17, -8.95))
  // Cortinas abertas nos dois lados do vão.
  const cortina = new THREE.MeshStandardMaterial({ map: texturaDaCortina(), roughness: 0.9 })
  for (const x of [-7.1, 7.1]) cena.add(caixa(1.5, 8.1, 0.22, cortina, x, 4.1, -8.7))
}

// A varanda: piso de cerâmica e um guarda-corpo de metal.
function montarVaranda(cena: THREE.Scene) {
  const ceramica = new THREE.MeshStandardMaterial({ map: texturaManchada('#a38f78', ['#8c7863', '#baa68e', '#7d6a56'], 500), roughness: 0.8 })
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(13, 3.6), ceramica)
  piso.rotation.x = -Math.PI / 2
  piso.position.set(0, 0.01, -10.8)
  piso.receiveShadow = true
  cena.add(piso)
  const metal = new THREE.MeshStandardMaterial({ color: '#15130d', roughness: 0.5, metalness: 0.4 })
  cena.add(caixa(13, 0.1, 0.14, metal, 0, 3, -12.5))
  cena.add(caixa(13, 0.06, 0.06, metal, 0, 0.5, -12.5))
  for (let x = -6.4; x <= 6.4; x += 0.8) cena.add(caixa(0.05, 3, 0.05, metal, x, 1.5, -12.5))
}

// Um desenho da paisagem: um canvas que depois vira um plano na cena.
// Guardamos o tamanho do plano no mundo 3D para converter metros em pixels do desenho.
interface DesenhoDaPaisagem {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  larguraPx: number
  alturaPx: number
  larguraNoMundo: number
  alturaNoMundo: number
  esquerda: number // x do lado esquerdo do plano, no mundo
  topo: number // y do lado de cima do plano, no mundo
  centro: Ponto
}

function novoDesenho(larguraPx: number, alturaPx: number, larguraNoMundo: number, alturaNoMundo: number, centro: Ponto): DesenhoDaPaisagem {
  const canvas = document.createElement('canvas')
  canvas.width = larguraPx
  canvas.height = alturaPx
  return {
    canvas: canvas,
    ctx: canvas.getContext('2d')!,
    larguraPx: larguraPx,
    alturaPx: alturaPx,
    larguraNoMundo: larguraNoMundo,
    alturaNoMundo: alturaNoMundo,
    esquerda: centro[0] - larguraNoMundo / 2,
    topo: centro[1] + alturaNoMundo / 2,
    centro: centro,
  }
}

// Convertem uma posição do mundo 3D, em metros, para pixels do desenho.
function xNoDesenho(desenho: DesenhoDaPaisagem, xNoMundo: number): number {
  return ((xNoMundo - desenho.esquerda) / desenho.larguraNoMundo) * desenho.larguraPx
}
function yNoDesenho(desenho: DesenhoDaPaisagem, yNoMundo: number): number {
  return ((desenho.topo - yNoMundo) / desenho.alturaNoMundo) * desenho.alturaPx
}

// Transforma o desenho em um plano da cena. Cada camada da paisagem é chapada, mas,
// como as camadas ficam a distâncias diferentes, dão a sensação de profundidade quando a câmera anda.
function planoDaPaisagem(desenho: DesenhoDaPaisagem): THREE.Mesh {
  const textura = new THREE.CanvasTexture(desenho.canvas)
  textura.colorSpace = THREE.SRGBColorSpace
  // MeshBasicMaterial não sofre efeito das luzes da sala, e fog: false deixa a paisagem sem névoa.
  const material = new THREE.MeshBasicMaterial({ map: textura, transparent: true, fog: false, toneMapped: false })
  const malha = new THREE.Mesh(new THREE.PlaneGeometry(desenho.larguraNoMundo, desenho.alturaNoMundo), material)
  malha.position.set(desenho.centro[0], desenho.centro[1], desenho.centro[2])
  return malha
}

// Pinta uma silhueta (morro ou cidade) ligando os pontos [x, y] e descendo até a altura da base.
function preencherContorno(desenho: DesenhoDaPaisagem, pontos: number[][], base: number) {
  const ctx = desenho.ctx
  ctx.beginPath()
  ctx.moveTo(xNoDesenho(desenho, pontos[0][0]), yNoDesenho(desenho, base))
  for (const ponto of pontos) ctx.lineTo(xNoDesenho(desenho, ponto[0]), yNoDesenho(desenho, ponto[1]))
  ctx.lineTo(xNoDesenho(desenho, pontos[pontos.length - 1][0]), yNoDesenho(desenho, base))
  ctx.closePath()
  ctx.fill()
}

// Uma figura do Cristo, de uma cor, já no lugar.
function adicionarFiguraDoCristo(cena: THREE.Scene, contorno: THREE.Shape, cor: string, deslocamento: number, z: number) {
  const material = new THREE.MeshBasicMaterial({ color: cor, fog: false, toneMapped: false })
  const grupo = new THREE.Group()
  grupo.add(new THREE.Mesh(new THREE.ShapeGeometry(contorno), material))
  const cabeca = new THREE.Mesh(new THREE.CircleGeometry(1.9, 24), material)
  cabeca.position.y = 27.5
  grupo.add(cabeca)
  grupo.scale.setScalar(0.2) // a figura é desenhada grande e depois diminuída
  grupo.position.set(7 + deslocamento, 11.1, z)
  cena.add(grupo)
}

// O Cristo Redentor em silhueta contra o céu do fim de tarde. As medidas são da própria figura.
function montarCristo(cena: THREE.Scene) {
  // Pontos do lado direito da estátua, de baixo para cima. O lado esquerdo é o espelho deste.
  const ladoDireito = [[3.2, -8], [3.2, -1], [2.1, -1], [2.2, 8], [2.9, 15], [3.1, 17], [8, 20.2], [14, 22], [14.4, 23.2], [3.2, 25], [1.3, 25.6]]
  const contorno = new THREE.Shape()
  contorno.moveTo(-ladoDireito[0][0], ladoDireito[0][1])
  for (const ponto of ladoDireito) contorno.lineTo(ponto[0], ponto[1])
  // Volta pelo lado esquerdo, de cima para baixo, com o x negativo (espelhado).
  for (let i = ladoDireito.length - 1; i >= 0; i--) contorno.lineTo(-ladoDireito[i][0], ladoDireito[i][1])
  contorno.closePath()
  // Uma cópia clara logo atrás faz a luz do sol contornar a estátua.
  adicionarFiguraDoCristo(cena, contorno, '#ffcf9c', 0.07, -51.95)
  adicionarFiguraDoCristo(cena, contorno, '#1f2f38', 0, -51.9)
}

// A vista da varanda, em camadas, da mais longe para a mais perto: céu, montanhas com o Cristo e cidade.
function montarVista(cena: THREE.Scene) {
  // Céu do fim de tarde, com o sol e algumas nuvens.
  const ceu = novoDesenho(1024, 1024, 320, 60, [0, 25, -92])
  const ctxDoCeu = ceu.ctx
  const degrade = ctxDoCeu.createLinearGradient(0, 0, 0, 1024)
  degrade.addColorStop(0, '#16406b')
  degrade.addColorStop(0.45, '#3f769f')
  degrade.addColorStop(0.68, '#eeb193')
  degrade.addColorStop(0.83, '#ffcf95')
  degrade.addColorStop(1, '#ffe6b8')
  ctxDoCeu.fillStyle = degrade
  ctxDoCeu.fillRect(0, 0, 1024, 1024)
  const sol = ctxDoCeu.createRadialGradient(xNoDesenho(ceu, 62), yNoDesenho(ceu, 7), 4, xNoDesenho(ceu, 62), yNoDesenho(ceu, 7), 260)
  sol.addColorStop(0, 'rgb(255 244 214 / 0.95)')
  sol.addColorStop(1, 'rgb(255 214 160 / 0)')
  ctxDoCeu.fillStyle = sol
  ctxDoCeu.fillRect(0, 0, 1024, 1024)
  ctxDoCeu.fillStyle = 'rgb(255 226 214 / 0.5)'
  // Nuvens: [x, y, raio na horizontal, raio na vertical], em metros do mundo.
  const nuvens = [[-34, 24, 26, 0.9], [-8, 27, 18, 0.6], [26, 22, 30, 0.8], [58, 26, 20, 0.7], [-70, 19, 24, 0.7]]
  for (const nuvem of nuvens) {
    ctxDoCeu.beginPath()
    ctxDoCeu.ellipse(xNoDesenho(ceu, nuvem[0]), yNoDesenho(ceu, nuvem[1]), (nuvem[2] / 320) * 1024, (nuvem[3] / 60) * 1024, 0, 0, 7)
    ctxDoCeu.fill()
  }
  cena.add(planoDaPaisagem(ceu))

  const montanhas = novoDesenho(2048, 1024, 170, 40, [0, 12, -52])
  const ctxDasMontanhas = montanhas.ctx
  // Serra distante, apagada pela névoa, e o Pão de Açúcar à direita.
  ctxDasMontanhas.fillStyle = '#8c9ab0'
  preencherContorno(montanhas, [[-85, 3.4], [-60, 5.6], [-44, 4.2], [-28, 6], [-10, 3.6], [8, 3], [28, 3.4], [34, 6.4], [37, 7.4], [40, 6.6], [43, 3.2], [50, 3], [62, 4.8], [85, 2.6]], -8)
  // Morro do Corcovado, com o pico embaixo do Cristo.
  const floresta = ctxDasMontanhas.createLinearGradient(0, yNoDesenho(montanhas, 10), 0, yNoDesenho(montanhas, 1))
  floresta.addColorStop(0, '#34604f')
  floresta.addColorStop(1, '#1d4340')
  ctxDasMontanhas.fillStyle = floresta
  const pico = [[-85, 0.8], [-58, 2.2], [-44, 3], [-32, 4.6], [-22, 4.2], [-14, 5.8], [-7, 7], [1, 8.2], [4.4, 9.4], [5.6, 9.6], [8.4, 9.6], [9.8, 8.8], [12, 6.8], [16, 5.2], [22, 4.2], [28, 3], [40, 2], [60, 1.2], [85, 0.6]]
  preencherContorno(montanhas, pico, -8)
  // Pedra exposta perto do topo.
  ctxDasMontanhas.fillStyle = '#6f7564'
  preencherContorno(montanhas, [[5, 9.4], [5.8, 9.6], [8.2, 9.6], [9.2, 8.8], [10.4, 7.4], [8.2, 7], [6.6, 7.8]], 7)
  // Copas da floresta da Tijuca: 900 manchas verdes, só abaixo da linha do morro.
  for (let i = 0; i < 900; i++) {
    const mx = -85 + Math.random() * 170
    const my = -2 + Math.random() * 7
    ctxDasMontanhas.fillStyle = `hsl(${148 + Math.random() * 24} ${28 + Math.random() * 14}% ${18 + Math.random() * 14}% / 0.5)`
    ctxDasMontanhas.beginPath()
    ctxDasMontanhas.ellipse(xNoDesenho(montanhas, mx), yNoDesenho(montanhas, my), 7 + Math.random() * 14, 4 + Math.random() * 8, 0, 0, 7)
    // Altura do morro naquele ponto: duas rampas, uma de cada lado do pico.
    let limite = 6.5 * Math.max(0, 1 - Math.abs(mx - 10) / 40)
    if (mx < 5) limite = 8.2 * Math.max(0, 1 - Math.abs(mx - 5) / 60)
    if (my < limite) ctxDasMontanhas.fill()
  }
  cena.add(planoDaPaisagem(montanhas))
  montarCristo(cena)

  const cidade = novoDesenho(2048, 512, 100, 20, [0, 4, -28])
  const ctxDaCidade = cidade.ctx
  ctxDaCidade.fillStyle = '#17352f'
  preencherContorno(cidade, [[-50, 5.2], [-30, 4.6], [-16, 3.6], [-6, 2.6], [8, 2.2], [20, 3.2], [34, 4.4], [50, 5]], -6)
  // Prédios entre os morros, com as janelas acesas no fim da tarde.
  let px = -20
  while (px < 26) {
    const largura = 1.2 + Math.random() * 1.8
    const altura = 2.8 + Math.random() * 1.6
    if (Math.random() > 0.5) ctxDaCidade.fillStyle = '#223f47'
    else ctxDaCidade.fillStyle = '#2b4a50'
    ctxDaCidade.fillRect(xNoDesenho(cidade, px), yNoDesenho(cidade, altura), xNoDesenho(cidade, px + largura) - xNoDesenho(cidade, px), yNoDesenho(cidade, -6) - yNoDesenho(cidade, altura))
    ctxDaCidade.fillStyle = 'rgb(255 214 140 / 0.85)'
    for (let janelaY = altura - 0.35; janelaY > 1; janelaY -= 0.5) {
      for (let janelaX = px + 0.2; janelaX < px + largura - 0.25; janelaX += 0.45) {
        if (Math.random() > 0.55) ctxDaCidade.fillRect(xNoDesenho(cidade, janelaX), yNoDesenho(cidade, janelaY), 5, 6)
      }
    }
    px += largura + 0.2 + Math.random() * 0.8
  }
  // Árvores na frente dos prédios.
  for (let i = 0; i < 260; i++) {
    const ax = -50 + Math.random() * 100
    const topo = 1.2 + Math.abs(ax) * 0.09 + Math.random() * 1.2
    ctxDaCidade.fillStyle = `hsl(${140 + Math.random() * 30} ${30 + Math.random() * 16}% ${13 + Math.random() * 12}%)`
    ctxDaCidade.beginPath()
    ctxDaCidade.ellipse(xNoDesenho(cidade, ax), yNoDesenho(cidade, topo), 12 + Math.random() * 20, 12 + Math.random() * 16, 0, 0, 7)
    ctxDaCidade.fill()
  }
  // A faixa de baixo é toda preenchida, com a cor da última árvore.
  ctxDaCidade.fillRect(0, yNoDesenho(cidade, 1.1), 2048, 512 - yNoDesenho(cidade, 1.1))
  cena.add(planoDaPaisagem(cidade))
}

// A mesa: tampo claro, dois gaveteiros escuros e puxadores dourados.
function montarMesa(cena: THREE.Scene) {
  const tampo = new THREE.MeshStandardMaterial({ color: '#e7e4d5', roughness: 0.5 })
  const escuro = new THREE.MeshStandardMaterial({ color: '#23231c', roughness: 0.55 })
  const metal = new THREE.MeshStandardMaterial({ color: '#b98a3e', roughness: 0.35, metalness: 0.8 })
  cena.add(caixa(7, 0.16, 3, tampo, 0, 2.05, -1.4))
  for (const x of [-2.75, 2.75]) {
    cena.add(caixa(1.4, 1.95, 2.7, escuro, x, 0.98, -1.4))
    for (const y of [0.45, 1.05, 1.65]) cena.add(caixa(0.5, 0.05, 0.05, metal, x, y, -0.02))
    for (const y of [0.75, 1.35]) cena.add(caixa(1.34, 0.025, 0.02, new THREE.MeshStandardMaterial({ color: '#0c0c08' }), x, y, -0.04))
  }
}

// Um cilindro fino ligando dois pontos: um pedaço do braço da luminária.
function adicionarHaste(cena: THREE.Scene, material: THREE.Material, de: THREE.Vector3, ate: THREE.Vector3) {
  const direcao = ate.clone().sub(de)
  const malha = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, direcao.length(), 10), material)
  // Fica no meio do caminho entre os dois pontos...
  malha.position.copy(de).addScaledVector(direcao, 0.5)
  // ...e gira para ir de um ponto ao outro (o cilindro nasce em pé, no eixo y).
  malha.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direcao.normalize())
  malha.castShadow = true
  cena.add(malha)
}

// A luminária de mesa, com braço articulado e uma luz em cone apontada para a mesa.
function montarLuminaria(cena: THREE.Scene) {
  const latao = new THREE.MeshStandardMaterial({ color: '#c9933c', roughness: 0.32, metalness: 0.85 })
  const base = new THREE.Vector3(2.75, 2.15, -2.1)
  const cotovelo = new THREE.Vector3(3.2, 3.5, -2.2)
  const cabeca = new THREE.Vector3(2.15, 4.25, -1.75)
  const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.08, 28), latao)
  pe.position.copy(base)
  pe.castShadow = true
  cena.add(pe)
  adicionarHaste(cena, latao, base, cotovelo)
  adicionarHaste(cena, latao, cotovelo, cabeca)
  const cupula = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.56, 28, 1, true), new THREE.MeshStandardMaterial({ color: '#c9933c', roughness: 0.4, metalness: 0.7, side: THREE.DoubleSide }))
  cupula.position.copy(cabeca).add(new THREE.Vector3(-0.1, -0.12, 0.04))
  cupula.rotation.z = 0.32
  cena.add(cupula)
  const lampada = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff6d0' }))
  lampada.position.copy(cupula.position).add(new THREE.Vector3(-0.07, -0.2, 0))
  cena.add(lampada)
  // SpotLight é uma luz em cone, como a de uma lanterna.
  const luz = new THREE.SpotLight('#fff0c0', 70, 16, 0.85, 0.65, 1.5)
  luz.position.copy(lampada.position)
  luz.target.position.set(0.1, 2.1, -1.2)
  luz.castShadow = true
  luz.shadow.mapSize.set(1536, 1536)
  luz.shadow.bias = -0.0006
  luz.shadow.radius = 5
  cena.add(luz, luz.target)
}

// Cria um galho que sai de "de" na direção dada. Se ainda houver níveis, cria galhos menores na ponta.
// É uma função recursiva: ela chama a si mesma para cada galho novo, até os níveis acabarem.
function crescerGalho(copa: THREE.Group, casca: THREE.Material, pontas: THREE.Vector3[], de: THREE.Vector3, direcao: THREE.Vector3, comprimento: number, raio: number, niveis: number) {
  const ate = de.clone().addScaledVector(direcao, comprimento)
  const galho = new THREE.Mesh(new THREE.CylinderGeometry(raio * 0.68, raio, comprimento, 8), casca)
  galho.position.copy(de).addScaledVector(direcao, comprimento / 2)
  galho.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direcao)
  galho.castShadow = true
  copa.add(galho)
  if (niveis === 0) {
    pontas.push(ate) // ponta final, onde nascem as folhas
    return
  }
  let quantidade = 3
  if (niveis > 3) quantidade = 2
  for (let i = 0; i < quantidade; i++) {
    // O galho novo segue mais ou menos a direção do anterior, com um desvio sorteado.
    const novaDirecao = direcao.clone().add(new THREE.Vector3((sortear() - 0.5) * 1.15, (sortear() - 0.1) * 0.65, (sortear() - 0.5) * 1.15)).normalize()
    crescerGalho(copa, casca, pontas, ate, novaDirecao, comprimento * (0.68 + sortear() * 0.18), raio * 0.66, niveis - 1)
  }
}

// Uma árvore num vaso sobre a mesa. Devolve a copa, que balança um pouco.
function montarArvore(cena: THREE.Scene): THREE.Group {
  comecarSorteio(7)
  const arvore = new THREE.Group()
  arvore.position.set(-0.7, 2.13, -1.7)

  // Vaso: um perfil (meia silhueta) que gira em volta do eixo, como num torno.
  const perfil = [[0.32, 0], [0.42, 0.62], [0.46, 0.66], [0.46, 0.72], [0.4, 0.72]]
  const pontosDoVaso: THREE.Vector2[] = []
  for (const ponto of perfil) pontosDoVaso.push(new THREE.Vector2(ponto[0], ponto[1]))
  const vaso = new THREE.Mesh(new THREE.LatheGeometry(pontosDoVaso, 36), new THREE.MeshStandardMaterial({ color: '#b36a3a', roughness: 0.75, side: THREE.DoubleSide }))
  vaso.castShadow = true
  arvore.add(vaso)
  const terra = new THREE.Mesh(new THREE.CircleGeometry(0.4, 28), new THREE.MeshStandardMaterial({ color: '#21170f', roughness: 1 }))
  terra.rotation.x = -Math.PI / 2
  terra.position.y = 0.68
  arvore.add(terra)

  // Tronco e galhos: cada galho abre 2 ou 3 galhos menores, em 5 níveis.
  const casca = new THREE.MeshStandardMaterial({ color: '#4c3423', roughness: 0.9 })
  const copa = new THREE.Group()
  arvore.add(copa)
  const pontas: THREE.Vector3[] = []
  crescerGalho(copa, casca, pontas, new THREE.Vector3(0, 0.66, 0), new THREE.Vector3(0.03, 1, 0).normalize(), 0.95, 0.075, 5)

  // Folha: uma gota desenhada com duas curvas.
  const forma = new THREE.Shape()
  forma.moveTo(0, 0)
  forma.quadraticCurveTo(0.07, 0.08, 0, 0.21)
  forma.quadraticCurveTo(-0.07, 0.08, 0, 0)
  const folha = new THREE.ShapeGeometry(forma, 3)
  const folhasPorPonta = 7
  // InstancedMesh desenha muitas cópias da mesma folha de uma vez, o que é bem mais leve.
  const folhas = new THREE.InstancedMesh(folha, new THREE.MeshStandardMaterial({ color: '#ffffff', side: THREE.DoubleSide, roughness: 0.55 }), pontas.length * folhasPorPonta)
  // "modelo" é um objeto auxiliar: posicionamos ele e copiamos a posição para cada folha.
  const modelo = new THREE.Object3D()
  const cor = new THREE.Color()
  let indice = 0
  for (const ponta of pontas) {
    for (let i = 0; i < folhasPorPonta; i++) {
      modelo.position.copy(ponta).add(new THREE.Vector3((sortear() - 0.5) * 0.3, (sortear() - 0.5) * 0.28, (sortear() - 0.5) * 0.3))
      modelo.rotation.set(sortear() * 6.28, sortear() * 6.28, sortear() * 6.28)
      modelo.scale.setScalar(0.8 + sortear() * 0.8)
      modelo.updateMatrix()
      folhas.setMatrixAt(indice, modelo.matrix)
      folhas.setColorAt(indice, cor.setHSL(0.27 + sortear() * 0.07, 0.58, 0.28 + sortear() * 0.16))
      indice++
    }
  }
  folhas.castShadow = true
  copa.add(folhas)
  cena.add(arvore)
  return copa
}

// A plaquinha de mesa com a logo da ArborIA, como as de escritório: uma base de latão
// (o mesmo metal da luminária) segurando uma placa escura, um pouco inclinada para trás.
// Devolve a placa, para o clique nela mostrar quem fez o projeto.
function montarPlaquinha(cena: THREE.Scene): THREE.Mesh {
  const plaquinha = new THREE.Group()
  plaquinha.position.set(1.45, 2.13, -0.8)
  plaquinha.rotation.y = -0.12 // virada para quem olha a sala de frente
  const latao = new THREE.MeshStandardMaterial({ color: '#c9933c', roughness: 0.32, metalness: 0.85 })
  plaquinha.add(caixa(1.95, 0.08, 0.4, latao, 0, 0.04, 0))

  // A frente da placa é um desenho num <canvas>: primeiro o fundo escuro, depois a logo.
  const desenho = document.createElement('canvas')
  desenho.width = 2048
  desenho.height = 576
  const ctx = desenho.getContext('2d')!
  ctx.fillStyle = '#0e1512'
  ctx.fillRect(0, 0, desenho.width, desenho.height)
  const textura = new THREE.CanvasTexture(desenho)
  textura.colorSpace = THREE.SRGBColorSpace
  textura.anisotropy = 8 // deixa a logo nítida mesmo vista de lado

  // A placa é uma caixa fina, com a mesma proporção do desenho (2048 × 576).
  // BoxGeometry aceita um material para cada face, nesta ordem: direita, esquerda, cima, baixo, frente e trás.
  // Só a frente tem a logo.
  const pintura = new THREE.MeshStandardMaterial({ color: '#0e1512', roughness: 0.85 })
  const frente = new THREE.MeshStandardMaterial({ map: textura, roughness: 0.85 })
  const placa = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.506, 0.04), [pintura, pintura, pintura, pintura, frente, pintura])
  placa.position.y = 0.253 // metade da altura: assim a borda de baixo fica no encaixe
  placa.castShadow = true
  // O encaixe fica em cima da base. A placa gira em volta dele, como se estivesse presa na base.
  const encaixe = new THREE.Group()
  encaixe.position.y = 0.08
  encaixe.rotation.x = -0.24 // inclinação para trás, em radianos (uns 14 graus)
  encaixe.add(placa)
  plaquinha.add(encaixe)
  cena.add(plaquinha)

  // A logo vem do mesmo arquivo do topo do site, na versão para fundo escuro.
  // O arquivo chega depois que a sala já está montada: quando chegar, desenhamos a logo
  // no canvas e avisamos a textura que o desenho mudou (needsUpdate).
  fetch(endereco('/logo-escuro.svg'))
    .then(function (resposta) {
      return resposta.text()
    })
    .then(function (texto) {
      const svg = new DOMParser().parseFromString(texto, 'image/svg+xml')
      // O viewBox é "0 0 largura altura": o tamanho da logo dentro do arquivo.
      const medidas = svg.documentElement.getAttribute('viewBox')!.split(' ')
      const larguraDaLogo = Number(medidas[2])
      const alturaDaLogo = Number(medidas[3])
      // A logo ocupa 80% da largura da placa e fica centralizada.
      const escala = (desenho.width * 0.8) / larguraDaLogo
      ctx.translate((desenho.width - larguraDaLogo * escala) / 2, (desenho.height - alturaDaLogo * escala) / 2)
      ctx.scale(escala, escala)
      // O desenho da logo não começa no zero (o viewBox começa um pouco acima), então compensamos.
      ctx.translate(-Number(medidas[0]), -Number(medidas[1]))
      // Cada <path> do arquivo é uma parte da logo (letras, setas e tronco), com a sua cor.
      // O Path2D entende o mesmo formato de caminho do SVG, e "evenodd" deixa vazados os furos das letras.
      const caminhos = svg.querySelectorAll('path')
      for (let i = 0; i < caminhos.length; i++) {
        const caminho = new Path2D(caminhos[i].getAttribute('d')!)
        ctx.fillStyle = caminhos[i].getAttribute('fill')!
        ctx.fill(caminho, 'evenodd')
        // A árvore e o tronco têm um contorno da mesma cor, que engrossa o traço.
        const contorno = caminhos[i].getAttribute('stroke')
        if (contorno) {
          ctx.strokeStyle = contorno
          ctx.lineWidth = Number(caminhos[i].getAttribute('stroke-width'))
          ctx.stroke(caminho)
        }
      }
      textura.needsUpdate = true
    })
  return placa
}

// As células do mapa (hexágonos coloridos), soltas no ar nas cores da escala de prioridade.
function montarCelulas(cena: THREE.Scene): THREE.InstancedMesh {
  comecarSorteio(41)
  const cores = ['#d9a441', '#ee7f2d', '#e5252a']
  // Um cilindro de 6 lados, bem baixo, vira um hexágono com espessura.
  const celulas = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 6), new THREE.MeshStandardMaterial({ roughness: 0.4 }), 13)
  const modelo = new THREE.Object3D()
  const cor = new THREE.Color()
  for (let i = 0; i < celulas.count; i++) {
    // Ficam dos dois lados, para não cobrir o Cristo: as pares à esquerda, as ímpares à direita.
    let x
    if (i % 2 === 0) x = -3.2 + sortear() * 2.6
    else x = 3.2 + sortear() * 3.2
    modelo.position.set(x, 7.55 + sortear() * 1.1, -8.3 + sortear() * 1.9)
    modelo.rotation.set(Math.PI / 2 + (sortear() - 0.5) * 0.7, sortear() * 0.6, (sortear() - 0.5) * 0.7)
    modelo.scale.setScalar(0.55 + sortear() * 0.6)
    modelo.updateMatrix()
    celulas.setMatrixAt(i, modelo.matrix)
    celulas.setColorAt(i, cor.set(cores[Math.floor(sortear() * 3)]))
  }
  celulas.castShadow = true
  cena.add(celulas)
  return celulas
}

// Algo da sala em que dá para clicar: os painéis e a plaquinha da mesa.
// Ao clicar, a câmera para na frente dele e a legenda mostra estes textos.
interface Clicavel {
  malha: THREE.Mesh
  centro: THREE.Vector3
  largura: number
  altura: number
  giro: number // para que lado ele está virado
  inclinacao: number // quanto está deitado para trás, em radianos (a câmera sobe para olhar de frente)
  titulo: string
  texto: string
  itens: string[][] // linhas extras da legenda, cada uma com [nome, detalhe]
  rotulo: string // texto do botão
  destino: string // para onde o botão leva
}

// Quem fez o projeto: aparece ao clicar na plaquinha da mesa. São os mesmos dados de integrantes.txt.
const INTEGRANTES = [
  ['Anauã Paulo Campolina Vieitas Lima', 'RM 576103'],
  ['Bruno Smoktunowicz Baptista', 'RM 574739'],
  ['Caio Medeiros Machado', 'RM 575113'],
]

// Um painel com imagem, que flutua de leve na sala. Dá para clicar nele para ver de perto.
interface PainelDaSala {
  malha: THREE.Mesh
  material: THREE.MeshBasicMaterial
  posicaoInicial: THREE.Vector3
  fase: number // cada painel flutua num ritmo um pouco diferente
  largura: number
  altura: number
  giro: number // para que lado o painel está virado
  claridade: number // brilho mostrado agora, que anda aos poucos até o brilho desejado
  // Legenda mostrada quando o painel está em destaque, e para onde o botão leva.
  titulo: string
  texto: string
  rotulo: string
  destino: string
}

// Os painéis com os mapas e as fotos. Os 4 primeiros acompanham as paradas da câmera.
function montarPaineis(cena: THREE.Scene, renderizador: THREE.WebGLRenderer): PainelDaSala[] {
  const carregador = new THREE.TextureLoader()
  const folhas = [
    { imagem: '/landing/calor.jpg', tamanho: [4.1, 2.16], posicao: [-3.95, 4.2, -4.4], giro: 0.26, titulo: 'O calor, visto de cima', texto: 'Onde a superfície da cidade mais esquenta, medido por satélite.', rotulo: 'Ir para o mapa do calor', destino: '#calor' },
    { imagem: '/landing/copa.jpg', tamanho: [4.1, 2.16], posicao: [-4.3, 7.35, -4.4], giro: 0.26, titulo: 'Onde falta sombra', texto: 'As árvores com 3 metros ou mais, em toda a cidade.', rotulo: 'Ir para o mapa das árvores', destino: '#sombra' },
    { imagem: '/landing/prioridade.jpg', tamanho: [4.1, 2.17], posicao: [3.95, 4.75, -4.4], giro: -0.26, titulo: 'Uma nota por área', texto: 'Cada área recebe uma nota de 0 a 100, do verde ao vermelho.', rotulo: 'Ir para o mapa da nota', destino: '#nota' },
    { imagem: '/landing/tela-moradores.jpg', tamanho: [1.05, 2.27], posicao: [-0.1, 3.42, -0.4], giro: 0.32, titulo: 'Do mapa até a calçada', texto: 'A página dos moradores mostra o lugar mais próximo que precisa de árvore.', rotulo: 'Ir para a página dos moradores', destino: '#calcada' },
    { imagem: '/species/pitanga.jpg', tamanho: [1.5, 1.12], posicao: [5.05, 2.75, -1.2], giro: -0.42, titulo: 'Pitangueira', texto: 'Uma das mudas que a página dos moradores pode indicar.', rotulo: 'Ver a muda indicada perto de mim', destino: '/plantar' },
    { imagem: '/species/sibipiruna.jpg', tamanho: [1.5, 1.12], posicao: [5.75, 1.75, -2.1], giro: -0.42, titulo: 'Sibipiruna', texto: 'Uma das mudas que a página dos moradores pode indicar.', rotulo: 'Ver a muda indicada perto de mim', destino: '/plantar' },
  ]
  const paineis: PainelDaSala[] = []
  for (let i = 0; i < folhas.length; i++) {
    const folha = folhas[i]
    const textura = carregador.load(endereco(folha.imagem))
    textura.colorSpace = THREE.SRGBColorSpace
    // Deixa a imagem nítida mesmo quando vista de lado.
    textura.anisotropy = renderizador.capabilities.getMaxAnisotropy()
    const material = new THREE.MeshBasicMaterial({ map: textura, toneMapped: false, color: '#9d9d9d' })
    const malha = new THREE.Mesh(new THREE.PlaneGeometry(folha.tamanho[0], folha.tamanho[1]), material)
    malha.position.set(folha.posicao[0], folha.posicao[1], folha.posicao[2])
    malha.rotation.y = folha.giro
    cena.add(malha)
    // Sombra de papel: uma folha escura logo atrás dá corpo ao painel.
    const fundo = new THREE.Mesh(new THREE.PlaneGeometry(folha.tamanho[0] + 0.05, folha.tamanho[1] + 0.05), new THREE.MeshBasicMaterial({ color: '#090c08' }))
    fundo.position.z = -0.012
    malha.add(fundo)
    paineis.push({
      malha: malha, material: material, posicaoInicial: malha.position.clone(), fase: i * 1.3,
      largura: folha.tamanho[0], altura: folha.tamanho[1], giro: folha.giro, claridade: 0,
      titulo: folha.titulo, texto: folha.texto, rotulo: folha.rotulo, destino: endereco(folha.destino),
    })
  }
  return paineis
}

// Liga a sala 3D: monta tudo e começa a desenhar, acompanhando a rolagem da página.
// "tela" é o <canvas> e "blocoDaSala" é a parte da página onde a sala aparece.
export function iniciarSala(tela: HTMLCanvasElement, blocoDaSala: HTMLElement): void {
  const renderizador = new THREE.WebGLRenderer({ canvas: tela, antialias: true, powerPreference: 'high-performance' })
  // Em telas muito densas, a resolução tem um limite, para não pesar (no celular, um limite menor).
  let limiteDePixels = 1.75
  if (matchMedia('(max-width: 860px)').matches) limiteDePixels = 1.5
  renderizador.setPixelRatio(Math.min(devicePixelRatio, limiteDePixels))
  renderizador.shadowMap.enabled = true
  renderizador.shadowMap.type = THREE.PCFSoftShadowMap
  renderizador.toneMapping = THREE.ACESFilmicToneMapping
  renderizador.toneMappingExposure = 1.05

  const cena = new THREE.Scene()
  cena.background = new THREE.Color('#ffcf95')
  // Névoa: o que está longe fica mais apagado.
  cena.fog = new THREE.Fog('#0d2a2e', 13, 34)
  // Câmera com 46 graus de abertura, que enxerga de 0,1 até 150 unidades de distância.
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 150)

  montarVista(cena)
  montarSala(cena)
  montarVaranda(cena)
  montarMesa(cena)
  montarLuminaria(cena)
  const copa = montarArvore(cena)
  const placa = montarPlaquinha(cena)
  const paineis = montarPaineis(cena, renderizador)

  // Luzes da sala. Estas três mudam de cor conforme a parada da câmera.
  const luzAmbiente = new THREE.HemisphereLight('#ffffff', '#20200c', 1.35)
  cena.add(luzAmbiente)
  const luzDoTeto = new THREE.PointLight('#ffffff', 90, 34, 1.5)
  luzDoTeto.position.set(0, 7.2, 4)
  cena.add(luzDoTeto)
  const luzDaJanela = new THREE.PointLight('#ffffff', 26, 18, 1.6)
  luzDaJanela.position.set(0, 5, -7.8)
  cena.add(luzDaJanela)

  // Luz forte vinda da janela: é ela que desenha as sombras no chão e nas paredes.
  const sol = new THREE.DirectionalLight('#ffffff', 2.2)
  sol.position.set(-5, 8.4, 9)
  sol.target.position.set(0.5, 1.5, -2)
  sol.castShadow = true
  sol.shadow.mapSize.set(2048, 2048)
  // Tamanho da área em que o sol calcula sombras.
  sol.shadow.camera.left = -10
  sol.shadow.camera.right = 10
  sol.shadow.camera.top = 10
  sol.shadow.camera.bottom = -10
  sol.shadow.camera.far = 34
  sol.shadow.bias = -0.0005
  sol.shadow.radius = 4
  cena.add(sol, sol.target)

  const celulas = montarCelulas(cena)

  // Posição do mouse, de -1 a 1 nos dois eixos (0 é o meio da tela).
  const ponteiro = { x: 0, y: 0 }
  // A mesma posição, medida dentro do canvas e com o y para cima, que é como o Three.js espera.
  const ponteiroNaTela = new THREE.Vector2()
  let ponteiroMexeu = false
  addEventListener('pointermove', function (evento) {
    ponteiro.x = (evento.clientX / innerWidth) * 2 - 1
    ponteiro.y = (evento.clientY / innerHeight) * 2 - 1
    guardarPonteiro(evento)
    ponteiroMexeu = true
  }, { passive: true })

  function guardarPonteiro(evento: MouseEvent) {
    const caixaDaTela = tela.getBoundingClientRect()
    ponteiroNaTela.x = ((evento.clientX - caixaDaTela.left) / caixaDaTela.width) * 2 - 1
    ponteiroNaTela.y = -(((evento.clientY - caixaDaTela.top) / caixaDaTela.height) * 2 - 1)
  }

  // Painéis clicáveis. O Raycaster lança uma linha reta da câmera, passando pelo ponteiro,
  // e diz em qual painel ela bate primeiro. Devolve a posição do painel na lista, ou -1 se não bateu em nenhum.
  const raio = new THREE.Raycaster()
  // A lista do que é clicável: primeiro os painéis, na mesma ordem, e por último a plaquinha da mesa.
  const clicaveis: Clicavel[] = []
  for (const painel of paineis) {
    clicaveis.push({
      malha: painel.malha, centro: painel.posicaoInicial, largura: painel.largura, altura: painel.altura, giro: painel.giro, inclinacao: 0,
      titulo: painel.titulo, texto: painel.texto, itens: [], rotulo: painel.rotulo, destino: painel.destino,
    })
  }
  clicaveis.push({
    malha: placa, centro: new THREE.Vector3(1.45, 2.46, -0.85), largura: 1.8, altura: 0.506, giro: -0.12, inclinacao: 0.24,
    titulo: 'Quem fez a ArborIA',
    texto: 'Projeto da Global Solution 2026.2 da FIAP, no desafio CitizenTech. Engenharia de Software, 1º ano, Rio de Janeiro.',
    itens: INTEGRANTES, rotulo: 'Ver o código no GitHub', destino: 'https://github.com/Avieitas/arboria-ai',
  })
  const malhasClicaveis: THREE.Mesh[] = []
  for (const clicavel of clicaveis) malhasClicaveis.push(clicavel.malha)
  function painelSobOPonteiro(): number {
    raio.setFromCamera(ponteiroNaTela, camera)
    const batidas = raio.intersectObjects(malhasClicaveis, false)
    if (batidas.length === 0) return -1
    return malhasClicaveis.indexOf(batidas[0].object as THREE.Mesh)
  }

  // Destaque: ao clicar num painel, a câmera vai até a frente dele e a legenda aparece.
  const legenda = document.getElementById('sala-legenda')
  const tituloDaLegenda = document.getElementById('sala-titulo')
  const textoDaLegenda = document.getElementById('sala-texto')
  const listaDaLegenda = document.getElementById('sala-lista')
  const linkDaLegenda = document.getElementById('sala-link') as HTMLAnchorElement | null
  const botaoVoltar = document.getElementById('sala-voltar')
  let apontado = -1 // painel sob o mouse
  let emDestaque = -1 // painel em que a pessoa clicou
  let ultimoEmDestaque = 0 // guarda o painel enquanto a câmera volta
  let destaque = 0 // de 0 (sala normal) a 1 (câmera na frente do painel)

  function destacar(indice: number) {
    emDestaque = indice
    ultimoEmDestaque = indice
    const clicavel = clicaveis[indice]
    document.documentElement.classList.add('sala-em-foco')
    if (legenda && tituloDaLegenda && textoDaLegenda && linkDaLegenda && listaDaLegenda) {
      tituloDaLegenda.textContent = clicavel.titulo
      textoDaLegenda.textContent = clicavel.texto
      linkDaLegenda.textContent = clicavel.rotulo
      linkDaLegenda.href = clicavel.destino
      // As linhas extras (os integrantes, na plaquinha) viram itens da lista: nome à esquerda, detalhe à direita.
      listaDaLegenda.textContent = ''
      for (const item of clicavel.itens) {
        const linha = document.createElement('li')
        const detalhe = document.createElement('span')
        detalhe.textContent = item[1]
        linha.append(item[0], detalhe)
        listaDaLegenda.appendChild(linha)
      }
      listaDaLegenda.hidden = clicavel.itens.length === 0
      legenda.hidden = false
    }
  }
  function sairDoDestaque() {
    if (emDestaque === -1) return
    emDestaque = -1
    document.documentElement.classList.remove('sala-em-foco')
    if (legenda) legenda.hidden = true
  }

  blocoDaSala.addEventListener('click', function (evento) {
    // Cliques em links, botões e na legenda seguem o caminho normal.
    if ((evento.target as Element).closest('a, button, .sala-legenda')) return
    guardarPonteiro(evento)
    const indice = painelSobOPonteiro()
    if (indice === -1) sairDoDestaque()
    else destacar(indice)
  })
  if (botaoVoltar) botaoVoltar.addEventListener('click', sairDoDestaque)
  if (linkDaLegenda) linkDaLegenda.addEventListener('click', sairDoDestaque)
  addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') sairDoDestaque()
  })

  // Ajusta o desenho ao tamanho da tela. Com a tela em pé (celular), a câmera abre mais.
  function ajustarTamanho() {
    const largura = tela.clientWidth
    const altura = tela.clientHeight
    renderizador.setSize(largura, altura, false)
    camera.aspect = largura / altura
    if (camera.aspect < 0.8) camera.fov = 62
    else camera.fov = 46
    camera.updateProjectionMatrix()
  }
  new ResizeObserver(ajustarTamanho).observe(tela)
  ajustarTamanho()

  // Objetos reaproveitados a cada quadro: criar objetos novos 60 vezes por segundo pesaria.
  const cor = new THREE.Color()
  const proximaCor = new THREE.Color()
  const posicao = new THREE.Vector3()
  const olharPara = new THREE.Vector3()
  const auxiliar = new THREE.Vector3()
  const posicaoNoDestaque = new THREE.Vector3()
  const alvoNoDestaque = new THREE.Vector3()
  const ponteiroSuave = { x: 0, y: 0 }
  let progressoMostrado = 0
  // Abertura: nos primeiros segundos a câmera chega de mais longe e as telas acendem uma depois da outra.
  const DURACAO_DA_ABERTURA = 2600 // em milissegundos
  let inicioDaAbertura = -1 // marcado no primeiro quadro desenhado
  let visivel = true
  // Só desenha quando a sala está na tela, para não gastar bateria à toa.
  new IntersectionObserver(function (entradas) {
    visivel = entradas[0].isIntersecting
  }).observe(blocoDaSala)

  // Quanto da sala já foi rolado: 0 no começo e 1 no fim.
  function progressoDaRolagem() {
    const caixaDaSala = blocoDaSala.getBoundingClientRect()
    const distancia = caixaDaSala.height - innerHeight
    return Math.min(1, Math.max(0, -caixaDaSala.top / distancia))
  }

  // Desenha um quadro. O requestAnimationFrame chama esta função de novo antes do próximo quadro da tela.
  function desenharQuadro(agora: number) {
    requestAnimationFrame(desenharQuadro)
    if (!visivel) return
    const tempo = agora / 1000 // em segundos

    // A cada quadro, o progresso mostrado anda 9% do caminho até o real: isso deixa o movimento suave.
    progressoMostrado += (progressoDaRolagem() - progressoMostrado) * 0.09
    // A sala ocupa só a abertura: ao rolar para fora dela, a câmera vai da primeira parada até o mapa do calor,
    // que é o assunto da seção seguinte. As outras paradas continuam definidas, mas não são usadas.
    const trechos = PARADAS.length - 1
    const lugar = progressoMostrado * 1 // de 0 (primeira parada) até 1 (mapa do calor)
    const indice = Math.min(trechos - 1, Math.floor(lugar))
    // Cada parada segura a câmera por um tempo, enquanto o texto está na tela.
    const avancoNoTrecho = suavizar(Math.min(1, Math.max(0, (lugar - indice - 0.16) / 0.68)))
    const de = PARADAS[indice]
    const ate = PARADAS[indice + 1]
    // lerp mistura dois valores: 0 é o primeiro, 1 é o segundo e 0,5 é o meio do caminho.
    posicao.set(de.camera[0], de.camera[1], de.camera[2]).lerp(auxiliar.set(ate.camera[0], ate.camera[1], ate.camera[2]), avancoNoTrecho)
    olharPara.set(de.alvo[0], de.alvo[1], de.alvo[2]).lerp(auxiliar.set(ate.alvo[0], ate.alvo[1], ate.alvo[2]), avancoNoTrecho)

    cor.set(de.luz).lerp(proximaCor.set(ate.luz), avancoNoTrecho)
    luzAmbiente.color.copy(cor)
    luzDoTeto.color.copy(cor)
    luzDaJanela.color.copy(cor)

    // Abertura: vai de 0 a 1 em 2,6 segundos, rápido no começo e bem devagar no fim.
    if (inicioDaAbertura < 0) {
      inicioDaAbertura = agora
      document.documentElement.classList.add('sala-pronta') // o CSS faz o canvas aparecer aos poucos
    }
    const tempoDaAbertura = agora - inicioDaAbertura
    const abertura = 1 - Math.pow(1 - Math.min(1, tempoDaAbertura / DURACAO_DA_ABERTURA), 4)
    // A câmera começa mais alta e mais longe, e desce até a primeira parada.
    posicao.add(auxiliar.set(0, 0.9 * (1 - abertura), 4.5 * (1 - abertura)))
    olharPara.add(auxiliar.set(0, 0.35 * (1 - abertura), 0))

    // Quem rola a página sai do destaque: a câmera volta a acompanhar a rolagem.
    if (emDestaque !== -1 && progressoDaRolagem() > 0.04) sairDoDestaque()
    // O destaque anda aos poucos até 1 (painel clicado) ou até 0 (sala normal).
    let destaqueDesejado = 0
    if (emDestaque !== -1) destaqueDesejado = 1
    destaque += (destaqueDesejado - destaque) * 0.07
    const noDestaque = suavizar(destaque)
    if (destaque > 0.001) {
      // A câmera para na frente do item, na distância em que ele cabe inteiro na tela, com folga.
      const alvo = clicaveis[ultimoEmDestaque]
      const aberturaVertical = Math.tan((camera.fov * Math.PI) / 360)
      // A folga na altura é maior, porque a barra do topo e a legenda cobrem parte da tela.
      const distancia = Math.max((1.55 * alvo.altura) / 2 / aberturaVertical, (1.25 * alvo.largura) / 2 / (aberturaVertical * camera.aspect))
      // sen e cos do giro dão a direção para onde o item está virado. Se ele está deitado para trás,
      // a câmera sobe (sen da inclinação) e chega um pouco mais perto no chão (cos da inclinação).
      const noChao = distancia * Math.cos(alvo.inclinacao)
      posicaoNoDestaque.copy(alvo.centro).add(auxiliar.set(Math.sin(alvo.giro) * noChao, Math.sin(alvo.inclinacao) * distancia, Math.cos(alvo.giro) * noChao))
      // Olha um pouco abaixo do centro, para o item ficar acima da legenda.
      alvoNoDestaque.copy(alvo.centro).add(auxiliar.set(0, -alvo.altura * 0.04, 0))
      posicao.lerp(posicaoNoDestaque, noDestaque)
      olharPara.lerp(alvoNoDestaque, noDestaque)
    }

    // A câmera se mexe um pouquinho com o mouse, e menos quando um painel está em destaque.
    ponteiroSuave.x += (ponteiro.x - ponteiroSuave.x) * 0.05
    ponteiroSuave.y += (ponteiro.y - ponteiroSuave.y) * 0.05
    const balanco = 1 - noDestaque * 0.7
    camera.position.copy(posicao).add(auxiliar.set(ponteiroSuave.x * 0.34 * balanco, -ponteiroSuave.y * 0.2 * balanco, 0))
    camera.lookAt(olharPara)
    // O texto fica à esquerda (embaixo, no celular), então o centro da imagem vai para o espaço livre.
    // No destaque o texto some, e a imagem volta para o centro.
    const desvio = 1 - noDestaque
    if (camera.aspect < 0.8) camera.setViewOffset(tela.clientWidth, tela.clientHeight, 0, tela.clientHeight * 0.17 * desvio, tela.clientWidth, tela.clientHeight)
    else camera.setViewOffset(tela.clientWidth, tela.clientHeight, -tela.clientWidth * 0.2 * desvio, 0, tela.clientWidth, tela.clientHeight)

    // Descobre qual painel está sob o mouse, só quando o mouse se mexeu. O cursor vira a mãozinha.
    if (ponteiroMexeu) {
      ponteiroMexeu = false
      camera.updateMatrixWorld()
      apontado = painelSobOPonteiro()
      if (apontado === -1) blocoDaSala.style.cursor = ''
      else blocoDaSala.style.cursor = 'pointer'
    }

    for (let i = 0; i < paineis.length; i++) {
      const painel = paineis[i]
      // Flutua para cima e para baixo.
      painel.malha.position.y = painel.posicaoInicial.y + Math.sin(tempo * 0.7 + painel.fase) * 0.035
      // Os 4 primeiros painéis ficam mais claros quando a câmera chega neles.
      let perto = 0
      if (i <= 3) perto = Math.max(0, 1 - Math.abs(lugar - (i + 1)) * 1.3)
      let claridade = 0.62 + perto * 0.38
      // O painel sob o mouse clareia, e o painel em destaque fica com a cor cheia.
      if (i === apontado) claridade = Math.max(claridade, 0.86)
      if (i === emDestaque) claridade = 1
      // Na abertura, cada tela acende um pouco depois da anterior.
      claridade *= Math.min(1, Math.max(0, (tempoDaAbertura - 500 - i * 140) / 500))
      painel.claridade += (claridade - painel.claridade) * 0.15
      painel.material.color.setRGB(painel.claridade, painel.claridade, painel.claridade)
    }
    sol.color.copy(cor)
    celulas.position.y = Math.sin(tempo * 0.35) * 0.08
    celulas.rotation.y = Math.sin(tempo * 0.12) * 0.05
    copa.rotation.z = Math.sin(tempo * 0.6) * 0.012
    copa.rotation.x = Math.sin(tempo * 0.43) * 0.008
    renderizador.render(cena, camera)
  }
  requestAnimationFrame(desenharQuadro)
}
