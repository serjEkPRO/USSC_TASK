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
    $commitMessage = "Отображение текущего пользователя $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage

    # Push изменений
    git push origin main
}
#посмотреть хеши git log
#вернуть git reset --hard 30a7e3b73568e6f15c3f0e0ab6a946e8d69dfe8b

#вернуть на предыдущую ветку.
#git reset --hard origin/main
