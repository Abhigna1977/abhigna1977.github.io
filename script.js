// Local Storage keys
const STOCK_KEY = 'stockData';
const HISTORY_KEY = 'historyData';
let currentItemToSell = null;

// Load initial data
document.addEventListener('DOMContentLoaded', () => {
    loadStock();
    loadHistory();

    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');

    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('show');
    });

    // Modal functionality
    const modal = document.getElementById('sellModal');
    const span = document.getElementsByClassName('close')[0];
    const sellForm = document.getElementById('sellForm');

    span.onclick = () => {
        modal.style.display = 'none';
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    sellForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sellItem(currentItemToSell);
        modal.style.display = 'none';
    });
});

// Event listener for stock entry form submission
document.getElementById('stockEntryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addStock();
});

// Function to add stock to the inventory
function addStock() {
    const itemName = document.getElementById('itemName').value.trim();
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value, 10);
    
    let stockData = JSON.parse(localStorage.getItem(STOCK_KEY)) || {};

    if (stockData[itemName]) {
        stockData[itemName].todayStock += itemQuantity;
    } else {
        stockData[itemName] = {
            todayStock: itemQuantity,
            previousStock: 0,
        };
    }

    localStorage.setItem(STOCK_KEY, JSON.stringify(stockData));
    loadStock();

    // Clear form fields
    document.getElementById('itemName').value = '';
    document.getElementById('itemQuantity').value = '';
}

// Function to load stock data from LocalStorage and display it
function loadStock() {
    const stockData = JSON.parse(localStorage.getItem(STOCK_KEY)) || {};
    const stockBody = document.getElementById('stockBody');
    stockBody.innerHTML = '';

    Object.keys(stockData).forEach(itemName => {
        const row = document.createElement('tr');
        const availableStock = stockData[itemName].todayStock + stockData[itemName].previousStock;

        if (availableStock > 0) {
            row.innerHTML = `
                <td>${itemName}</td>
                <td>${availableStock}</td>
                <td>${stockData[itemName].previousStock}</td>
                <td><button onclick="openSellModal('${itemName}')">Sell</button></td>
            `;
            stockBody.appendChild(row);
        }
    });
}

// Function to open the modal to sell items
function openSellModal(itemName) {
    currentItemToSell = itemName;
    const modal = document.getElementById('sellModal');
    modal.style.display = 'block';
}

// Function to handle selling of items with customer name
function sellItem(itemName) {
    const stockData = JSON.parse(localStorage.getItem(STOCK_KEY)) || {};
    if (stockData[itemName]) {
        const customerName = document.getElementById('customerName').value.trim();
        const sellQuantity = parseInt(document.getElementById('sellQuantity').value, 10);

        if (sellQuantity > 0) {
            if (sellQuantity <= stockData[itemName].todayStock) {
                stockData[itemName].todayStock -= sellQuantity;
            } else {
                let remainingSellQuantity = sellQuantity - stockData[itemName].todayStock;
                stockData[itemName].todayStock = 0;
                stockData[itemName].previousStock = Math.max(stockData[itemName].previousStock - remainingSellQuantity, 0);
            }

            localStorage.setItem(STOCK_KEY, JSON.stringify(stockData));
            addToHistory(itemName, customerName, sellQuantity);
            loadStock(); // Update stock after selling
        }
    }
}

// Function to add sales to history with customer name
function addToHistory(itemName, customerName, quantity) {
    let historyData = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    const timestamp = new Date().toLocaleString();
    historyData.push({ itemName, customerName, quantity, timestamp });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
    loadHistory(); // Update history after selling
}

// Function to load history data from LocalStorage and display it
function loadHistory() {
    const historyData = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    const historyContent = document.getElementById('historyContent');
    historyContent.innerHTML = '';

    historyData.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <strong>${entry.timestamp}</strong>: ${entry.customerName} bought ${entry.quantity} of ${entry.itemName}
            <button onclick="deleteHistory(${index})" class="delete">Delete</button>
        `;
        historyContent.appendChild(div);
    });
}

// Function to delete a history entry
function deleteHistory(index) {
    let historyData = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    historyData.splice(index, 1);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
    loadHistory();
}
