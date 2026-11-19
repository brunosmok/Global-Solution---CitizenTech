# ============================================================
#  GS CitizenTech · Computational Thinking with Python
#  Atividade: O Cérebro da CitizenTech
#
#  Equipe: Anauã Paulo Campolina Vieitas Lima - RM 576103
#          Bruno Smoktunowicz Baptista - RM 574739
#          Caio Medeiros Machado - RM 575113
#  CitizenTech: ArborIA · Guardião da Muda
#  Problema, em uma frase: Quem mora em áreas quentes do Rio não sabe onde plantar,
#  qual muda usar nem a quem pedir, e a cidade precisa decidir onde plantar primeiro.
# ============================================================
#
#  Partes do programa:
#    PARTE 1 - Dados       (lista com 10+ registros)
#    PARTE 2 - Faixas      (os mesmos limites do circuito de Edge)
#    PARTE 3 - Menu        (loop que só termina no Sair)
#    PARTE 4 - Opções      (classificar, resumir, avisar)
# ============================================================


# ------------------------------------------------------------
# PARTE 1 - DADOS
# Módulo Pré-plantio: nome do programa, época de plantio e histórico
# de áreas planejadas. Módulo Pós-plantio: leituras do sensor
# (ESP32), linha de base do dia do plantio e dados dos bairros.
# Fonte dos dados: simulados pela equipe.
# ------------------------------------------------------------

NOME_PROGRAMA_PRE = 'Menu de Arborização - Planejamento ArborIA'
EPOCA_PLANTIO = 'outubro a dezembro (início das chuvas); até março, com rega frequente'

areas = [] # Guarda o histórico de áreas planejadas

leituras = [
    {"hora": 7, "temperatura": 27.5, "solo": 68, "luz": 60, "ar": 38, "tentativas": 0},
    {"hora": 9, "temperatura": 31.2, "solo": 58, "luz": 82, "ar": 42, "tentativas": 0},
    {"hora": 11, "temperatura": 35.1, "solo": 41, "luz": 91, "ar": 48, "tentativas": 0},
    {"hora": 12, "temperatura": 36.8, "solo": 33, "luz": 94, "ar": 47, "tentativas": 0},
    {"hora": 14, "temperatura": 40.3, "solo": 22, "luz": 97, "ar": 42, "tentativas": 0},
    {"hora": 15, "temperatura": 41.0, "solo": 18, "luz": 85, "ar": 41, "tentativas": 1},
    {"hora": 16, "temperatura": 39.2, "solo": 15, "luz": 80, "ar": 43, "tentativas": 2},
    {"hora": 17, "temperatura": -127.0, "solo": 14, "luz": 80, "ar": 49, "tentativas": 2},
    {"hora": 18, "temperatura": 33.0, "solo": 62, "luz": 60, "ar": 52, "tentativas": 0},
    {"hora": 19, "temperatura": 31.0, "solo": 60, "luz": 56, "ar": 52, "tentativas": 0},
]

linha_de_base = {"temperatura": 35.8, "ar": 47.0}

bairros = [
    {"nome": "Alto da Boa Vista", "areas": 10, "alta": 0},
    {"nome": "Cosmos", "areas": 100, "alta": 58},
    {"nome": "Madureira", "areas": 36, "alta": 27},
    {"nome": "Pavuna", "areas": 81, "alta": 66},
    {"nome": "Santa Cruz", "areas": 870, "alta": 118},
    {"nome": "Tijuca", "areas": 55, "alta": 2},
]


# ------------------------------------------------------------
# PARTE 2 - FAIXAS DE DECISÃO
# Limites e regras de classificação. Os limites do Pós-plantio são
# os mesmos da lógica embarcada no ESP32 (circuito de Edge).
# Os textos dos avisos são os mesmos que aparecem na página.
# ------------------------------------------------------------

# --- Pré-plantio: espaçamento, largura do espaço e área ---
ESPACAMENTO_PEQUENO = 4.0
ESPACAMENTO_MEDIO = 7.0
ESPACAMENTO_GRANDE = 10.0
LIMITE_ALERTA_AREA = 10000
LARGURA_MINIMA_CM = 150
LARGURA_MEDIO_CM = 250
LARGURA_GRANDE_CM = 400

# --- Pós-plantio: limites dos sensores do ESP32 ---
LIMITE_UMIDO = 60           
LIMITE_SECO = 30            
LIMITE_SECO_COM_CALOR = 40  
LIMITE_CALOR = 36.0         
LIMITE_SOL = 90             
TEMPERATURA_MINIMA = -10.0
TEMPERATURA_MAXIMA = 60.0
MAX_TENTATIVAS = 2          

# --- Pré-plantio: regras e textos por porte e por área ---
def buscar_espacamento(codigo):
    match codigo:
        case '1': return ESPACAMENTO_PEQUENO
        case '2': return ESPACAMENTO_MEDIO
        case '3': return ESPACAMENTO_GRANDE
        case _: return 0.00

def buscar_nome_porte(codigo):
    match codigo:
        case '1': return 'Pequeno'
        case '2': return 'Médio'
        case _: return 'Grande'

def buscar_dica_porte(codigo):
    match codigo:
        case '1': return 'Sombra pontual e boa atração de polinizadores.'
        case '2': return 'Sombra contínua e espaço para as raízes captarem água.'
        case _: return 'Máxima sombra e filtragem do ar; raízes fundas melhoram o solo.'

def indicar_porte(largura_cm):
    if largura_cm < LARGURA_MINIMA_CM: return '0'
    elif largura_cm < LARGURA_MEDIO_CM: return '1'
    elif largura_cm < LARGURA_GRANDE_CM: return '2'
    else: return '3'

def classificar_faixa(area):
    if area <= 500: return 'Plantio doméstico (quintal, praça pequena)'
    elif area <= 2000: return 'Plantio médio (condomínio, rua arborizada)'
    elif area <= LIMITE_ALERTA_AREA: return 'Plantio grande (parque, sítio)'
    else: return 'ALERTA: acima de 1 hectare, exige planejamento'

def esta_em_alerta(area):
    return area > LIMITE_ALERTA_AREA

# --- Pós-plantio: estados da muda e avisos ---
def classificar(leitura):
    if not (TEMPERATURA_MINIMA <= leitura["temperatura"] <= TEMPERATURA_MAXIMA):
        return "ERRO"

    limite_seco = LIMITE_SECO_COM_CALOR if leitura["temperatura"] >= LIMITE_CALOR else LIMITE_SECO
    tentativas = leitura.get("tentativas", 0)

    if leitura["solo"] >= LIMITE_UMIDO: return "SOLO OK"
    elif leitura["solo"] >= limite_seco: return "ATENÇÃO"
    elif tentativas >= MAX_TENTATIVAS: return "ALERTA"
    elif leitura["luz"] >= LIMITE_SOL: return "AGUARDANDO"
    else: return "REGANDO"

def aviso_da_muda(estado):
    match estado:
        case "SOLO OK": return "Muda bem cuidada."
        case "ATENÇÃO": return "Solo secando. Fique de olho."
        case "REGANDO": return "Regando a muda (Válvula acionada)."
        case "AGUARDANDO": return "Esperando o sol baixar para regar (Evitando evaporação)."
        case "ALERTA": return "Sem água? Peça ajuda! (Arduino tentou regar mas o solo continua seco)."
        case "ERRO": return "Verificar sensor! (Leitura de temperatura inválida)."
        case _: return "Estado desconhecido."

def aviso_do_bairro(alta, total_areas):
    if alta == 0:
        return "Nenhuma área deste bairro tem nota alta hoje."
    elif alta / total_areas >= 0.5:
        return "Mais da metade das áreas deste bairro tem nota alta. Aqui, uma árvore nova faz muita diferença."
    else:
        return "Parte deste bairro tem nota alta. Vale ver qual é o ponto mais perto de você."


# ------------------------------------------------------------
# PARTE 3 - MENU
# Menu principal e submenus de cada módulo. Cada menu repete até o
# usuário escolher voltar/sair. Entrada inválida NUNCA derruba o programa.
# ------------------------------------------------------------

def mostrar_menu_pre():
    print('\nOpção: [1] Novo plantio   [2] Consultar espaçamento   '
          '[3] Ver resumo   [4] Voltar ao Menu Principal')

def executar_pre():
    print(f'\n=== {NOME_PROGRAMA_PRE} ===')
    print('Calcule o espaço ideal antes de ativar o Guardião da Muda (ESP32).')
    
    while True:
        mostrar_menu_pre()
        opcao = ler_texto("> ")
        match opcao:
            case '1':
                codigo = ler_texto('Porte da árvore: [1] Pequeno  [2] Médio  [3] Grande  '
                                   '[4] Não sei, medir pelo espaço\n')
                if codigo == '4':
                    largura = ler_inteiro('Largura do espaço livre em cm', 1, 2000)
                    if largura is None: continue
                    codigo = indicar_porte(largura)
                    if codigo != '0':
                        print(f'Para {largura} cm de largura, o porte indicado é {buscar_nome_porte(codigo)}.')

                espacamento = buscar_espacamento(codigo)

                if espacamento == 0.00:
                    print(f'Porte não definido: código inválido ou espaço abaixo de {LARGURA_MINIMA_CM} cm.')
                else:
                    quantidade_mudas = ler_inteiro('Quantidade de mudas a plantar', 1, 1000)
                    if quantidade_mudas is None: continue
                    area = calcular_area(quantidade_mudas, espacamento)
                    faixa = classificar_faixa(area)
                    areas.append(area)

                    print(f'\n{quantidade_mudas} mudas de porte {buscar_nome_porte(codigo)}')
                    print(f'Distância exigida entre cada muda: {espacamento:.1f} m')
                    print(f'Área de solo total necessária: {area:.0f} m²')
                    print(f'Classificação da obra: {faixa}')
                    print(f'Benefício ambiental: {buscar_dica_porte(codigo)}')
                    print(f'Melhor época de plantio: {EPOCA_PLANTIO}')
                    print('Dica: Após o plantio, espete os sensores do Guardião da Muda no solo e ligue a energia.')

            case '2':
                mostrar_espacamentos()
            case '3':
                mostrar_resumo_pre(areas)
            case '4' | None:
                print("Saindo do módulo Pré-Plantio...")
                break
            case _:
                print('Opção inválida.')

def executar_pos():
    print("\n=== ArborIA: Dashboard de Monitoramento Pós-Plantio ===")
    print("Conectado à lógica do Guardião da Muda (ESP32).")

    while True:
        print("\n1 - Ver leituras diárias do sensor")
        print("2 - Ver resumo e avisos da planta")
        print("3 - Comparar com a Linha de Base (Botão Físico)")
        print("4 - Consultar áreas de plantio (Bairros)")
        print("5 - Inserir leitura manual do ESP32")
        print("0 - Voltar ao Menu Principal")

        opcao = ler_texto("> ")

        match opcao:
            case "0" | None:
                print("Saindo do Painel de Controle...")
                break
            case "1": mostrar_leituras()
            case "2": mostrar_resumo_pos()
            case "3": comparar_com_base()
            case "4": consultar_bairro()
            case "5": registrar_leitura()
            case _: print("Opção inválida.")

def main():
    while True:
        print("\n===========================================")
        print("           SISTEMA ARBORIA 1.0             ")
        print("===========================================")
        print("Escolha o módulo que deseja iniciar:")
        print("[1] Planejamento Pré-Plantio (Cálculo de Espaço e Mudas)")
        print("[2] Dashboard Pós-Plantio (Monitoramento do Sensor Arduino)")
        print("[0] Encerrar o Sistema")
        print("===========================================")
        
        escolha = ler_texto("> ")
        
        match escolha:
            case '1':
                executar_pre()
            case '2':
                executar_pos()
            case '0' | None:
                print("\nPrograma encerrado. Cuidar da natureza é cuidar do nosso futuro! ArborIA ˙ᵕ˙")
                break
            case _:
                print("Opção inválida. Digite 1, 2 ou 0.")


# ------------------------------------------------------------
# PARTE 4 - OPÇÕES
# Leitura de entradas, cálculos, resumos e exibição de cada opção.
# ------------------------------------------------------------

def ler_inteiro(mensagem, minimo, maximo):
    while True:
        tentativa = ler_texto(f'{mensagem} ({minimo} a {maximo}): ')
        if tentativa is None: return None  # Ctrl+D ou Ctrl+C: volta ao menu
        if tentativa.isdecimal():
            valor = int(tentativa)
            if minimo <= valor <= maximo:
                return valor
            print(f'Valor fora da faixa ({minimo} a {maximo}).')
        else:
            print('Isso não é um número.')

def calcular_area(quantidade_mudas, espacamento):
    return quantidade_mudas * espacamento ** 2

def mostrar_espacamentos():
    print(f'Pequeno: {ESPACAMENTO_PEQUENO:.1f} m  (espaço livre de {LARGURA_MINIMA_CM} a {LARGURA_MEDIO_CM - 1} cm)')
    print(f'Médio: {ESPACAMENTO_MEDIO:.1f} m  (espaço livre de {LARGURA_MEDIO_CM} a {LARGURA_GRANDE_CM - 1} cm)')
    print(f'Grande: {ESPACAMENTO_GRANDE:.1f} m  (espaço livre a partir de {LARGURA_GRANDE_CM} cm)')
    print('Muito junto: as árvores competem por luz e água.')
    print('Muito longe: perde-se sombra e proteção do solo.')
    print(f'Melhor época de plantio: {EPOCA_PLANTIO}.')

def mostrar_resumo_pre(areas_registradas):
    if len(areas_registradas) == 0:
        print('Nenhum plantio registrado ainda.')
    else:
        soma = 0.00
        maior = areas_registradas[0]
        alertas = 0

        for numero, area in enumerate(areas_registradas, start=1):
            print(f'  {numero}. {area:.0f} m² - {classificar_faixa(area)}')
            soma += area
            if area > maior: maior = area
            if esta_em_alerta(area): alertas += 1

        media = soma / len(areas_registradas)
        percentual = (alertas / len(areas_registradas)) * 100
        print(f'Plantios registrados: {len(areas_registradas)}')
        print(f'Área média: {media:.1f} m²')
        print(f'Maior área: {maior:.1f} m²')
        print(f'Plantios em alerta: {percentual:.1f}%')

def formatar(valor):
    return f"{valor:.1f}".replace(".", ",")

def formatar_diferenca(valor):
    return f"{valor:+.1f}".replace(".", ",")

def calcular_resumo(lista):
    soma_temperatura = 0
    soma_ar = 0
    mais_quente = lista[0]
    em_alerta = 0
    leituras_validas_temp = 0

    for leitura in lista:
        soma_ar += leitura["ar"]
        estado = classificar(leitura)
        
        if estado != "ERRO":
            soma_temperatura += leitura["temperatura"]
            leituras_validas_temp += 1
            if leitura["temperatura"] > mais_quente.get("temperatura", -999):
                mais_quente = leitura
                
        if estado in ["REGANDO", "AGUARDANDO", "ALERTA", "ERRO"]:
            em_alerta += 1

    media_temp = soma_temperatura / leituras_validas_temp if leituras_validas_temp > 0 else 0

    return {
        "media_temperatura": media_temp,
        "media_ar": soma_ar / len(lista),
        "mais_quente": mais_quente,
        "em_alerta": em_alerta,
        "percentual": (em_alerta / len(lista)) * 100,
    }

def ler_texto(mensagem):
    try:
        return input(mensagem).strip()
    except (EOFError, KeyboardInterrupt):
        print()
        return None

def ler_numero(mensagem, minimo, maximo):
    texto = ler_texto(mensagem)
    if texto is None: return None
    try:
        numero = float(texto.replace(",", "."))
        if not minimo <= numero <= maximo:
            print(f"Entrada inválida: use um valor de {minimo} a {maximo}.")
            return None
        return numero
    except ValueError:
        print("Entrada inválida: digite um número.")
        return None

def mostrar_leituras():
    print("\nHora   Temp.      Solo   Luz    Ar   Estado")
    for leitura in leituras:
        temp_str = formatar(leitura['temperatura']) if classificar(leitura) != "ERRO" else "--.-"
        print(f"{leitura['hora']:>2}h   {temp_str:>5} °C   "
              f"{leitura['solo']:>3.0f}%  {leitura['luz']:>3.0f}%  {leitura['ar']:>3.0f}   {classificar(leitura)}")

def mostrar_resumo_pos():
    resumo = calcular_resumo(leituras)
    mais_quente = resumo["mais_quente"]
    estado_atual = classificar(leituras[-1])
    
    print(f"\nTemperatura média: {formatar(resumo['media_temperatura'])} °C")
    print(f"Pico de calor: {formatar(mais_quente['temperatura'])} °C, às {mais_quente['hora']}h")
    print(f"Momentos críticos do dia: {resumo['em_alerta']} de {len(leituras)} ({formatar(resumo['percentual'])}%)")
    print(f"Estado na última leitura: {estado_atual}")
    print(f"AVISO DO SISTEMA: {aviso_da_muda(estado_atual)}")

def comparar_com_base():
    resumo = calcular_resumo(leituras)
    diferenca_temperatura = resumo["media_temperatura"] - linha_de_base["temperatura"]
    diferenca_ar = resumo["media_ar"] - linha_de_base["ar"]
    print(f"\nDesde o dia em que o BOTAO BASE foi apertado no Arduino:")
    print(f"Temperatura média: {formatar(resumo['media_temperatura'])} °C, base {formatar(linha_de_base['temperatura'])} °C ({formatar_diferenca(diferenca_temperatura)})")
    print(f"Qualidade do ar: {formatar(resumo['media_ar'])}, base {formatar(linha_de_base['ar'])} ({formatar_diferenca(diferenca_ar)})")
    print("Nota: Essa comparação ajuda a entender a evolução do microclima local.")

def consultar_bairro():
    print()
    for numero, bairro in enumerate(bairros, start=1):
        print(f"{numero} - {bairro['nome']}")

    escolha = ler_numero("Número do bairro: ", 1, len(bairros))
    if escolha is None or escolha != int(escolha):
        print("Entrada inválida.")
        return

    bairro = bairros[int(escolha) - 1]
    print(f"\n{bairro['nome']}: {bairro['alta']} de {bairro['areas']} áreas com nota alta ou muito alta.")
    print(f"AVISO: {aviso_do_bairro(bairro['alta'], bairro['areas'])}")

def registrar_leitura():
    hora = ler_numero("\nHora da leitura (0 a 23): ", 0, 23)
    if hora is None or hora != int(hora): return

    temperatura = ler_numero("Temperatura em °C: ", -50, 100) 
    if temperatura is None: return
    solo = ler_numero("Umidade do solo em %: ", 0, 100)
    if solo is None: return
    luz = ler_numero("Luz em %: ", 0, 100)
    if luz is None: return
    ar = ler_numero("Índice do ar, de 0 a 100: ", 0, 100)
    if ar is None: return
    
    tentativas = ler_numero("Tentativas de rega falhas (0 a 3): ", 0, 3)
    if tentativas is None: tentativas = 0

    leitura = {"hora": int(hora), "temperatura": temperatura, "solo": solo, "luz": luz, "ar": ar, "tentativas": int(tentativas)}
    leituras.append(leitura)
    estado = classificar(leitura)
    
    print(f"\nLeitura recebida do ESP32. Estado identificado: {estado}.")
    print(f"MENSAGEM DO LCD: {aviso_da_muda(estado)}")

# ------------------------------------------------------------
# PROGRAMA PRINCIPAL
# ------------------------------------------------------------
if __name__ == "__main__":
    main()