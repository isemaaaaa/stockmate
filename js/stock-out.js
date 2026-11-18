// js/stock-out.js

let products = [];
let transactions = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    populateProductDropdown();
    renderRecentTransactions();

    // Event Listener for Product Selection
    document.getElementById('outProduct').addEventListener('change', function() {
        const selectedId = this.value;
        if (selectedId) {
            const product = products.find(p => p.id === selectedId);
            document.getElementById('currentStock').value = product ? product.qty : 0;
            
            // Optional visual cue if stock is low/empty
            if(product && product.qty === 0) {
                document.getElementById('currentStock').classList.add('text-danger', 'fw-bold');
            } else {
                document.getElementById('currentStock').classList.remove('text-danger', 'fw-bold');
            }
        } else {
            document.getElementById('currentStock').value = '';
        }
    });

    // Event Listener for Form Submission
    document.getElementById('stockOutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processStockOut();
    });
});

function loadData() {
    products = JSON.parse(localStorage.getItem('sm_products')) || [];
    transactions = JSON.parse(localStorage.getItem('sm_transactions')) || [];
}

function populateProductDropdown() {
    const productSelect = document.getElementById('outProduct');
    productSelect.innerHTML = '<option value="">Choose a product...</option>';
    
    const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedProducts.forEach(p => {
        productSelect.innerHTML += `<option value="${p.id}">${p.name} (${p.id})</option>`;
    });
}

function processStockOut() {
    const productId = document.getElementById('outProduct').value;
    const deductQty = parseInt(document.getElementById('outQty').value);
    const reason = document.getElementById('outReason').value;
    const remarksInput = document.getElementById('outRemarks').value.trim();
    const fullRemarks = remarksInput ? `${reason} - ${remarksInput}` : reason;

    if (!productId || isNaN(deductQty) || deductQty <= 0) {
        alert("Please select a valid product and quantity.");
        return;
    }

    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const product = products[productIndex];

    // SAFETY CHECK: Ensure we don't deduct more than we have
    if (deductQty > product.qty) {
        alert(`Error: You cannot deduct ${deductQty} units. There are only ${product.qty} units available in stock.`);
        return;
    }

    // 1. Deduct quantity
    product.qty -= deductQty;
    localStorage.setItem('sm_products', JSON.stringify(products));

    // 2. Create transaction record
    const now = new Date();
    const transaction = {
        id: 'TXN' + Date.now(),
        type: 'OUT',
        date: now.toISOString(),
        productId: product.id,
        productName: product.name,
        qty: deductQty,
        remarks: fullRemarks,
        user: 'Admin User'
    };

    transactions.push(transaction);
    localStorage.setItem('sm_transactions', JSON.stringify(transactions));

    // 3. Reset form and update UI
    document.getElementById('stockOutForm').reset();
    document.getElementById('currentStock').value = '';
    
    alert(`Success! Deducted ${deductQty} units from ${product.name}.`);
    
    renderRecentTransactions();
}

function renderRecentTransactions() {
    const tbody = document.getElementById('stockOutTableBody');
    tbody.innerHTML = '';

    // Filter only "OUT" transactions and sort by newest first
    const outTransactions = transactions
        .filter(t => t.type === 'OUT')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    if (outTransactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No recent stock out records.</td></tr>`;
        return;
    }

    outTransactions.forEach(t => {
        const dateObj = new Date(t.date);
        const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        tbody.innerHTML += `
            <tr>
                <td class="ps-4 text-muted small">${formattedDate}</td>
                <td class="fw-medium">${t.productName} <span class="badge bg-light text-dark border ms-1">${t.productId}</span></td>
                <td><span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">-${t.qty}</span></td>
                <td class="text-muted small">${t.remarks}</td>
            </tr>
        `;
    });
}