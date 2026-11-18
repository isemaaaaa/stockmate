// js/stock-history.js

let transactions = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setDefaultDates();
    renderTable();

    // Event Listeners for Filters
    document.getElementById('searchHistory').addEventListener('keyup', renderTable);
    document.getElementById('filterType').addEventListener('change', renderTable);
    document.getElementById('filterDateFrom').addEventListener('change', renderTable);
    document.getElementById('filterDateTo').addEventListener('change', renderTable);
});

function loadData() {
    transactions = JSON.parse(localStorage.getItem('sm_transactions')) || [];
}

// Optional: Set default dates to show current month
function setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Helper function to format date as YYYY-MM-DD in local time
    const formatLocal = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };
    
    document.getElementById('filterDateFrom').value = formatLocal(firstDay);
    document.getElementById('filterDateTo').value = formatLocal(today);
}

function resetFilters() {
    document.getElementById('searchHistory').value = '';
    document.getElementById('filterType').value = 'ALL';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    const searchQuery = document.getElementById('searchHistory').value.toLowerCase();
    const filterType = document.getElementById('filterType').value;
    
    // Parse dates to midnight for accurate comparison
    const dateFromStr = document.getElementById('filterDateFrom').value;
    const dateToStr = document.getElementById('filterDateTo').value;
    
    let dateFrom = dateFromStr ? new Date(dateFromStr) : null;
    let dateTo = dateToStr ? new Date(dateToStr) : null;
    
    if (dateTo) {
        // Set dateTo to end of day to include transactions made on that day
        dateTo.setHours(23, 59, 59, 999);
    }

    // Filter Data
    let filteredData = transactions.filter(t => {
        const txnDate = new Date(t.date);
        
        // Search Filter
        const matchesSearch = (t.productName.toLowerCase().includes(searchQuery) || 
                               t.productId.toLowerCase().includes(searchQuery) ||
                               t.id.toLowerCase().includes(searchQuery));
        
        // Type Filter
        const matchesType = (filterType === 'ALL' || t.type === filterType);
        
        // Date Filter
        const matchesDateFrom = (!dateFrom || txnDate >= dateFrom);
        const matchesDateTo = (!dateTo || txnDate <= dateTo);

        return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
    });

    // Sort by Newest First
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No transactions found for the selected filters.</td></tr>`;
        return;
    }

    filteredData.forEach(t => {
        const dateObj = new Date(t.date);
        const formattedDate = dateObj.toLocaleDateString() + ' <br><small class="text-muted">' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '</small>';
        
        let typeBadge = '';
        let qtyDisplay = '';
        
        if (t.type === 'IN') {
            typeBadge = '<span class="badge bg-success">IN</span>';
            qtyDisplay = `<span class="text-success fw-bold">+${t.qty}</span>`;
        } else {
            typeBadge = '<span class="badge bg-danger">OUT</span>';
            qtyDisplay = `<span class="text-danger fw-bold">-${t.qty}</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td class="ps-4">${formattedDate}</td>
                <td class="fw-medium text-navy text-nowrap">${t.id}</td>
                <td>${typeBadge}</td>
                <td>${t.productName} <br><small class="text-muted">${t.productId}</small></td>
                <td>${qtyDisplay}</td>
                <td class="text-muted small">${t.user}</td>
                <td class="text-muted small">${t.remarks}</td>
            </tr>
        `;
    });
}