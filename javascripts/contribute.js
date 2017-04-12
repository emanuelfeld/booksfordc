(function () {
    document.getElementById('contribute-amount-submit').addEventListener('click', function () {
        let amount = document.getElementById('contribute-amount-input').value
        trackOutboundLink(`https://booksfordc.herokuapp.com/contribute?amount=${amount}`)
        return false
    })
})()