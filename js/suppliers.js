// js/suppliers.js

let supplierModal, viewModal;
let suppliers = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Modals
    supplierModal = new bootstrap.Modal(document.getElementById('supplierModal'));
    viewModal = new bootstrap.Modal(document.getElementById('viewSupplierModal'));
    
    // Load Data
    loadData();
    renderTable();

    // Event Listeners
    document.getElementById('searchSupplier').addEventListener('keyup', renderTable);
    document.getElementById('supplierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSupplier();
    });
});

function loadData() {
    suppliers = JSON.parse(localStorage.getItem('sm_suppliers')) || [];
}

function renderTable() {
    const tbody = document.getElementById('supplierTableBody');
    tbody.innerHTML = '';

    const searchQuery = document.getElementById('searchSupplier').value.toLowerCase();

    // Filter Data by Search Query (CRASH-PROOF VERSION)
    let filteredSuppliers = suppliers.filter(s => {
        const sName = (s.name || '').toLowerCase();
        const sContact = (s.contact || '').toLowerCase();
        const sId = (s.id || '').toLowerCase();
        
        return sName.includes(searchQuery) || 
               sContact.includes(searchQuery) || 
               sId.includes(searchQuery);
    });

    if (filteredSuppliers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No suppliers found.</td></tr>`;
        return;
    }

    filteredSuppliers.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-medium text-navy">${s.id}</td>
                <td class="fw-bold">${s.name}</td>
                <td>${s.contact}</td>
                <td>${s.phone}</td>
                <td>${s.email}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="viewSupplier('${s.id}')" title="View">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openSupplierModal('${s.id}')" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSupplier('${s.id}')" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function viewSupplier(id) {
    const s = suppliers.find(sup => sup.id === id);
    if (!s) return;

    document.getElementById('viewSupplierContent').innerHTML = `
        <div class="text-center mb-4">
            <div class="icon-box bg-light text-navy mx-auto mb-2" style="width: 60px; height: 60px; font-size: 1.5rem;">
                <i class="fa-solid fa-building"></i>
            </div>
            <h5 class="fw-bold text-navy mb-0">${s.name}</h5>
            <span class="badge bg-light text-dark border mt-1">${s.id}</span>
        </div>
        <table class="table table-borderless table-sm">
            <tr><th class="text-muted w-40">Contact Person:</th><td class="fw-medium">${s.contact}</td></tr>
            <tr><th class="text-muted">Phone Number:</th><td><a href="tel:${s.phone}" class="text-decoration-none">${s.phone}</a></td></tr>
            <tr><th class="text-muted">Email Address:</th><td><a href="mailto:${s.email}" class="text-decoration-none">${s.email}</a></td></tr>
            <tr><th class="text-muted">Business Address:</th><td>${s.address}</td></tr>
        </table>
    `;
    viewModal.show();
}

function openSupplierModal(id = null) {
    document.getElementById('supplierForm').reset();
    
    if (id) {
        // Edit Mode
        document.getElementById('modalTitle').innerText = 'Edit Supplier';
        const s = suppliers.find(sup => sup.id === id);
        
        document.getElementById('supId').value = s.id;
        document.getElementById('supName').value = s.name;
        document.getElementById('supContact').value = s.contact;
        document.getElementById('supPhone').value = s.phone;
        document.getElementById('supEmail').value = s.email;
        document.getElementById('supAddress').value = s.address;
    } else {
        // Add Mode
        document.getElementById('modalTitle').innerText = 'Add Supplier';
        document.getElementById('supId').value = '';
    }
    
    supplierModal.show();
}

function saveSupplier() {
    const idField = document.getElementById('supId').value;
    
    const supplierData = {
        name: document.getElementById('supName').value.trim(),
        contact: document.getElementById('supContact').value.trim(),
        phone: document.getElementById('supPhone').value.trim(),
        email: document.getElementById('supEmail').value.trim(),
        address: document.getElementById('supAddress').value.trim()
    };

    if (idField) {
        // Update existing
        const index = suppliers.findIndex(s => s.id === idField);
        supplierData.id = idField;
        
        // Note: For a real system, you would cascade this name update to products too, 
        // just like we did for categories. We will keep it simple here.
        suppliers[index] = supplierData;
    } else {
        // Add new (Generate ID like S06)
        const newIdNum = suppliers.length > 0 ? parseInt(suppliers[suppliers.length-1].id.substring(1)) + 1 : 1;
        supplierData.id = 'S' + newIdNum.toString().padStart(2, '0');
        suppliers.push(supplierData);
    }

    localStorage.setItem('sm_suppliers', JSON.stringify(suppliers));
    renderTable();
    supplierModal.hide();
}

function deleteSupplier(id) {
    if (confirm("Are you sure you want to delete this supplier?")) {
        suppliers = suppliers.filter(s => s.id !== id);
        localStorage.setItem('sm_suppliers', JSON.stringify(suppliers));
        renderTable();
    }
}