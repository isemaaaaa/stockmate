// js/reports.js

let products = [];
let transactions = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setDefaultDates();

    const reportTypeSelect = document.getElementById('reportType');
    const dateFilters = document.querySelectorAll('.date-filter');

    // Show/Hide date filters based on report type
    reportTypeSelect.addEventListener('change', function() {
        if (this.value === 'transactions') {
            dateFilters.forEach(el => el.style.display = 'block');
        } else {
            dateFilters.forEach(el => el.style.display = 'none');
        }
    });

    document.getElementById('reportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generateReport();
    });
});

function loadData() {
    products = JSON.parse(localStorage.getItem('sm_products')) || [];
    transactions = JSON.parse(localStorage.getItem('sm_transactions')) || [];
}

function setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('reportDateFrom').value = firstDay.toISOString().split('T')[0];
    document.getElementById('reportDateTo').value = today.toISOString().split('T')[0];
}

function generateReport() {
    const type = document.getElementById('reportType').value;
    const reportContainer = document.getElementById('printableReport');
    const titleElement = document.getElementById('reportTitle');
    const timestampElement = document.getElementById('reportTimestamp');
    const thead = document.getElementById('reportTableHeader');
    const tbody = document.getElementById('reportTableBody');
    const tfoot = document.getElementById('reportTableFooter');
    
    tbody.innerHTML = '';
    tfoot.innerHTML = '';
    
    const now = new Date();
    timestampElement.innerHTML = `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;

    if (type === 'inventory') {
        titleElement.innerText = 'Current Inventory Valuation Report';
        thead.innerHTML = `
            <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th class="text-center">Current Qty</th>
                <th class="text-end">Unit Cost (RM)</th>
                <th class="text-end">Total Value (RM)</th>
            </tr>
        `;

        let grandTotal = 0;
        let totalItems = 0;

        products.forEach(p => {
            const totalValue = p.qty * p.buyPrice;
            grandTotal += totalValue;
            totalItems += p.qty;

            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td class="text-center">${p.qty}</td>
                    <td class="text-end">${parseFloat(p.buyPrice).toFixed(2)}</td>
                    <td class="text-end">${totalValue.toFixed(2)}</td>
                </tr>
            `;
        });

        tfoot.innerHTML = `
            <tr>
                <td colspan="3" class="text-end"><strong>Grand Total:</strong></td>
                <td class="text-center"><strong>${totalItems}</strong></td>
                <td></td>
                <td class="text-end text-navy fs-5"><strong>RM ${grandTotal.toFixed(2)}</strong></td>
            </tr>
        `;
    } 
    else if (type === 'lowstock') {
        titleElement.innerText = 'Low Stock Alert Report';
        thead.innerHTML = `
            <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Supplier</th>
                <th class="text-center">Min. Required</th>
                <th class="text-center">Current Qty</th>
                <th class="text-center">Status</th>
            </tr>
        `;

        const lowProducts = products.filter(p => p.qty <= p.minQty);

        if (lowProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No low stock items found! Everything is well stocked.</td></tr>`;
        } else {
            lowProducts.forEach(p => {
                const status = p.qty <= 0 ? '<span class="text-danger">Out of Stock</span>' : '<span class="text-warning text-dark">Low Stock</span>';
                tbody.innerHTML += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.name}</td>
                        <td>${p.supplier}</td>
                        <td class="text-center">${p.minQty}</td>
                        <td class="text-center fw-bold ${p.qty <= 0 ? 'text-danger' : 'text-warning'}">${p.qty}</td>
                        <td class="text-center">${status}</td>
                    </tr>
                `;
            });
        }
    }
    else if (type === 'transactions') {
        const dateFrom = document.getElementById('reportDateFrom').value;
        const dateTo = document.getElementById('reportDateTo').value;
        
        let dateText = "All Time";
        if (dateFrom && dateTo) {
            dateText = `From ${dateFrom} to ${dateTo}`;
        }
        
        titleElement.innerText = 'Transaction Summary Report';
        timestampElement.innerHTML = `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}<br><small>${dateText}</small>`;
        
        thead.innerHTML = `
            <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th class="text-center">Total Stock IN</th>
                <th class="text-center">Total Stock OUT</th>
                <th class="text-center">Net Change</th>
            </tr>
        `;

        // Filter transactions by date
        let dFrom = dateFrom ? new Date(dateFrom) : null;
        let dTo = dateTo ? new Date(dateTo) : null;
        if (dTo) dTo.setHours(23, 59, 59, 999);

        const filteredTxns = transactions.filter(t => {
            const tDate = new Date(t.date);
            return (!dFrom || tDate >= dFrom) && (!dTo || tDate <= dTo);
        });

        // Group by product
        const summary = {};
        products.forEach(p => {
            summary[p.id] = { name: p.name, in: 0, out: 0 };
        });

        filteredTxns.forEach(t => {
            if (summary[t.productId]) {
                if (t.type === 'IN') summary[t.productId].in += t.qty;
                if (t.type === 'OUT') summary[t.productId].out += t.qty;
            }
        });

        let totalIn = 0;
        let totalOut = 0;

        for (const [id, data] of Object.entries(summary)) {
            // Only show products that had movement
            if (data.in > 0 || data.out > 0) {
                totalIn += data.in;
                totalOut += data.out;
                const net = data.in - data.out;
                
                tbody.innerHTML += `
                    <tr>
                        <td>${id}</td>
                        <td>${data.name}</td>
                        <td class="text-center text-success">+${data.in}</td>
                        <td class="text-center text-danger">-${data.out}</td>
                        <td class="text-center fw-bold ${net > 0 ? 'text-success' : (net < 0 ? 'text-danger' : '')}">${net > 0 ? '+'+net : net}</td>
                    </tr>
                `;
            }
        }

        if (totalIn === 0 && totalOut === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No transactions found for the selected period.</td></tr>`;
        } else {
            tfoot.innerHTML = `
                <tr>
                    <td colspan="2" class="text-end"><strong>Total Movement:</strong></td>
                    <td class="text-center text-success"><strong>+${totalIn}</strong></td>
                    <td class="text-center text-danger"><strong>-${totalOut}</strong></td>
                    <td class="text-center"></td>
                </tr>
            `;
        }
    }

    reportContainer.style.display = 'block';
}