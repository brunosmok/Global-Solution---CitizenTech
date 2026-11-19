/* =========================================================================
   ArborIA — guardiao.js (seção "Planejar e acompanhar a muda" da página inicial)
   Global Solution 2026.2 · CitizenTech · FIAP, Engenharia de Software, 1º ano
   Integrantes: Anauã Vieitas (RM 576103) · Bruno Smoktunowicz (RM 574739) · Caio Machado (RM 575113)
   ========================================================================= */

// O programa do Guardião da Muda (python/main.py) reescrito em JavaScript, para a página.
// - Antes do plantio: o porte da árvore (ou a largura do espaço livre) e a quantidade de mudas
//   dão o espaçamento, a área de solo e a classificação da obra.
// - Depois do plantio: as leituras do sensor (ESP32) viram um estado da muda e um aviso,
//   com resumo do dia e comparação com a linha de base do dia do plantio.
// Os dados, os limites, as regras e os textos são os mesmos do main.py.
//
// Tudo fica dentro de uma função que roda sozinha, para os nomes daqui não se misturarem
// com os de main.js (no zip da entrega, os dois arquivos são scripts comuns da mesma página).
;(function () {
  // ------------------------------------------------------------
  // PARTE 1 - DADOS (simulados pela equipe, como no main.py)
  // ------------------------------------------------------------
  const EPOCA_PLANTIO = 'outubro a dezembro (início das chuvas); até março, com rega frequente'

  const areas = [] // Guarda o histórico de áreas planejadas

  const leituras = [
    { hora: 7, temperatura: 27.5, solo: 68, luz: 60, ar: 38, tentativas: 0 },
    { hora: 9, temperatura: 31.2, solo: 58, luz: 82, ar: 42, tentativas: 0 },
    { hora: 11, temperatura: 35.1, solo: 41, luz: 91, ar: 48, tentativas: 0 },
    { hora: 12, temperatura: 36.8, solo: 33, luz: 94, ar: 47, tentativas: 0 },
    { hora: 14, temperatura: 40.3, solo: 22, luz: 97, ar: 42, tentativas: 0 },
    { hora: 15, temperatura: 41.0, solo: 18, luz: 85, ar: 41, tentativas: 1 },
    { hora: 16, temperatura: 39.2, solo: 15, luz: 80, ar: 43, tentativas: 2 },
    { hora: 17, temperatura: -127.0, solo: 14, luz: 80, ar: 49, tentativas: 2 },
    { hora: 18, temperatura: 33.0, solo: 62, luz: 60, ar: 52, tentativas: 0 },
    { hora: 19, temperatura: 31.0, solo: 60, luz: 56, ar: 52, tentativas: 0 },
  ]

  const linhaDeBase = { temperatura: 35.8, ar: 47.0 }

  // ------------------------------------------------------------
  // PARTE 2 - FAIXAS DE DECISÃO (os mesmos limites do circuito de Edge)
  // ------------------------------------------------------------

  // --- Pré-plantio: espaçamento, largura do espaço e área ---
  const ESPACAMENTO_PEQUENO = 4.0
  const ESPACAMENTO_MEDIO = 7.0
  const ESPACAMENTO_GRANDE = 10.0
  const LIMITE_ALERTA_AREA = 10000
  const LARGURA_MINIMA_CM = 150
  const LARGURA_MEDIO_CM = 250
  const LARGURA_GRANDE_CM = 400

  // --- Pós-plantio: limites dos sensores do ESP32 ---
  const LIMITE_UMIDO = 60
  const LIMITE_SECO = 30
  const LIMITE_SECO_COM_CALOR = 40
  const LIMITE_CALOR = 36.0
  const LIMITE_SOL = 90
  const TEMPERATURA_MINIMA = -10.0
  const TEMPERATURA_MAXIMA = 60.0
  const MAX_TENTATIVAS = 2

  // --- Pré-plantio: regras e textos por porte e por área ---
  // O código do porte é o mesmo do menu do Python: '1' pequeno, '2' médio e '3' grande.
  function buscarEspacamento(codigo) {
    switch (codigo) {
      case '1': return ESPACAMENTO_PEQUENO
      case '2': return ESPACAMENTO_MEDIO
      case '3': return ESPACAMENTO_GRANDE
      default: return 0.00
    }
  }

  function buscarNomePorte(codigo) {
    switch (codigo) {
      case '1': return 'Pequeno'
      case '2': return 'Médio'
      default: return 'Grande'
    }
  }

  function buscarDicaPorte(codigo) {
    switch (codigo) {
      case '1': return 'Sombra pontual e boa atração de polinizadores.'
      case '2': return 'Sombra contínua e espaço para as raízes captarem água.'
      default: return 'Máxima sombra e filtragem do ar; raízes fundas melhoram o solo.'
    }
  }

  function indicarPorte(larguraCm) {
    if (larguraCm < LARGURA_MINIMA_CM) return '0'
    else if (larguraCm < LARGURA_MEDIO_CM) return '1'
    else if (larguraCm < LARGURA_GRANDE_CM) return '2'
    else return '3'
  }

  function calcularArea(quantidadeMudas, espacamento) {
    return quantidadeMudas * espacamento ** 2
  }

  function classificarFaixa(area) {
    if (area <= 500) return 'Plantio doméstico (quintal, praça pequena)'
    else if (area <= 2000) return 'Plantio médio (condomínio, rua arborizada)'
    else if (area <= LIMITE_ALERTA_AREA) return 'Plantio grande (parque, sítio)'
    else return 'ALERTA: acima de 1 hectare, exige planejamento'
  }

  function estaEmAlerta(area) {
    return area > LIMITE_ALERTA_AREA
  }

  // --- Pós-plantio: estados da muda e avisos ---
  function classificar(leitura) {
    if (!(TEMPERATURA_MINIMA <= leitura.temperatura && leitura.temperatura <= TEMPERATURA_MAXIMA)) {
      return 'ERRO'
    }

    let limiteSeco = LIMITE_SECO
    if (leitura.temperatura >= LIMITE_CALOR) limiteSeco = LIMITE_SECO_COM_CALOR
    const tentativas = leitura.tentativas ?? 0

    if (leitura.solo >= LIMITE_UMIDO) return 'SOLO OK'
    else if (leitura.solo >= limiteSeco) return 'ATENÇÃO'
    else if (tentativas >= MAX_TENTATIVAS) return 'ALERTA'
    else if (leitura.luz >= LIMITE_SOL) return 'AGUARDANDO'
    else return 'REGANDO'
  }

  function avisoDaMuda(estado) {
    switch (estado) {
      case 'SOLO OK': return 'Muda bem cuidada.'
      case 'ATENÇÃO': return 'Solo secando. Fique de olho.'
      case 'REGANDO': return 'Regando a muda (Válvula acionada).'
      case 'AGUARDANDO': return 'Esperando o sol baixar para regar (Evitando evaporação).'
      case 'ALERTA': return 'Sem água? Peça ajuda! (Arduino tentou regar mas o solo continua seco).'
      case 'ERRO': return 'Verificar sensor! (Leitura de temperatura inválida).'
      default: return 'Estado desconhecido.'
    }
  }

  // Estados que contam como momento crítico do dia.
  const ESTADOS_CRITICOS = ['REGANDO', 'AGUARDANDO', 'ALERTA', 'ERRO']

  // ------------------------------------------------------------
  // PARTE 4 - CÁLCULOS E RESUMOS (mesmas contas do main.py)
  // ------------------------------------------------------------

  // Resumo dos plantios registrados: quantidade, área média, maior área e % em alerta.
  function resumirPlantios(areasRegistradas) {
    let soma = 0.00
    let maior = areasRegistradas[0]
    let alertas = 0
    for (const area of areasRegistradas) {
      soma += area
      if (area > maior) maior = area
      if (estaEmAlerta(area)) alertas += 1
    }
    return {
      quantidade: areasRegistradas.length,
      media: soma / areasRegistradas.length,
      maior: maior,
      percentual: (alertas / areasRegistradas.length) * 100,
    }
  }

  // Resumo do dia: temperatura média (sem as leituras com ERRO), pico de calor e momentos críticos.
  function calcularResumo(lista) {
    let somaTemperatura = 0
    let somaAr = 0
    let maisQuente = lista[0]
    let emAlerta = 0
    let leiturasValidasTemp = 0

    for (const leitura of lista) {
      somaAr += leitura.ar
      const estado = classificar(leitura)

      if (estado !== 'ERRO') {
        somaTemperatura += leitura.temperatura
        leiturasValidasTemp += 1
        if (leitura.temperatura > (maisQuente.temperatura ?? -999)) {
          maisQuente = leitura
        }
      }

      if (ESTADOS_CRITICOS.includes(estado)) {
        emAlerta += 1
      }
    }

    let mediaTemp = 0
    if (leiturasValidasTemp > 0) mediaTemp = somaTemperatura / leiturasValidasTemp

    return {
      mediaTemperatura: mediaTemp,
      mediaAr: somaAr / lista.length,
      maisQuente: maisQuente,
      emAlerta: emAlerta,
      percentual: (emAlerta / lista.length) * 100,
    }
  }

  // Escreve o número com as casas pedidas, arredondando como o Python (f'{valor:.1f}').
  // O toFixed do JavaScript dá o mesmo resultado, menos no empate exato (como 45,25 com uma casa):
  // o Python arredonda para o algarismo par (45,2) e o toFixed para cima (45,3).
  function comCasas(valor, casas) {
    const negativo = valor < 0 || Object.is(valor, -0)
    const positivo = Math.abs(valor)
    let texto = positivo.toFixed(casas)
    // Com 30 casas a mais, dá para ver se o número está exatamente no meio (…5000…).
    const longo = positivo.toFixed(casas + 30)
    if (longo.endsWith('5'.padEnd(30, '0'))) {
      const cortado = longo.slice(0, longo.length - 30).replace(/\.$/, '')
      if (Number(cortado[cortado.length - 1]) % 2 === 0) texto = cortado
    }
    return (negativo ? '-' : '') + texto
  }

  // Número no jeito brasileiro: vírgula nos decimais e ponto nos milhares (16.000 m²).
  function formatar(valor, casas = 1) {
    const [inteiro, decimais] = comCasas(valor, casas).split('.')
    const comMilhares = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return decimais === undefined ? comMilhares : `${comMilhares},${decimais}`
  }

  // Diferença sempre com sinal, para mostrar se subiu ou desceu.
  function formatarDiferenca(valor) {
    const texto = formatar(valor)
    return texto.startsWith('-') ? texto : '+' + texto
  }

  // Lê um número digitado, aceitando vírgula ou ponto. Devolve null se não for um número.
  function lerNumero(texto) {
    const limpo = String(texto).trim().replace(',', '.')
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(limpo)) return null
    return Number(limpo)
  }

  // ------------------------------------------------------------
  // PARTE 3 - TELA (o lugar dos menus do Python)
  // ------------------------------------------------------------

  // Cria um elemento com classe e texto.
  function criar(tag, classe, texto) {
    const elemento = document.createElement(tag)
    if (classe) elemento.className = classe
    if (texto !== undefined) elemento.textContent = texto
    return elemento
  }

  // Monta uma lista de definição (<dl>) a partir de pares [rótulo, valor].
  function preencherLista(lista, pares) {
    lista.textContent = ''
    for (const [rotulo, valor] of pares) {
      const linha = criar('div')
      linha.append(criar('dt', '', rotulo), criar('dd', '', valor))
      lista.appendChild(linha)
    }
  }

  // Antes do plantio: tabela de espaçamentos, calculadora e resumo dos plantios.
  function iniciarPre() {
    const formulario = document.getElementById('pre-form')
    const campoLargura = document.getElementById('pre-largura-campo')
    const largura = document.getElementById('pre-largura')
    const mudas = document.getElementById('pre-mudas')
    const erro = document.getElementById('pre-erro')
    const resultado = document.getElementById('pre-resultado')
    const historico = document.getElementById('pre-historico')
    const espacamentos = document.getElementById('pre-espacamentos')
    if (!formulario || !resultado || !historico || !espacamentos) return

    // Consultar espaçamento (opção 2 do Python).
    const portes = [
      ['Pequeno', ESPACAMENTO_PEQUENO, `${LARGURA_MINIMA_CM} a ${LARGURA_MEDIO_CM - 1} cm`],
      ['Médio', ESPACAMENTO_MEDIO, `${LARGURA_MEDIO_CM} a ${LARGURA_GRANDE_CM - 1} cm`],
      ['Grande', ESPACAMENTO_GRANDE, `a partir de ${LARGURA_GRANDE_CM} cm`],
    ]
    for (const [nome, espacamento, espaco] of portes) {
      const linha = criar('tr')
      linha.append(criar('td', '', nome), criar('td', '', `${formatar(espacamento)} m`), criar('td', '', espaco))
      espacamentos.appendChild(linha)
    }
    document.getElementById('pre-epoca').textContent = `Melhor época de plantio: ${EPOCA_PLANTIO}.`

    // O campo da largura só aparece em "Não sei, medir pelo espaço".
    function atualizarCampoLargura() {
      const escolhido = formulario.querySelector('input[name="porte"]:checked')
      campoLargura.hidden = !escolhido || escolhido.value !== '4'
    }
    formulario.addEventListener('change', atualizarCampoLargura)
    atualizarCampoLargura()

    function mostrarErro(texto) {
      erro.textContent = texto
    }

    // Resumo dos plantios (opção 3 do Python).
    function mostrarHistorico() {
      historico.textContent = ''
      if (areas.length === 0) {
        historico.appendChild(criar('p', 'guardiao__vazio', 'Nenhum plantio registrado ainda.'))
        return
      }
      const lista = criar('ol', 'guardiao__plantios')
      for (const area of areas) {
        lista.appendChild(criar('li', '', `${formatar(area, 0)} m² - ${classificarFaixa(area)}`))
      }
      const resumo = resumirPlantios(areas)
      const numeros = criar('dl', 'guardiao__numeros')
      preencherLista(numeros, [
        ['Plantios registrados', String(resumo.quantidade)],
        ['Área média', `${formatar(resumo.media)} m²`],
        ['Maior área', `${formatar(resumo.maior)} m²`],
        ['Plantios em alerta', `${formatar(resumo.percentual)}%`],
      ])
      historico.append(lista, numeros)
    }
    mostrarHistorico()

    // Novo plantio (opção 1 do Python).
    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault()
      mostrarErro('')
      const escolhido = formulario.querySelector('input[name="porte"]:checked')
      if (!escolhido) {
        mostrarErro('Escolha o porte da árvore.')
        return
      }
      let codigo = escolhido.value
      let frasePorte = ''
      if (codigo === '4') {
        const centimetros = lerNumero(largura.value)
        if (centimetros === null || !Number.isInteger(centimetros)) {
          mostrarErro('Isso não é um número.')
          largura.focus()
          return
        }
        if (centimetros < 150 || centimetros > 2000) {
          mostrarErro('Valor fora da faixa (150 a 2000).')
          largura.focus()
          return
        }
        codigo = indicarPorte(centimetros)
        if (codigo !== '0') frasePorte = `Para ${centimetros} cm de largura, o porte indicado é ${buscarNomePorte(codigo)}.`
      }

      const espacamento = buscarEspacamento(codigo)
      if (espacamento === 0.00) {
        mostrarErro(`Porte não definido: código inválido ou espaço abaixo de ${LARGURA_MINIMA_CM} cm.`)
        return
      }

      const quantidadeMudas = lerNumero(mudas.value)
      if (quantidadeMudas === null || !Number.isInteger(quantidadeMudas)) {
        mostrarErro('Isso não é um número.')
        mudas.focus()
        return
      }
      if (quantidadeMudas < 1 || quantidadeMudas > 1000) {
        mostrarErro('Valor fora da faixa (1 a 1000).')
        mudas.focus()
        return
      }

      const area = calcularArea(quantidadeMudas, espacamento)
      const faixa = classificarFaixa(area)
      areas.push(area)

      resultado.textContent = ''
      if (frasePorte) resultado.appendChild(criar('p', 'guardiao__porte', frasePorte))
      let palavraMuda = 'mudas'
      if (quantidadeMudas === 1) palavraMuda = 'muda'
      resultado.appendChild(criar('p', 'guardiao__titulo', `${formatar(quantidadeMudas, 0)} ${palavraMuda} de porte ${buscarNomePorte(codigo)}`))
      const numeros = criar('dl', 'guardiao__numeros')
      preencherLista(numeros, [
        ['Distância entre cada muda', `${formatar(espacamento)} m`],
        ['Área de solo necessária', `${formatar(area, 0)} m²`],
      ])
      const classificacao = criar('p', 'guardiao__faixa', faixa)
      if (estaEmAlerta(area)) classificacao.classList.add('guardiao__faixa--alerta')
      resultado.append(
        numeros,
        classificacao,
        criar('p', '', `Benefício ambiental: ${buscarDicaPorte(codigo)}`),
        criar('p', '', 'Dica: depois do plantio, espete os sensores do Guardião da Muda no solo e ligue a energia.'),
      )
      mostrarHistorico()
    })
  }

  // Depois do plantio: leituras do dia, resumo, linha de base e nova leitura.
  function iniciarPos() {
    const tabela = document.getElementById('pos-leituras')
    const resumoNaTela = document.getElementById('pos-resumo')
    const estadoNaTela = document.getElementById('pos-estado')
    const avisoNaTela = document.getElementById('pos-aviso')
    const baseNaTela = document.getElementById('pos-base')
    const formulario = document.getElementById('pos-form')
    const mensagem = document.getElementById('pos-mensagem')
    if (!tabela || !resumoNaTela || !formulario) return

    // Ver leituras diárias do sensor (opção 1 do Python). "nova" marca a linha que acabou de entrar.
    function mostrarLeituras(nova) {
      tabela.textContent = ''
      leituras.forEach(function (leitura, posicao) {
        const estado = classificar(leitura)
        let temperatura = '--,-'
        if (estado !== 'ERRO') temperatura = `${formatar(leitura.temperatura)} °C`
        const linha = criar('tr')
        if (ESTADOS_CRITICOS.includes(estado)) linha.classList.add('guardiao__linha--critica')
        if (posicao === nova) linha.classList.add('guardiao__linha--nova')
        const celulaEstado = criar('td', 'guardiao__estado', estado)
        celulaEstado.title = avisoDaMuda(estado)
        linha.append(
          criar('td', '', `${leitura.hora}h`),
          criar('td', '', temperatura),
          criar('td', '', `${formatar(leitura.solo, 0)}%`),
          criar('td', '', `${formatar(leitura.luz, 0)}%`),
          criar('td', '', formatar(leitura.ar, 0)),
          celulaEstado,
        )
        tabela.appendChild(linha)
      })
    }

    // Resumo e avisos (opção 2) e comparação com a linha de base (opção 3).
    function mostrarResumo() {
      const resumo = calcularResumo(leituras)
      const estadoAtual = classificar(leituras[leituras.length - 1])
      preencherLista(resumoNaTela, [
        ['Temperatura média', `${formatar(resumo.mediaTemperatura)} °C`],
        [`Pico de calor, às ${resumo.maisQuente.hora}h`, `${formatar(resumo.maisQuente.temperatura)} °C`],
        [`Momentos críticos do dia (${formatar(resumo.percentual)}%)`, `${resumo.emAlerta} de ${leituras.length}`],
      ])
      estadoNaTela.textContent = estadoAtual
      avisoNaTela.textContent = avisoDaMuda(estadoAtual)

      const diferencaTemperatura = resumo.mediaTemperatura - linhaDeBase.temperatura
      const diferencaAr = resumo.mediaAr - linhaDeBase.ar
      preencherLista(baseNaTela, [
        ['Temperatura média', `${formatar(resumo.mediaTemperatura)} °C, base ${formatar(linhaDeBase.temperatura)} °C (${formatarDiferenca(diferencaTemperatura)})`],
        ['Qualidade do ar', `${formatar(resumo.mediaAr)}, base ${formatar(linhaDeBase.ar)} (${formatarDiferenca(diferencaAr)})`],
      ])
    }

    mostrarLeituras(-1)
    mostrarResumo()

    // Inserir leitura manual do ESP32 (opção 5 do Python), com as mesmas faixas aceitas.
    const campos = [
      { nome: 'hora', minimo: 0, maximo: 23 },
      { nome: 'temperatura', minimo: -50, maximo: 100 },
      { nome: 'solo', minimo: 0, maximo: 100 },
      { nome: 'luz', minimo: 0, maximo: 100 },
      { nome: 'ar', minimo: 0, maximo: 100 },
      { nome: 'tentativas', minimo: 0, maximo: 3 },
    ]
    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault()
      mensagem.classList.remove('guardiao__mensagem--erro')
      const leitura = {}
      for (const campo of campos) {
        const entrada = formulario.elements.namedItem(campo.nome)
        const numero = lerNumero(entrada.value)
        let problema = ''
        if (numero === null) problema = 'Entrada inválida: digite um número.'
        else if (numero < campo.minimo || numero > campo.maximo) problema = `Entrada inválida: use um valor de ${campo.minimo} a ${campo.maximo}.`
        else if ((campo.nome === 'hora' || campo.nome === 'tentativas') && !Number.isInteger(numero)) problema = 'Entrada inválida: use um número inteiro.'
        if (problema) {
          mensagem.classList.add('guardiao__mensagem--erro')
          mensagem.textContent = problema
          entrada.focus()
          return
        }
        leitura[campo.nome] = numero
      }

      leituras.push(leitura)
      const estado = classificar(leitura)
      mensagem.textContent = `Leitura recebida do ESP32. Estado identificado: ${estado}. Mensagem do LCD: ${avisoDaMuda(estado)}`
      mostrarLeituras(leituras.length - 1)
      mostrarResumo()
    })
  }

  // As regras ficam disponíveis fora da página, para conferir os resultados com o Python.
  globalThis.ArboriaGuardiao = {
    buscarEspacamento, buscarNomePorte, buscarDicaPorte, indicarPorte, calcularArea, classificarFaixa,
    estaEmAlerta, classificar, avisoDaMuda, resumirPlantios, calcularResumo, formatar, formatarDiferenca,
    leituras, linhaDeBase,
  }

  if (typeof document !== 'undefined') {
    iniciarPre()
    iniciarPos()
  }
})()
