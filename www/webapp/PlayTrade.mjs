document.getElementById('tradeForm').addEventListener('submit', function(event) {
    event.preventDefault()

    let trade = {
        date: document.getElementById('date').value,
        optionType: document.getElementById('optionType').value,
        underlyingAsset: document.getElementById('underlyingAsset').value,
        strikePrice: parseFloat(document.getElementById('strikePrice').value),
        expirationDate: document.getElementById('expirationDate').value,
        optionPremium: parseFloat(document.getElementById('optionPremium').value),
        quantity: parseInt(document.getElementById('quantity').value),
        buySell: document.getElementById('buySell').value,
        entryPrice: parseFloat(document.getElementById('entryPrice').value),
        exitPrice: null, // Placeholder for when you exit the trade
        profitLoss: null // Placeholder for profit/loss calculation
    }

    addTradeToTable(trade)
    clearForm()
})

function addTradeToTable(trade) {
    const tableBody = document.querySelector('#tradesTable tbody')
    const row = document.createElement('tr')

    row.innerHTML = `
        <td>${trade.date}</td>
        <td>${trade.optionType}</td>
        <td>${trade.underlyingAsset}</td>
        <td>${trade.strikePrice}</td>
        <td>${trade.expirationDate}</td>
        <td>${trade.optionPremium}</td>
        <td>${trade.quantity}</td>
        <td>${trade.buySell}</td>
        <td>${trade.entryPrice}</td>
        <td><input type="number" step="0.01" class="exitPriceInput" placeholder="Enter Exit Price"></td>
        <td class="profitLossCell"></td>
    `

    // Attach event listener to the exit price input field
    row.querySelector('.exitPriceInput').addEventListener('change', function() {
        const exitPrice = parseFloat(this.value)
        const profitLoss = calculateProfitLoss(trade, exitPrice)
        row.querySelector('.profitLossCell').textContent = profitLoss.toFixed(2)
    })

    tableBody.appendChild(row)
}

function calculateProfitLoss(trade, exitPrice) {
    const { optionType, strikePrice, optionPremium, quantity, buySell } = trade
    let optionValue

    if (optionType === 'Call') {
        optionValue = Math.max(0, exitPrice - strikePrice)
    } else if (optionType === 'Put') {
        optionValue = Math.max(0, strikePrice - exitPrice)
    }

    const initialCost = optionPremium * quantity * 100
    const finalValue = optionValue * quantity * 100
    let profitLoss

    if (buySell === 'Buy') {
        profitLoss = finalValue - initialCost
    } else if (buySell === 'Sell') {
        profitLoss = initialCost - finalValue
    }

    return profitLoss
}

function clearForm() {
    document.getElementById('tradeForm').reset()
}

export { calculateProfitLoss }