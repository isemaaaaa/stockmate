// js/stock-in.js

let products = [];
let transactions = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    populateProductDropdown();
    renderRecentTransactions();

    // Event Listener for Product Selection
    document.getElementById('inProduct').addEventListener('change', function() {
        const selectedId = this.value;
        if (selectedId) {
            const product = products.find(p => p.id === selectedId);
            document.getElementById('currentStock').value = product ? product.qty : 0;
        } else {
            document.getElementById('currentStock').value = '';
        }
    });

    // Event Listener for Form Submission
    document.getElementById('stockInForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processStockIn();
    });
});

function loadData() {
    products = JSON.parse(localStorage.getItem('sm_products')) || [];
    transactions = JSON.parse(localStorage.getItem('sm_transactions')) || [];
}

function populateProductDropdown() {
    const productSelect = document.getElementById('inProduct');
    productSelect.innerHTML = '<option value="">Choose a product...</option>';
    
    // Sort products alphabetically for easier searching
    const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedProducts.forEach(p => {
        productSelect.innerHTML += `<option value="${p.id}">${p.name} (${p.id})</option>`;
    });
}

function processStockIn() {
    const productId = document.getElementById('inProduct').value;
    const addQty = parseInt(document.getElementById('inQty').value);
    const remarks = document.getElementById('inRemarks').value.trim() || 'Restock';

    if (!productId || isNaN(addQty) || addQty <= 0) {
        alert("Please select a valid product and quantity.");
        return;
    }

    // 1. Find and update the product quantity
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const product = products[productIndex];
    product.qty += addQty;
    
    // Save updated products back to LocalStorage
    localStorage.setItem('sm_products', JSON.stringify(products));

    // 2. Create a transaction record
    const now = new Date();
    const transaction = {
        id: 'TXN' + Date.now(),
        type: 'IN',
        date: now.toISOString(),
        productId: product.id,
        productName: product.name,
        qty: addQty,
        remarks: remarks,
        user: 'Admin User'
    };

    transactions.push(transaction);
    localStorage.setItem('sm_transactions', JSON.stringify(transactions));

    // 3. Reset form and update UI
    document.getElementById('stockInForm').reset();
    document.getElementById('currentStock').value = '';
    
    // Show a quick success message using standard browser alert (or you can use Bootstrap toasts later)
    alert(`Success! Added ${addQty} units to ${product.name}.`);
    
    renderRecentTransactions();
}

function renderRecentTransactions() {
    const tbody = document.getElementById('stockInTableBody');
    tbody.innerHTML = '';

    // Filter only "IN" transactions and sort by newest first
    const inTransactions = transactions
        .filter(t => t.type === 'IN')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10); // Show only last 10 for this view

    if (inTransactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No recent stock in records.</td></tr>`;
        return;
    }

    inTransactions.forEach(t => {
        const dateObj = new Date(t.date);
        const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        tbody.innerHTML += `
            <tr>
                <td class="ps-4 text-muted small">${formattedDate}</td>
                <td class="fw-medium">${t.productName} <span class="badge bg-light text-dark border ms-1">${t.productId}</span></td>
                <td><span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">+${t.qty}</span></td>
                <td class="text-muted small">${t.remarks}</td>
            </tr>
        `;
    });
}