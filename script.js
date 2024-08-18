// Local Storage keys
const STOCK_KEY = 'stockData';
const HISTORY_KEY = 'historyData';

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
                <td><button onclick="sellItem('${itemName}')">Sell</button></td>
            `;
            stockBody.appendChild(row);
        }
    });
}

// Function to handle selling of items with customer name
function sellItem(itemName) {
    const stockData = JSON.parse(localStorage.getItem(STOCK_KEY)) || {};
    if (stockData[itemName]) {
        const input = prompt(`Enter the customer's name and quantity to sell (format: "Name, Quantity"):`, 'CustomerName, 0');

        if (input) {
            const [customerName, sellQuantity] = input.split(',').map(item => item.trim());
            const quantity = parseInt(sellQuantity, 10);

            if (quantity > 0) {
                if (quantity <= stockData[itemName].todayStock) {
                    stockData[itemName].todayStock -= quantity;
                } else {
                    let remainingSellQuantity = quantity - stockData[itemName].todayStock;
                    stockData[itemName].todayStock = 0;
                    stockData[itemName].previousStock = Math.max(stockData[itemName].previousStock - remainingSellQuantity, 0);
                }

                localStorage.setItem(STOCK_KEY, JSON.stringify(stockData));
                addToHistory(itemName, customerName, quantity);
                loadStock();
            }
        }
    }
}
