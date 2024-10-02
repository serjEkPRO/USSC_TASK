import requests

# URL вашего API для создания инцидентов
API_URL = 'http://localhost:5000/api/incidents'

# Данные инцидента
incident_data = {
    "organization_id": "31",
    "category_id": "24",
    "type_id": "28",
    "creator": "123",
    "responsible": "123",
    "evidence_link": "123",
    "evidence_name": "123",
    "created_at": "2024-10-02T13:52:25.164Z",
    "updated_at": "2024-10-02T13:52:25.164Z",
    "999": "123",
    "23432": "2024-10-10",
    "124324": "ghjghjg",
    "234324": True,
    "Справочник (Статус инцидента)": "Зарегистрирован",
    "Справочник (животные2)": "кошка"
}


# Функция для массового создания инцидентов
def create_incidents(batch_size=20):
    for i in range(batch_size):
        try:
            # Отправляем POST-запрос на создание инцидента
            response = requests.post(API_URL, json=incident_data)

            if response.status_code == 200:
                result = response.json()
                print(f"Инцидент {i + 1} создан успешно: ID {result['id']}, Created at {result['created_at']}")
            else:
                print(f"Ошибка при создании инцидента {i + 1}: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"Ошибка при создании инцидента {i + 1}: {str(e)}")


# Запускаем создание 20 инцидентов
create_incidents(20)
