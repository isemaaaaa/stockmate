// js/settings.js

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();

    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });

    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', importData);
    document.getElementById('factoryResetBtn').addEventListener('click', factoryReset);
});

function loadProfile() {
    const currentUser = JSON.parse(localStorage.getItem('sm_currentUser'));
    if (currentUser) {
        document.getElementById('profileName').value = currentUser.name;
        document.getElementById('profileEmail').value = currentUser.email || '';
    }
}

function saveProfile() {
    const newName = document.getElementById('profileName').value.trim();
    const newPass = document.getElementById('newPassword').value;
    
    let currentUser = JSON.parse(localStorage.getItem('sm_currentUser'));
    let allUsers = JSON.parse(localStorage.getItem('sm_users')) || [];

    // 1. Update active session
    currentUser.name = newName;
    localStorage.setItem('sm_currentUser', JSON.stringify(currentUser));

    // 2. Update database record
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex].name = newName;
        if (newPass) {
            allUsers[userIndex].password = newPass;
        }
        localStorage.setItem('sm_users', JSON.stringify(allUsers));
    }

    // Update top nav immediately
    const topNavName = document.getElementById('topNavName');
    if (topNavName) topNavName.innerText = newName;

    document.getElementById('newPassword').value = '';
    alert("Profile updated successfully!");
}

function exportData() {
    // Gather all data from localStorage
    const appData = {
        products: JSON.parse(localStorage.getItem('sm_products')) || [],
        categories: JSON.parse(localStorage.getItem('sm_categories')) || [],
        suppliers: JSON.parse(localStorage.getItem('sm_suppliers')) || [],
        transactions: JSON.parse(localStorage.getItem('sm_transactions')) || [],
        users: JSON.parse(localStorage.getItem('sm_users')) || []
    };

    // Convert to JSON string
    const dataStr = JSON.stringify(appData, null, 2);
    
    // Create a downloadable blob
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create an invisible link and click it to trigger download
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `StockMate_Backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Please select a JSON backup file to restore.");
        return;
    }

    if (confirm("WARNING: This will overwrite ALL your current data. Are you absolutely sure you want to proceed?")) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate if it looks like our backup file
                if (!data.products || !data.users) {
                    throw new Error("Invalid backup file format.");
                }

                // Restore data
                localStorage.setItem('sm_products', JSON.stringify(data.products));
                localStorage.setItem('sm_categories', JSON.stringify(data.categories));
                localStorage.setItem('sm_suppliers', JSON.stringify(data.suppliers));
                localStorage.setItem('sm_transactions', JSON.stringify(data.transactions));
                localStorage.setItem('sm_users', JSON.stringify(data.users));

                alert("Data successfully restored! The system will now log you out to apply changes.");
                
                // Log out to ensure clean state
                localStorage.removeItem('sm_loggedIn');
                localStorage.removeItem('sm_currentUser');
                window.location.href = 'index.html';
                
            } catch (err) {
                alert("Error reading file: " + err.message);
            }
        };
        
        reader.readAsText(file);
    }
}

function factoryReset() {
    if (confirm("🚨 DANGER 🚨\n\nThis will DELETE EVERY PRODUCT, TRANSACTION, AND USER. This action cannot be undone!\n\nAre you 100% sure?")) {
        // Clear only StockMate data, leaving other site data intact if any
        localStorage.removeItem('sm_products');
        localStorage.removeItem('sm_categories');
        localStorage.removeItem('sm_suppliers');
        localStorage.removeItem('sm_transactions');
        localStorage.removeItem('sm_users');
        localStorage.removeItem('sm_loggedIn');
        localStorage.removeItem('sm_currentUser');
        
        alert("System reset. Returning to login page.");
        window.location.href = 'index.html';
    }
}