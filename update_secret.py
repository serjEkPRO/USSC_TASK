import json
import pandas as pd

# Input JSON
input_json = {
  "page": 1,
  "size": 25,
  "pages": 2,
  "entries": 38,
  "data": [
    {
      "name": "ad_domain",
      "comment": "Имя домена полностью, т.к. из него будет составляться корень поиска (DC=contoso,DC=com). Например, contoso.com, а не contoso.",
      "createdAt": "2023-09-25T19:01:17.150318+05:00",
      "updatedAt": "2023-09-25T20:14:13.682482+05:00",
      "tags": [
        "ad"
      ]
    },
    {
      "name": "irp_import_endpoint_simple_playbook",
      "comment": "Конечная точка импорта сервера Eplat4m для простых плейбуков",
      "createdAt": "2023-09-25T19:01:17.273278+05:00",
      "updatedAt": "2023-09-25T19:15:15.26361+05:00",
      "tags": [
        "eplat"
      ]
    },
    {
      "name": "smb_username",
      "comment": "Логин для подключения к СХД",
      "createdAt": "2023-10-27T12:03:21.908483+05:00",
      "updatedAt": "2023-10-27T12:03:21.908483+05:00",
      "tags": [
        "smb"
      ]
    },
    {
      "name": "eplat_grant_type",
      "comment": "grant_type для eplat",
      "createdAt": "2023-09-25T19:01:17.202151+05:00",
      "updatedAt": "2023-09-25T19:44:50.676429+05:00",
      "tags": [
        "eplat"
      ]
    },
    {
      "name": "smb_password",
      "comment": "Пароль для подключения к СХД",
      "createdAt": "2023-10-27T12:04:07.1718+05:00",
      "updatedAt": "2023-10-27T12:04:07.1718+05:00",
      "tags": [
        "smb"
      ]
    },
    {
      "name": "exchange_server",
      "comment": "IP адрес или имя сервера Exchange, например ex.soar.expert",
      "createdAt": "2023-09-25T19:01:17.590393+05:00",
      "updatedAt": "2023-09-26T13:21:35.598274+05:00",
      "tags": [
        "exchange"
      ]
    },
    {
      "name": "windows_domain",
      "comment": "Домен для windows хостов",
      "createdAt": "2023-09-25T19:01:17.403004+05:00",
      "updatedAt": "2023-09-25T19:21:36.59003+05:00",
      "tags": [
        "windows"
      ]
    },
    {
      "name": "eplat_password",
      "comment": "Пароль пользователя eplat",
      "createdAt": "2023-09-25T19:01:17.186115+05:00",
      "updatedAt": "2023-09-25T19:45:12.893593+05:00",
      "tags": [
        "eplat"
      ]
    },
    {
      "name": "exchange_username",
      "comment": "Логин администратора безопасности. Например, admin.",
      "createdAt": "2023-09-25T19:01:17.097328+05:00",
      "updatedAt": "2024-02-13T17:13:58.235388+05:00",
      "tags": [
        "exchange"
      ]
    },
    {
      "name": "ad_login",
      "comment": "Имя пользователя, под которым подключаемся к AD. Например, JohnDoe.",
      "createdAt": "2023-09-25T19:01:17.255416+05:00",
      "updatedAt": "2023-09-25T20:14:28.977666+05:00",
      "tags": [
        "ad"
      ]
    },
    {
      "name": "keycloak_client_id",
      "comment": "client_id для keycloak",
      "createdAt": "2023-09-25T19:01:17.520559+05:00",
      "updatedAt": "2023-09-25T19:27:06.535604+05:00",
      "tags": [
        "keycloak"
      ]
    },
    {
      "name": "keycloak_client_secret",
      "comment": "client_secret для keycloak",
      "createdAt": "2023-09-25T19:01:17.114918+05:00",
      "updatedAt": "2023-09-25T19:27:21.426166+05:00",
      "tags": [
        "keycloak"
      ]
    },
    {
      "name": "keycloak_grant_type",
      "comment": "grant_type для keycloak",
      "createdAt": "2023-09-25T19:01:17.572519+05:00",
      "updatedAt": "2023-09-25T19:27:33.733979+05:00",
      "tags": [
        "keycloak"
      ]
    },
    {
      "name": "ad_password",
      "comment": "Пароль от пользователя. Например, qwerty123.",
      "createdAt": "2023-09-25T19:01:17.447406+05:00",
      "updatedAt": "2023-09-25T20:14:47.765143+05:00",
      "tags": [
        "ad"
      ]
    },
    {
      "name": "keycloak_password",
      "comment": "Пароль пользователя keycloak",
      "createdAt": "2023-09-25T19:01:17.385197+05:00",
      "updatedAt": "2023-09-25T19:27:47.731234+05:00",
      "tags": [
        "keycloak"
      ]
    },
    {
      "name": "keycloak_scope",
      "comment": "scope для keycloak",
      "createdAt": "2023-09-25T19:01:17.367116+05:00",
      "updatedAt": "2023-09-25T19:28:54.623439+05:00",
      "tags": [
        "keycloak"
      ]
    },
    {
      "name": "keycloak_username",
      "comment": "Имя пользователя keycloak",
      "createdAt": "2023-09-25T19:01:17.330793+05:00",
      "updatedAt": "2023-09-25T19:29:00.114631+05:00",
      "tags": [
        "keycloak"
      ]
    },
    {
      "name": "ad_server",
      "comment": "Имя или ip адрес ad сервера. Например, dc1.contoso.com.",
      "createdAt": "2023-09-25T19:01:17.484379+05:00",
      "updatedAt": "2023-09-25T20:16:17.468269+05:00",
      "tags": [
        "ad"
      ]
    },
    {
      "name": "irp_import_endpoint_mp_vm_servers",
      "comment": "",
      "createdAt": "2023-09-27T11:35:24.202714+05:00",
      "updatedAt": "2023-09-27T11:41:39.518984+05:00",
      "tags": [
        "eplat",
        "maxpatrol"
      ]
    },
    {
      "name": "eplat_domain",
      "comment": "домен для пользователя eplat",
      "createdAt": "2023-09-25T19:01:17.503098+05:00",
      "updatedAt": "2023-09-25T19:42:52.005122+05:00",
      "tags": [
        "eplat"
      ]
    },
    {
      "name": "communigate_password",
      "comment": "Пароль от пользователя. Например, qwerty123.",
      "createdAt": "2023-09-25T19:01:17.078002+05:00",
      "updatedAt": "2023-09-26T13:48:30.603103+05:00",
      "tags": [
        "communigate"
      ]
    },
    {
      "name": "irp_import_endpoint_mp_vm_soft",
      "comment": "api/v1/import/62236",
      "createdAt": "2023-09-27T11:46:37.236894+05:00",
      "updatedAt": "2023-09-27T11:46:37.236894+05:00",
      "tags": [
        "eplat",
        "maxpatrol"
      ]
    },
    {
      "name": "communigate_username",
      "comment": "Логин администратора безопасности. Например, admin.",
      "createdAt": "2023-09-25T19:01:17.5378+05:00",
      "updatedAt": "2023-09-26T13:48:37.43384+05:00",
      "tags": [
        "communigate"
      ]
    },
    {
      "name": "irp_import_endpoint_mp_vm_network_devices",
      "comment": "api/v1/import/62235",
      "createdAt": "2023-09-27T11:50:38.579026+05:00",
      "updatedAt": "2023-09-27T11:50:38.579026+05:00",
      "tags": [
        "eplat",
        "maxpatrol"
      ]
    },
    {
      "name": "irp_import_endpoint_mp_vm_desktops",
      "comment": "api/v1/import/62234",
      "createdAt": "2023-09-27T11:49:27.554763+05:00",
      "updatedAt": "2023-09-27T12:24:08.163498+05:00",
      "tags": [
        "eplat",
        "maxpatrol"
      ]
    }
  ]
}

# Convert JSON to DataFrame
df = pd.DataFrame(input_json["data"])

# Add a column for 'secret'
df["secret"] = ""

# Save to Excel
excel_file = "/mnt/data/json_to_excel.xlsx"
df.to_excel(excel_file, index=False)

excel_file
