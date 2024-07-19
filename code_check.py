from itertools import permutations

def check_code(code, guess, correct_digits, correct_positions):
    correct_positions_count = sum(c == g for c, g in zip(code, guess))
    if correct_positions_count != correct_positions:
        print(f"Код {code} не совпадает с {guess} по позициям: ожидалось {correct_positions}, получено {correct_positions_count}")
        return False

    correct_digits_count = sum(min(code.count(c), guess.count(c)) for c in set(guess))
    if correct_digits_count != correct_digits:
        print(f"Код {code} не совпадает с {guess} по цифрам: ожидалось {correct_digits}, получено {correct_digits_count}")
        return False

    return True

hints = [
    ("8951", 2, 0),
    ("2169", 2, 1),
    ("3694", 2, 1),
    ("4721", 2, 1),
    ("1237", 3, 0)
]

# Проверка конкретного кода 2391
specific_code = "2391"
print(f"Проверка конкретного кода: {specific_code}")
for guess, correct_digits, correct_positions in hints:
    print(f"Проверка подсказки {guess} с кодом {specific_code}:")
    result = check_code(specific_code, guess, correct_digits, correct_positions)
    if result:
        print(f"Код {specific_code} соответствует подсказке {guess}")
    else:
        print(f"Код {specific_code} НЕ соответствует подсказке {guess}")

# Поиск всех возможных кодов
def find_possible_codes():
    possible_codes = []
    digits = '0123456789'

    for perm in permutations(digits, 4):
        code_str = ''.join(perm)
        all_match = True
        for guess, correct_digits, correct_positions in hints:
            if not check_code(code_str, guess, correct_digits, correct_positions):
                all_match = False
                break
        if all_match:
            print(f"Код {code_str} соответствует всем подсказкам")
            possible_codes.append(code_str)

    return possible_codes

possible_codes = find_possible_codes()
print("Возможные коды:", possible_codes)
