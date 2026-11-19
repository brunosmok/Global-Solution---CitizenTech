# ArborIA: modelagem matemática para decidir quando evitar a rega e quantas árvores plantar.
#
# Modelo 1, função trigonométrica: temperatura ao longo do dia.
# Modelo 2, função exponencial: crescimento da copa de uma árvore.
# Modelo 3, função logarítmica: tempo para a copa chegar a uma parte do tamanho adulto.
# Modelo 4, função polinomial do 1º grau: associação entre copa e calor da superfície.
#
# Este arquivo tem tudo o que o modelo precisa: as fórmulas, as leituras simuladas,
# os dados das áreas de Cosmos e o resultado da regressão térmica. Ele não lê nenhum
# outro arquivo. Ao rodar, cria a pasta graficos/ ao lado dele com os 5 gráficos
# usados no relatorio.pdf.
#
# Como rodar, na pasta deste arquivo:
#   pip install "matplotlib>=3.9" "numpy>=2.0" "sympy>=1.13"
#   python modelo.py
#
# O relatório em PDF foi montado com reportlab (reportlab>=4.0), que não é preciso
# para rodar o modelo.

import math
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # Salva os gráficos em arquivo, no lugar de abrir a janela do plt.show().
import matplotlib.pyplot as plt
import numpy as np
from sympy import Eq, cos, exp, pi, solve, symbols

PASTA = Path(__file__).parent
PASTA_GRAFICOS = PASTA / "graficos"
PASTA_GRAFICOS.mkdir(exist_ok=True)

x = symbols("x", real=True)  # Incógnita das equações resolvidas com o sympy.


def hora_formatada(hora):
    minutos = round(hora * 60)
    return f"{minutos // 60:02d}h{minutos % 60:02d}"


# ---------------------------------------------------------------------------
# Modelo 1: função trigonométrica. Temperatura ao longo do dia.
# ---------------------------------------------------------------------------
# A temperatura sobe e desce em um ciclo de 24 horas, por isso usamos o cosseno:
#   T(h) = 29,5 + 10.cos(π.(h - 14)/12)
# onde h é a hora do dia e T(h) é a temperatura em °C.
# 29,5 é a média do dia, 10 é a amplitude e 14 é a hora do pico.
# Os três valores foram escolhidos por tentativa, comparando a curva com as leituras.

MEDIA = 29.5
AMPLITUDE = 10
HORA_PICO = 14
LIMITE_CALOR = 36  # Mesmo limite do programa em Python e do sensor.

# Leituras simuladas de um dia quente, de hora em hora, das 7h às 18h: hora e temperatura em °C.
# São as mesmas de python/main.py nas horas em comum (7, 9, 11, 12, 14, 15, 16 e 18h). A diferença é
# às 17h: o Python tem 10 registros e simula ali uma falha do sensor, e aqui usamos 36,4 °C.
HORAS = np.arange(7, 19, 1)
TEMPERATURAS = np.array([27.5, 29.0, 31.2, 33.4, 35.1, 36.8, 38.2, 40.3, 41.0, 39.2, 36.4, 33.0])


def T(h):
    return MEDIA + AMPLITUDE * np.cos(np.pi * (h - HORA_PICO) / 12)


h = np.arange(0, 25, 1)
temperatura = T(h)

print("=== Modelo 1: temperatura ao longo do dia ===")
print("T(h) = 29,5 + 10.cos(π.(h - 14)/12)")
print("h | T(h)")
for i in range(len(h)):
    print(h[i], "|", round(temperatura[i], 1))

# Comparação entre o modelo e as leituras simuladas.
diferencas = T(HORAS) - TEMPERATURAS
erro_maximo = max(abs(diferencas))
print("\nh | leitura | modelo | diferença")
for i in range(len(HORAS)):
    print(HORAS[i], "|", TEMPERATURAS[i], "|", round(T(HORAS[i]), 1), "|", round(diferencas[i], 1))
print("Maior diferença:", round(erro_maximo, 1), "°C")

# Ponto de máximo: o cosseno vale no máximo 1, e isso acontece na hora do pico.
pico = MEDIA + AMPLITUDE
print("\nPonto de máximo:")
print("h =", HORA_PICO)
print("T(h) =", pico)

# Janela de calor forte: resolvemos a equação T(h) = 36.
equacao = Eq(MEDIA + AMPLITUDE * cos(pi * (x - HORA_PICO) / 12), LIMITE_CALOR)
resultado = solve(equacao, x)
print("\nSoluções de T(h) = 36:", resultado)
# O cosseno se repete a cada 24 horas, então somamos 24 à solução negativa.
solucoes = []
for valor in resultado:
    valor = float(valor)
    if valor < 0:
        valor = valor + 24
    solucoes.append(valor)
inicio = min(solucoes)
fim = max(solucoes)
print("Acima de 36 °C: das", hora_formatada(inicio), "às", hora_formatada(fim))

plt.figure(figsize=(7.5, 4))
plt.plot(h, temperatura, marker="o", label="T(h) = 29,5 + 10.cos(π.(h - 14)/12)", color="red")
plt.scatter(HORAS, TEMPERATURAS, label="Leituras simuladas", color="black", zorder=3)
plt.axhline(LIMITE_CALOR, label="Calor forte: 36 °C", color="orange", linestyle="--")
plt.axvspan(inicio, fim, label="Janela de calor forte", color="orange", alpha=0.2)
plt.title("Temperatura ao longo do dia")
plt.xlabel("Hora do dia (h)")
plt.ylabel("Temperatura (°C)")
plt.legend(fontsize=8)
plt.grid()
plt.gca().set_facecolor("lightgray")
plt.tight_layout()
plt.savefig(PASTA_GRAFICOS / "1_temperatura.png", dpi=170)
plt.close()


# ---------------------------------------------------------------------------
# Modelo 2: função exponencial. Crescimento da copa de uma árvore.
# ---------------------------------------------------------------------------
# Uma árvore cresce rápido no início e depois estabiliza no tamanho adulto:
#   C(t) = Cmax.(1 - e^(-0,15.t))
# onde t é o tempo em anos depois do plantio e C(t) é a área da copa em m².
# A taxa 0,15 e os tamanhos de copa adulta são hipóteses do projeto, não medições.

TAXA_CRESCIMENTO = 0.15  # por ano
COPA_ADULTA_M2 = {"pequena": 20, "média": 50, "grande": 80}
CORES = {"pequena": "green", "média": "blue", "grande": "purple"}


def C(t, copa_adulta):
    return copa_adulta * (1 - np.exp(-TAXA_CRESCIMENTO * t))


t = np.arange(0, 31, 1)
copa = C(t, COPA_ADULTA_M2["média"])

print("\n=== Modelo 2: crescimento da copa de uma árvore ===")
print("C(t) = 50.(1 - e^(-0,15.t)), para a copa adulta média")
print("t | C(t)")
for i in range(len(t)):
    print(t[i], "|", round(copa[i], 1))

plt.figure(figsize=(7.5, 4))
for nome in COPA_ADULTA_M2:
    plt.plot(t, C(t, COPA_ADULTA_M2[nome]), marker="o", label=f"Copa adulta {nome}: {COPA_ADULTA_M2[nome]} m²", color=CORES[nome])
plt.title("Crescimento da copa de uma árvore")
plt.xlabel("Tempo depois do plantio (anos)")
plt.ylabel("Área da copa (m²)")
plt.legend(fontsize=8)
plt.grid()
plt.gca().set_facecolor("lightgray")
plt.tight_layout()
plt.savefig(PASTA_GRAFICOS / "2_copa.png", dpi=170)
plt.close()


# ---------------------------------------------------------------------------
# Modelo 3: função logarítmica. Tempo para a copa chegar a uma parte do tamanho adulto.
# ---------------------------------------------------------------------------
# É a pergunta inversa do Modelo 2: em quantos anos a copa chega à parte p do tamanho adulto?
#   A(p) = -ln(1 - p) / 0,15
# onde p vai de 0 a 1 (0,5 é metade da copa adulta) e A(p) é o tempo em anos.


def A(p):
    return -np.log(1 - p) / TAXA_CRESCIMENTO


p = np.arange(0.1, 1.0, 0.1)
anos = A(p)

print("\n=== Modelo 3: tempo para a copa chegar a uma parte do tamanho adulto ===")
print("A(p) = -ln(1 - p) / 0,15")
print("p | A(p)")
for i in range(len(p)):
    print(round(p[i], 1), "|", round(anos[i], 1))

# Conferência: resolver a equação exponencial do Modelo 2 dá o mesmo resultado.
equacao = Eq(1 - exp(-TAXA_CRESCIMENTO * x), 0.5)
resultado = solve(equacao, x)
print("Solução de 1 - e^(-0,15.t) = 0,5:", resultado)

anos_50 = A(0.5)
anos_90 = A(0.9)
print("A copa chega a 50% do tamanho adulto em", round(anos_50, 1), "anos e a 90% em", round(anos_90, 1), "anos")

plt.figure(figsize=(7.5, 4))
plt.plot(p * 100, anos, marker="o", label="A(p) = -ln(1 - p) / 0,15", color="green")
plt.title("Tempo para a copa crescer")
plt.xlabel("Parte da copa adulta (%)")
plt.ylabel("Tempo depois do plantio (anos)")
plt.legend(fontsize=8)
plt.grid()
plt.gca().set_facecolor("lightgray")
plt.tight_layout()
plt.savefig(PASTA_GRAFICOS / "3_tempo.png", dpi=170)
plt.close()


# ---------------------------------------------------------------------------
# Aplicação dos Modelos 2 e 3: quantas árvores plantar em Cosmos.
# ---------------------------------------------------------------------------
# Os dados do bairro são os mesmos do site. Somamos só as áreas que têm nota.
#
# De onde vêm os dados: o site divide o município do Rio de Janeiro em 11.274
# hexágonos (arquivo hexes.json do projeto do site, que não está neste repositório). Cosmos tem 106 deles; 6 ficam sem nota
# porque já são arborizados, e os 100 que têm nota estão copiados logo abaixo, na
# mesma ordem do arquivo original. De cada um usamos só três valores:
#   areaHa: área do hexágono em hectares
#   canopy: fração do chão coberta por copa de árvores (0 a 1)
#   open:   fração de espaço aberto onde ainda dá para plantar (0 a 1)

BAIRRO = "Cosmos"
META_COPA = 0.20  # 20% do chão coberto, a mesma meta padrão do simulador do site.
PRAZOS = [5, 10, 20]  # anos

AREAS_COSMOS = [
    # (id do hexágono, areaHa, canopy, open)
    ("89a8a028007ffff", 10.82, 0.058, 0.034),
    ("89a8a02800fffff", 10.82, 0.086, 0.035),
    ("89a8a028017ffff", 10.82, 0.07, 0.0),
    ("89a8a028023ffff", 10.82, 0.071, 0.0),
    ("89a8a028027ffff", 10.82, 0.064, 0.0),
    ("89a8a02802bffff", 10.82, 0.022, 0.001),
    ("89a8a02802fffff", 10.82, 0.057, 0.058),
    ("89a8a028033ffff", 10.82, 0.056, 0.041),
    ("89a8a028037ffff", 10.82, 0.064, 0.009),
    ("89a8a02803bffff", 10.82, 0.061, 0.006),
    ("89a8a028067ffff", 10.82, 0.069, 0.0),
    ("89a8a028077ffff", 10.82, 0.079, 0.0),
    ("89a8a028083ffff", 10.82, 0.121, 0.002),
    ("89a8a028087ffff", 10.82, 0.154, 0.006),
    ("89a8a02808fffff", 10.82, 0.038, 0.0),
    ("89a8a028093ffff", 10.82, 0.109, 0.326),
    ("89a8a028097ffff", 10.82, 0.21, 0.135),
    ("89a8a0280a3ffff", 10.82, 0.081, 0.002),
    ("89a8a0280a7ffff", 10.82, 0.078, 0.019),
    ("89a8a0280abffff", 10.82, 0.039, 0.0),
    ("89a8a0280afffff", 10.82, 0.056, 0.0),
    ("89a8a0280b3ffff", 10.82, 0.233, 0.016),
    ("89a8a0280b7ffff", 10.82, 0.079, 0.0),
    ("89a8a0280bbffff", 10.82, 0.081, 0.001),
    ("89a8a02810bffff", 10.82, 0.166, 0.645),
    ("89a8a028113ffff", 10.82, 0.481, 0.241),
    ("89a8a028143ffff", 10.82, 0.299, 0.132),
    ("89a8a028147ffff", 10.82, 0.489, 0.278),
    ("89a8a02814bffff", 10.82, 0.107, 0.211),
    ("89a8a02814fffff", 10.82, 0.241, 0.449),
    ("89a8a028153ffff", 10.82, 0.099, 0.038),
    ("89a8a028157ffff", 10.82, 0.398, 0.185),
    ("89a8a02815bffff", 10.82, 0.103, 0.034),
    ("89a8a02816bffff", 10.82, 0.337, 0.061),
    ("89a8a02817bffff", 10.82, 0.223, 0.554),
    ("89a8a02819bffff", 10.82, 0.053, 0.013),
    ("89a8a0281c3ffff", 10.82, 0.029, 0.006),
    ("89a8a0281c7ffff", 10.82, 0.393, 0.16),
    ("89a8a0281cbffff", 10.82, 0.065, 0.008),
    ("89a8a0281cfffff", 10.82, 0.041, 0.02),
    ("89a8a0281d3ffff", 10.82, 0.061, 0.018),
    ("89a8a0281d7ffff", 10.82, 0.058, 0.007),
    ("89a8a0281dbffff", 10.82, 0.05, 0.004),
    ("89a8a028303ffff", 10.82, 0.087, 0.0),
    ("89a8a028307ffff", 10.82, 0.033, 0.0),
    ("89a8a02830bffff", 10.82, 0.093, 0.001),
    ("89a8a02830fffff", 10.82, 0.069, 0.0),
    ("89a8a028313ffff", 10.82, 0.063, 0.0),
    ("89a8a028317ffff", 10.82, 0.047, 0.0),
    ("89a8a02831bffff", 10.82, 0.072, 0.003),
    ("89a8a028333ffff", 10.82, 0.058, 0.0),
    ("89a8a028337ffff", 10.82, 0.172, 0.002),
    ("89a8a02833bffff", 10.82, 0.066, 0.013),
    ("89a8a028347ffff", 10.82, 0.153, 0.08),
    ("89a8a028357ffff", 10.82, 0.088, 0.008),
    ("89a8a028373ffff", 10.82, 0.093, 0.021),
    ("89a8a028383ffff", 10.82, 0.03, 0.566),
    ("89a8a028387ffff", 10.82, 0.195, 0.36),
    ("89a8a02838bffff", 10.82, 0.045, 0.216),
    ("89a8a02838fffff", 10.82, 0.088, 0.034),
    ("89a8a028393ffff", 10.82, 0.061, 0.0),
    ("89a8a028397ffff", 10.82, 0.074, 0.358),
    ("89a8a02839bffff", 10.82, 0.049, 0.046),
    ("89a8a0283a3ffff", 10.82, 0.027, 0.143),
    ("89a8a0283a7ffff", 10.82, 0.045, 0.0),
    ("89a8a0283abffff", 10.82, 0.046, 0.01),
    ("89a8a0283afffff", 10.82, 0.045, 0.0),
    ("89a8a0283b3ffff", 10.82, 0.055, 0.037),
    ("89a8a0283b7ffff", 10.82, 0.372, 0.297),
    ("89a8a0283bbffff", 10.82, 0.045, 0.0),
    ("89a8a0283c3ffff", 10.82, 0.125, 0.069),
    ("89a8a0283c7ffff", 10.82, 0.12, 0.225),
    ("89a8a0283cfffff", 10.82, 0.125, 0.001),
    ("89a8a0283d7ffff", 10.82, 0.114, 0.043),
    ("89a8a028423ffff", 10.82, 0.411, 0.427),
    ("89a8a028427ffff", 10.82, 0.364, 0.282),
    ("89a8a02842fffff", 10.82, 0.16, 0.445),
    ("89a8a028433ffff", 10.82, 0.44, 0.231),
    ("89a8a028437ffff", 10.82, 0.465, 0.332),
    ("89a8a0284a7ffff", 10.81, 0.376, 0.434),
    ("89a8a028543ffff", 10.82, 0.246, 0.001),
    ("89a8a028547ffff", 10.82, 0.054, 0.015),
    ("89a8a02854bffff", 10.82, 0.307, 0.036),
    ("89a8a02854fffff", 10.82, 0.075, 0.0),
    ("89a8a028553ffff", 10.82, 0.277, 0.035),
    ("89a8a028557ffff", 10.82, 0.032, 0.0),
    ("89a8a02855bffff", 10.82, 0.482, 0.15),
    ("89a8a028563ffff", 10.82, 0.075, 0.006),
    ("89a8a028567ffff", 10.82, 0.051, 0.037),
    ("89a8a02856bffff", 10.82, 0.049, 0.013),
    ("89a8a02856fffff", 10.82, 0.063, 0.031),
    ("89a8a028573ffff", 10.82, 0.055, 0.004),
    ("89a8a02857bffff", 10.82, 0.061, 0.0),
    ("89a8a0285c3ffff", 10.82, 0.179, 0.506),
    ("89a8a0285cbffff", 10.82, 0.498, 0.164),
    ("89a8a0285cfffff", 10.82, 0.215, 0.11),
    ("89a8a0285d3ffff", 10.82, 0.285, 0.566),
    ("89a8a0285dbffff", 10.82, 0.421, 0.392),
    ("89a8a028ed3ffff", 10.82, 0.36, 0.316),
    ("89a8a028edbffff", 10.82, 0.089, 0.006),
]

areas = 0
area_total = 0  # m²
copa_atual = 0  # m²
falta = 0  # m² de copa que faltam para a meta
espaco_aberto = 0  # m²
nao_cabe = 0  # m² de copa que faltam além do espaço aberto da própria área
for _id, area_ha, copa_da_area, aberto in AREAS_COSMOS:
    area = area_ha * 10_000  # hectares para metros quadrados
    falta_da_area = max(0, META_COPA - copa_da_area) * area
    aberto_da_area = aberto * area
    areas = areas + 1
    area_total = area_total + area
    copa_atual = copa_atual + copa_da_area * area
    falta = falta + falta_da_area
    espaco_aberto = espaco_aberto + aberto_da_area
    nao_cabe = nao_cabe + max(0, falta_da_area - aberto_da_area)
copa_media = copa_atual / area_total


def N(t, copa_adulta):
    """Número de árvores: a copa que falta dividida pela copa de uma árvore depois de t anos."""
    return falta / C(t, copa_adulta)


print(f"\n=== Árvores para chegar a {META_COPA:.0%} de copa em {BAIRRO} ===")
print(areas, "áreas com nota,", round(area_total / 10_000), "ha")
print("Copa atual:", round(copa_media * 100, 1), "%. Falta cobrir:", round(falta / 10_000), "ha")
print("Espaço aberto estimado:", round(espaco_aberto / 10_000), "ha")
print("Copa que não cabe no espaço aberto da própria área:", round(nao_cabe / 10_000), "ha")

tabela_arvores = {}
print("copa adulta | 5 anos | 10 anos | 20 anos")
for nome in COPA_ADULTA_M2:
    tabela_arvores[nome] = {}
    for prazo in PRAZOS:
        tabela_arvores[nome][prazo] = math.ceil(N(prazo, COPA_ADULTA_M2[nome]))  # Arredonda para cima.
    linha = tabela_arvores[nome]
    print(nome, "|", linha[5], "|", linha[10], "|", linha[20])

t = np.arange(3, 31, 1)
plt.figure(figsize=(7.5, 4))
for nome in COPA_ADULTA_M2:
    plt.plot(t, N(t, COPA_ADULTA_M2[nome]), marker="o", label=f"Copa adulta {nome}", color=CORES[nome])
plt.title(f"Árvores para chegar a {META_COPA:.0%} de copa em {BAIRRO}")
plt.xlabel("Prazo para alcançar a meta (anos)")
plt.ylabel("Árvores necessárias")
plt.legend(fontsize=8)
plt.grid()
plt.gca().set_facecolor("lightgray")
plt.tight_layout()
plt.savefig(PASTA_GRAFICOS / "4_arvores.png", dpi=170)
plt.close()


# ---------------------------------------------------------------------------
# Modelo 4: função polinomial do 1º grau. Copa e calor da superfície.
# ---------------------------------------------------------------------------
# O projeto mediu, entre as áreas da cidade, quanto a superfície é mais fria onde há mais copa.
# O resultado foi calculado na análise de dados do projeto do site e copiado aqui do arquivo
# meta.json (parte "thermal"), que não está neste repositório:
#   método: regressão entre hexágonos com bootstrap por blocos espaciais
#   resposta: temperatura da superfície relativa à mediana do recorte, por volta das
#             10h, nas estações quentes
#   controles: área construída, declividade e altitude
#   7.225 hexágonos, 269 blocos espaciais (resolução 7), 2.000 sorteios do bootstrap
#   R² = 0,713 (0,707 deixando cada bloco de fora)
#   sem os controles, o efeito seria -1,55 °C a cada 10 pontos de copa
#   abaixo da mediana de copa (12,47%): -0,782 °C; acima dela: -0,462 °C
#   a copa dos hexágonos vai de 1,75% (P5) a 42,55% (P95)
#   VIF: copa 1,48; construído 1,35; declividade 2,57; altitude 2,31
#   classificação: estimado
#   D(c) = a.c
# onde c são os pontos percentuais de copa a mais e D(c) é a diferença de temperatura em °C.

POR_10 = -0.524  # °C a cada 10 pontos de copa
POR_10_BAIXO = -0.623  # limite do intervalo do bootstrap
POR_10_ALTO = -0.414  # outro limite do intervalo do bootstrap
COEFICIENTE = POR_10 / 10  # °C por ponto de copa


def D(c):
    return COEFICIENTE * c


c = np.arange(0, 21, 1)
diferenca_por_copa = D(c)

print("\n=== Modelo 4: copa e calor da superfície ===")
print("D(c) =", round(COEFICIENTE, 4), ". c")
print("c | D(c)")
for i in range(len(c)):
    print(c[i], "|", round(diferenca_por_copa[i], 2))

# A meta soma estes pontos de copa à média do bairro.
pontos = falta / area_total * 100
diferenca = D(pontos)
diferenca_mais_forte = POR_10_BAIXO / 10 * pontos
diferenca_mais_fraca = POR_10_ALTO / 10 * pontos
print("A meta soma", round(pontos, 1), "pontos de copa:", round(diferenca, 2), "°C")
print("Margem: de", round(diferenca_mais_forte, 2), "a", round(diferenca_mais_fraca, 2), "°C")

# Quantos pontos de copa se associam a 1 °C a menos? Equação do 1º grau: D(c) = -1.
equacao = Eq(COEFICIENTE * x, -1)
resultado = solve(equacao, x)
pontos_para_1_grau = float(resultado[0])
print("Solução de D(c) = -1:", resultado)

plt.figure(figsize=(7.5, 4))
plt.plot(c, diferenca_por_copa, marker="o", label=f"D(c) = {COEFICIENTE:.4f}.c".replace(".", ",", 1), color="blue")
plt.title("Copa e calor da superfície")
plt.xlabel("Pontos percentuais de copa a mais")
plt.ylabel("Diferença de temperatura (°C)")
plt.legend(fontsize=8)
plt.grid()
plt.gca().set_facecolor("lightgray")
plt.tight_layout()
plt.savefig(PASTA_GRAFICOS / "5_calor.png", dpi=170)
plt.close()

print("\nGráficos salvos em", PASTA_GRAFICOS)
