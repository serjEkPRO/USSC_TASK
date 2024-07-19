document.getElementById('addRecord').addEventListener('click', function() {
    fetch('/add_record', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: "Имя",
            age: 25,
            city: "Город"
        })
    }).then(response => {
        if (response.ok) {
	    fetchDataAndUpdateTable();
            console.log('Запись добавлена');
            
        }
    });
});
document.getElementById('addRecord').addEventListener('click', fetchDataAndUpdateTable);
document.getElementById('deleteRecord').addEventListener('click', function() {
    fetch('/delete_record', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: "ID_записи_для_удаления"
        })
    }).then(response => {
        if (response.ok) {
            console.log('Запись удалена');
            // Обновите таблицу или UI здесь
        }
    });
});