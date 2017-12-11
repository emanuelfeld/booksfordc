(function () {
    document.getElementById('contribute-amount-submit').addEventListener('click', function () {
        let amount = document.getElementById('contribute-amount-input').value
        window.open(`https://booksfordc.herokuapp.com/contribute?amount=${amount}&utm_source=firefox&utm_campaign=options`)
    })
})()
