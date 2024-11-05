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
    $commitMessage = "редактирование сохраненных фильтров 3.2 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage

    # Push изменений
    git push origin main --force
}
#посмотреть хеши git log
#вернуть git reset --hard 3765c0b4691acb23e3a45a408c78bcffdec4c03d

#вернуть на предыдущую ветку.
#git reset --hard origin/main
