# ArborIA: modelagem matemática para decidir quando evitar a rega e quantas árvores plantar.
#
# Modelo 1, função trigonométrica: temperatura ao longo do dia.
# Modelo 2, função exponencial: crescimento da copa de uma árvore.
# Modelo 3, função logarítmica: tempo para a copa chegar a uma parte do tamanho adulto.
# Modelo 4, função polinomial do 1º grau: associação entre copa e calor da superfície.
#
# Como rodar, na raiz do repositório:
#   pip install -r matematica/requirements.txt
#   python matematica/modelo.py

import json
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
ARQUIVO_HEXAGONOS = PASTA / "hexes.json"
ARQUIVO_METADADOS = PASTA / "meta.json"

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

# Mesmas leituras simuladas de python/main.py: hora e temperatura em °C.
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

BAIRRO = "Cosmos"
META_COPA = 0.20  # 20% do chão coberto, a mesma meta padrão do simulador do site.
PRAZOS = [5, 10, 20]  # anos

hexagonos = json.loads(ARQUIVO_HEXAGONOS.read_text(encoding="utf8"))
areas = 0
area_total = 0  # m²
copa_atual = 0  # m²
falta = 0  # m² de copa que faltam para a meta
espaco_aberto = 0  # m²
nao_cabe = 0  # m² de copa que faltam além do espaço aberto da própria área
for hexagono in hexagonos:
    if hexagono["bairro"] == BAIRRO and not hexagono["excluded"]:
        dados = hexagono["raw"]
        area = dados["areaHa"] * 10_000  # hectares para metros quadrados
        falta_da_area = max(0, META_COPA - dados["canopy"]) * area
        aberto_da_area = dados["open"] * area
        areas = areas + 1
        area_total = area_total + area
        copa_atual = copa_atual + dados["canopy"] * area
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
# O resultado está em meta.json e foi calculado em pipeline/thermal_model.py.
#   D(c) = a.c
# onde c são os pontos percentuais de copa a mais e D(c) é a diferença de temperatura em °C.

termico = json.loads(ARQUIVO_METADADOS.read_text(encoding="utf8"))["thermal"]
POR_10 = termico["per10pts"]  # °C a cada 10 pontos de copa
POR_10_BAIXO = termico["per10ptsLow"]
POR_10_ALTO = termico["per10ptsHigh"]
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
