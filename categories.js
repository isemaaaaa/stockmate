// js/categories.js

let categoryModal;
let categories = [];
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Modal
    categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    
    // Load data from LocalStorage
    loadData();
    renderTable();

    // Handle Form Submit (Add or Edit)
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCategory();
    });

    // Handle Search
    document.getElementById('searchCategory').addEventListener('keyup', function(e) {
        renderTable(e.target.value.toLowerCase());
    });
});

function loadData() {
    categories = JSON.parse(localStorage.getItem('sm_categories')) || [];
    products = JSON.parse(localStorage.getItem('sm_products')) || [];
}

function renderTable(searchQuery = '') {
    const tbody = document.getElementById('categoryTableBody');
    tbody.innerHTML = '';

    const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery));

    if (filteredCategories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No categories found.</td></tr>`;
        return;
    }

    filteredCategories.forEach(cat => {
        // Count how many products belong to this category
        const productCount = products.filter(p => p.category === cat.name).length;

        tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-medium text-navy">${cat.id}</td>
                <td>${cat.name}</td>
                <td><span class="badge bg-light text-dark border">${productCount} Items</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editCategory('${cat.id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${cat.id}', ${productCount})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function openCategoryModal() {
    document.getElementById('modalTitle').innerText = 'Add Category';
    document.getElementById('categoryForm').reset();
    document.getElementById('editCategoryId').value = '';
    categoryModal.show();
}

function editCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (cat) {
        document.getElementById('modalTitle').innerText = 'Edit Category';
        document.getElementById('editCategoryId').value = cat.id;
        document.getElementById('catName').value = cat.name;
        categoryModal.show();
    }
}

function saveCategory() {
    const idField = document.getElementById('editCategoryId').value;
    const name = document.getElementById('catName').value.trim();

    if (idField) {
        // Edit Mode
        const index = categories.findIndex(c => c.id === idField);
        // Important: Update product records to match new category name
        const oldName = categories[index].name;
        products.forEach(p => {
            if(p.category === oldName) p.category = name;
        });
        localStorage.setItem('sm_products', JSON.stringify(products)); // save product changes
        
        categories[index].name = name;
    } else {
        // Add Mode: Generate new ID (e.g., C06)
        const newIdNum = categories.length > 0 ? parseInt(categories[categories.length-1].id.substring(1)) + 1 : 1;
        const newId = 'C' + newIdNum.toString().padStart(2, '0');
        categories.push({ id: newId, name: name });
    }

    localStorage.setItem('sm_categories', JSON.stringify(categories));
    loadData(); // refresh data
    renderTable();
    categoryModal.hide();
}

function deleteCategory(id, productCount) {
    // Prevent deletion if products exist (Assignment requirement)
    if (productCount > 0) {
        alert("Cannot delete this category because it is currently assigned to " + productCount + " product(s). Please reassign or delete those products first.");
        return;
    }

    if (confirm("Are you sure you want to delete this category?")) {
        categories = categories.filter(c => c.id !== id);
        localStorage.setItem('sm_categories', JSON.stringify(categories));
        renderTable();
    }
}