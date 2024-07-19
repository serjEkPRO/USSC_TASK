document.addEventListener('DOMContentLoaded', function() {
    fetchDataAndUpdateTable();
});
//setInterval(fetchDataAndUpdateTable, 5000);
function fetchDataAndUpdateTable() {
    fetch('/get-users') // Замените URL на ваш реальный endpoint
        .then(response => response.json())
        .then(data => {
            updateTable(data);
        })
        .catch(error => console.error('Ошибка при получении данных:', error));
}

function updateTable(data) {
    const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Очищаем текущие строки таблицы

    // Добавляем строки в таблицу из полученных данных
data.forEach(item => {
        let row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.age}</td>
                <td>${item.city}</td>
            </tr>`;
        tableBody.innerHTML += row;
    });
}
