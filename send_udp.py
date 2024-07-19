import socket
import datetime

# Адрес и порт коннектора
connector_address = "192.168.23.78"
connector_port = 514

# Функция для создания сообщения в формате syslog
def create_syslog_message(hostname, process, pid, message):
    timestamp = datetime.datetime.now().strftime("%b %d %H:%M:%S")
    syslog_message = f"<38>{timestamp} {hostname} {process}[{pid}]: {message}"
    return syslog_message

# Данные для сообщений
hostname = "AstraLinux"
process = "sshd"
pid = "28082"
message1 = "Accepted password for robot from 207.154.218.221 port 12345 ssh2"
message2 = "Accepted password for robot from 45.9.148.108 port 12345 ssh2"

# Создание сообщений в формате syslog
syslog_message1 = create_syslog_message(hostname, process, pid, message1)
syslog_message2 = create_syslog_message(hostname, process, pid, message2)

# Создание UDP сокета
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

try:
    # Отправка сообщений
    sock.sendto(syslog_message1.encode(), (connector_address, connector_port))
    sock.sendto(syslog_message2.encode(), (connector_address, connector_port))
    print("Сообщения отправлены")
finally:
    sock.close()
