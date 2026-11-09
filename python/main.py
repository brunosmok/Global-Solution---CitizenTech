# --- constantes do projeto ---
NOME_PROGRAMA = 'Menu de Arborização'

ESPACAMENTO_PEQUENO = 4.0    
ESPACAMENTO_MEDIO = 7.0
ESPACAMENTO_GRANDE = 10.0

LIMITE_ALERTA = 10000        


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


def ler_sementes():
    while True:
        tentativa = input('Quantidade de sementes (1 a 1000): ')
        if tentativa.isdigit():
            sementes = int(tentativa)
            if 1 <= sementes <= 1000:
                return sementes
            print('Quantidade fora da faixa (1 a 1000).')
        else:
            print('Isso não é um número.')


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
    print(f'Pequeno: {ESPACAMENTO_PEQUENO:.1f} m')
    print(f'Médio: {ESPACAMENTO_MEDIO:.1f} m')
    print(f'Grande: {ESPACAMENTO_GRANDE:.1f} m')
    print('Muito junto: as árvores competem por luz e água.')
    print('Muito longe: perde-se sombra e proteção do solo.')


def mostrar_resumo(total, soma, maior, alertas):
    if total == 0:
        print('Nenhum plantio registrado ainda.')
    else:
        media = calcular_media(soma, total)
        percentual = calcular_percentual(alertas, total)
        print(f'Plantios registrados: {total}')
        print(f'Área média: {media:.1f} m²')
        print(f'Maior área: {maior:.1f} m²')
        print(f'Plantios em alerta: {percentual:.1f}%')



# --- MENU ---

total_plantios = 0
soma_areas = 0.00
maior_area = 0.00
plantios_alerta = 0

print(f'=== {NOME_PROGRAMA} ===')

while True:
    mostrar_menu()
    opcao = input()
    match opcao:
        case '1':
            codigo = input('Porte da árvore '
                           '([1] Pequeno  [2] Médio  [3] Grande): ')
            espacamento = buscar_espacamento(codigo)

            if espacamento == 0.00:
                print('Código de porte inválido.')
            else:
                sementes = ler_sementes()
                area = calcular_area(sementes, espacamento)
                faixa = classificar_faixa(area)

                total_plantios += 1
                soma_areas += area
                if area > maior_area:
                    maior_area = area
                if esta_em_alerta(area):
                    plantios_alerta += 1

                print(f'\n{sementes} sementes de porte {buscar_nome_porte(codigo)}')
                print(f'Distância entre cada plantio: {espacamento:.1f} m')
                print(f'Área total necessária: {area:.0f} m²')
                print(f'Classificação: {faixa}')
                print(f'Benefício: {buscar_dica_porte(codigo)}')

        case '2':
            mostrar_espacamentos()

        case '3':
            mostrar_resumo(total_plantios, soma_areas, maior_area, plantios_alerta)

        case '4':
            break

        case _:
            print('Opção inválida.')

print('\nPrograma encerrado. Boas plantações!')