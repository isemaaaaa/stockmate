// js/products.js

let productModal, viewModal;
let products = [];
let categories = [];
let suppliers = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Modals
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    viewModal = new bootstrap.Modal(document.getElementById('viewProductModal'));
    
    // Load Data
    loadData();
    populateDropdowns();
    renderTable();

    // Event Listeners for Filters and Sort
    document.getElementById('searchProduct').addEventListener('keyup', renderTable);
    document.getElementById('filterCategory').addEventListener('change', renderTable);
    document.getElementById('sortProduct').addEventListener('change', renderTable);

    // Event Listener for Form Submission
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
});

function loadData() {
    products = JSON.parse(localStorage.getItem('sm_products')) || [];
    categories = JSON.parse(localStorage.getItem('sm_categories')) || [];
    suppliers = JSON.parse(localStorage.getItem('sm_suppliers')) || [];
}

function populateDropdowns() {
    const filterCat = document.getElementById('filterCategory');
    const formCat = document.getElementById('prodCategory');
    const formSup = document.getElementById('prodSupplier');

    // Reset dropdowns
    filterCat.innerHTML = '<option value="">All Categories</option>';
    formCat.innerHTML = '<option value="">Select Category</option>';
    formSup.innerHTML = '<option value="">Select Supplier</option>';

    // Populate Categories
    categories.forEach(c => {
        filterCat.innerHTML += `<option value="${c.name}">${c.name}</option>`;
        formCat.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });

    // Populate Suppliers
    suppliers.forEach(s => {
        formSup.innerHTML += `<option value="${s.name}">${s.name}</option>`;
    });
}

function renderTable() {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';

    const searchQuery = document.getElementById('searchProduct').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    const sortBy = document.getElementById('sortProduct').value;

    // Filter Data
    let filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchQuery) || p.id.toLowerCase().includes(searchQuery);
        const matchCategory = categoryFilter === '' || p.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    // Sort Data
    filteredProducts.sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'price_high') return b.sellPrice - a.sellPrice;
        if (sortBy === 'price_low') return a.sellPrice - b.sellPrice;
        if (sortBy === 'qty_low') return a.qty - b.qty;
        return 0;
    });

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No products found.</td></tr>`;
        return;
    }

    filteredProducts.forEach(p => {
        // Determine Status based on Qty and MinQty
        let statusBadge = '';
        if (p.qty <= 0) {
            statusBadge = '<span class="badge bg-danger">Out of Stock</span>';
        } else if (p.qty <= p.minQty) {
            statusBadge = '<span class="badge bg-warning text-dark">Low Stock</span>';
        } else {
            statusBadge = '<span class="badge bg-success">In Stock</span>';
        }

        tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-medium text-navy">${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td class="text-muted small">${p.supplier}</td>
                <td>RM ${parseFloat(p.sellPrice).toFixed(2)}</td>
                <td class="fw-bold">${p.qty}</td>
                <td>${statusBadge}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="viewProduct('${p.id}')" title="View">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openProductModal('${p.id}')" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${p.id}')" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function viewProduct(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    let status = p.qty <= 0 ? 'Out of Stock' : (p.qty <= p.minQty ? 'Low Stock' : 'In Stock');

    document.getElementById('viewProductContent').innerHTML = `
        <div class="text-center mb-3">
            <h5 class="fw-bold text-navy mb-0">${p.name}</h5>
            <span class="badge bg-light text-dark border mt-1">${p.id}</span>
        </div>
        <table class="table table-borderless table-sm">
            <tr><th class="text-muted w-50">Category:</th><td>${p.category}</td></tr>
            <tr><th class="text-muted">Supplier:</th><td>${p.supplier}</td></tr>
            <tr><th class="text-muted">Purchase Price:</th><td>RM ${parseFloat(p.buyPrice).toFixed(2)}</td></tr>
            <tr><th class="text-muted">Selling Price:</th><td>RM ${parseFloat(p.sellPrice).toFixed(2)}</td></tr>
            <tr><th class="text-muted">Current Stock:</th><td class="fw-bold">${p.qty}</td></tr>
            <tr><th class="text-muted">Min. Stock Level:</th><td>${p.minQty}</td></tr>
            <tr><th class="text-muted">Status:</th><td>${status}</td></tr>
        </table>
        <div class="mt-2">
            <p class="text-muted small mb-1 fw-bold">Description:</p>
            <p class="small bg-light p-2 rounded">${p.desc || 'No description provided.'}</p>
        </div>
    `;
    viewModal.show();
}

function openProductModal(id = null) {
    document.getElementById('productForm').reset();
    
    if (id) {
        // Edit Mode
        document.getElementById('modalTitle').innerText = 'Edit Product';
        const p = products.find(prod => prod.id === id);
        
        document.getElementById('prodId').value = p.id;
        document.getElementById('prodName').value = p.name;
        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodSupplier').value = p.supplier;
        document.getElementById('prodDesc').value = p.desc;
        document.getElementById('prodBuy').value = p.buyPrice;
        document.getElementById('prodSell').value = p.sellPrice;
        document.getElementById('prodQty').value = p.qty;
        document.getElementById('prodMinQty').value = p.minQty;
    } else {
        // Add Mode
        document.getElementById('modalTitle').innerText = 'Add Product';
        document.getElementById('prodId').value = '';
    }
    
    productModal.show();
}

function saveProduct() {
    const idField = document.getElementById('prodId').value;
    
    const productData = {
        name: document.getElementById('prodName').value.trim(),
        category: document.getElementById('prodCategory').value,
        supplier: document.getElementById('prodSupplier').value,
        desc: document.getElementById('prodDesc').value.trim(),
        buyPrice: parseFloat(document.getElementById('prodBuy').value),
        sellPrice: parseFloat(document.getElementById('prodSell').value),
        qty: parseInt(document.getElementById('prodQty').value),
        minQty: parseInt(document.getElementById('prodMinQty').value)
    };

    if (idField) {
        // Update existing
        const index = products.findIndex(p => p.id === idField);
        productData.id = idField;
        products[index] = productData;
    } else {
        // Add new (Generate ID like P11)
        const newIdNum = products.length > 0 ? parseInt(products[products.length-1].id.substring(1)) + 1 : 1;
        productData.id = 'P' + newIdNum.toString().padStart(2, '0');
        products.push(productData);
    }

    localStorage.setItem('sm_products', JSON.stringify(products));
    renderTable();
    productModal.hide();
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('sm_products', JSON.stringify(products));
        renderTable();
    }
}