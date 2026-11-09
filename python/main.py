# --- constantes do projeto ---
NOME_PROGRAMA = 'Menu de Arborização'

ESPACAMENTO_PEQUENO = 4.0
ESPACAMENTO_MEDIO = 7.0
ESPACAMENTO_GRANDE = 10.0

LIMITE_ALERTA = 10000

LARGURA_MINIMA_CM = 150
LARGURA_MEDIO_CM = 250
LARGURA_GRANDE_CM = 400

EPOCA_PLANTIO = 'outubro a dezembro (início das chuvas); até março, com rega frequente'


# --- definições ---
def mostrar_menu():
    print('\nOpção: [1] Novo plantio   [2] Consultar espaçamento   '
          '[3] Ver resumo   [4] Sair')


def buscar_espacamento(codigo):
    match codigo:
        case '1':
            return ESPACAMENTO_PEQUENO
        case '2':
            return ESPACAMENTO_MEDIO
        case '3':
            return ESPACAMENTO_GRANDE
        case _:
            return 0.00


def buscar_nome_porte(codigo):
    match codigo:
        case '1':
            return 'Pequeno'
        case '2':
            return 'Médio'
        case _:
            return 'Grande'


def buscar_dica_porte(codigo):
    match codigo:
        case '1':
            return 'Sombra pontual e boa atração de polinizadores.'
        case '2':
            return 'Sombra contínua e espaço para as raízes captarem água.'
        case _:
            return 'Máxima sombra e filtragem do ar; raízes fundas melhoram o solo.'


def ler_inteiro(mensagem, minimo, maximo):
    while True:
        tentativa = input(f'{mensagem} ({minimo} a {maximo}): ').strip()
        if tentativa.isdecimal():
            valor = int(tentativa)
            if minimo <= valor <= maximo:
                return valor
            print(f'Valor fora da faixa ({minimo} a {maximo}).')
        else:
            print('Isso não é um número.')


def indicar_porte(largura_cm):
    if largura_cm < LARGURA_MINIMA_CM:
        return '0'
    elif largura_cm < LARGURA_MEDIO_CM:
        return '1'
    elif largura_cm < LARGURA_GRANDE_CM:
        return '2'
    else:
        return '3'


def calcular_area(sementes, espacamento):
    # cada árvore ocupa um quadrado de lado = espaçamento
    return sementes * espacamento ** 2


def classificar_faixa(area):
    if area <= 500:
        return 'Plantio doméstico (quintal, praça pequena)'
    elif area <= 2000:
        return 'Plantio médio (condomínio, rua arborizada)'
    elif area <= LIMITE_ALERTA:
        return 'Plantio grande (parque, sítio)'
    else:
        return 'ALERTA: acima de 1 hectare, exige planejamento'


def esta_em_alerta(area):
    return area > LIMITE_ALERTA


def calcular_media(soma, quantidade):
    return soma / quantidade


def calcular_percentual(parte, total):
    return parte / total * 100


def mostrar_espacamentos():
    print(f'Pequeno: {ESPACAMENTO_PEQUENO:.1f} m  (espaço livre de {LARGURA_MINIMA_CM} a {LARGURA_MEDIO_CM - 1} cm)')
    print(f'Médio: {ESPACAMENTO_MEDIO:.1f} m  (espaço livre de {LARGURA_MEDIO_CM} a {LARGURA_GRANDE_CM - 1} cm)')
    print(f'Grande: {ESPACAMENTO_GRANDE:.1f} m  (espaço livre a partir de {LARGURA_GRANDE_CM} cm)')
    print('Muito junto: as árvores competem por luz e água.')
    print('Muito longe: perde-se sombra e proteção do solo.')
    print(f'Melhor época de plantio: {EPOCA_PLANTIO}.')


def mostrar_resumo(areas):
    if len(areas) == 0:
        print('Nenhum plantio registrado ainda.')
    else:
        soma = 0.00
        maior = areas[0]
        alertas = 0

        for numero, area in enumerate(areas, start=1):
            print(f'  {numero}. {area:.0f} m² - {classificar_faixa(area)}')
            soma += area
            if area > maior:
                maior = area
            if esta_em_alerta(area):
                alertas += 1

        media = calcular_media(soma, len(areas))
        percentual = calcular_percentual(alertas, len(areas))
        print(f'Plantios registrados: {len(areas)}')
        print(f'Área média: {media:.1f} m²')
        print(f'Maior área: {maior:.1f} m²')
        print(f'Plantios em alerta: {percentual:.1f}%')


# --- MENU ---
areas = []

print(f'=== {NOME_PROGRAMA} ===')

while True:
    mostrar_menu()
    opcao = input().strip()
    match opcao:
        case '1':
            codigo = input('Porte da árvore: [1] Pequeno  [2] Médio  [3] Grande  '
                           '[4] Não sei, medir pelo espaço\n').strip()

            if codigo == '4':
                largura = ler_inteiro('Largura do espaço livre em cm', 150, 2000)
                codigo = indicar_porte(largura)
                if codigo != '0':
                    print(f'Para {largura} cm de largura, '
                          f'o porte indicado é {buscar_nome_porte(codigo)}.')

            espacamento = buscar_espacamento(codigo)

            if espacamento == 0.00:
                print(f'Porte não definido: código inválido ou espaço abaixo de {LARGURA_MINIMA_CM} cm.')
            else:
                sementes = ler_inteiro('Quantidade de sementes', 1, 1000)
                area = calcular_area(sementes, espacamento)
                faixa = classificar_faixa(area)

                areas.append(area)

                print(f'\n{sementes} sementes de porte {buscar_nome_porte(codigo)}')
                print(f'Distância entre cada plantio: {espacamento:.1f} m')
                print(f'Área total necessária: {area:.0f} m²')
                print(f'Classificação: {faixa}')
                print(f'Benefício: {buscar_dica_porte(codigo)}')
                print(f'Melhor época de plantio: {EPOCA_PLANTIO}')

        case '2':
            mostrar_espacamentos()

        case '3':
            mostrar_resumo(areas)

        case '4':
            break

        case _:
            print('Opção inválida.')

print('\nPrograma encerrado. Boas plantações!')