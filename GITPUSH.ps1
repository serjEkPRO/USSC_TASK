# Перейдите в корневую папку проекта
Set-Location -Path "C:\SOARMASTER"

# Проверка статуса изменений
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "No changes to commit"
} else {
    # Добавьте все изменения в индекс
    git add -A

    # Создайте коммит с текущей датой и временем
    $commitMessage = "Подключен keycloak. Настроена аутентификация с использованием куки $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage

    # Push изменений
    git push origin main
}
#посмотреть хеши git log
#вернуть git reset --hard abc1234

#вернуть на предыдущую ветку.
#git reset --hard origin/main
