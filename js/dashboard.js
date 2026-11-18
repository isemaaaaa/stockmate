document.addEventListener('DOMContentLoaded', function() {
    
    // Check if we are on the dashboard page before running charts
    if(document.getElementById('barChart') && document.getElementById('doughnutChart')) {
        
        // Populate dummy statistics for now (Phase 6 will make this dynamic)
        document.getElementById('stat-products').innerText = '15';
        document.getElementById('stat-stock').innerText = '420';
        document.getElementById('stat-low').innerText = '3';
        document.getElementById('stat-out').innerText = '1';
        document.getElementById('stat-categories').innerText = '5';
        document.getElementById('stat-suppliers').innerText = '4';

        // 1. Monthly Stock In vs Stock Out (Bar Chart)
        const ctxBar = document.getElementById('barChart').getContext('2d');
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Stock In',
                        data: [50, 80, 60, 100, 90, 120],
                        backgroundColor: '#269B73' // Custom Green
                    },
                    {
                        label: 'Stock Out',
                        data: [30, 40, 50, 70, 80, 100],
                        backgroundColor: '#DC5656' // Custom Red
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // 2. Stock Distribution by Category (Doughnut Chart)
        const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
        new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Electronics', 'Stationery', 'Clothing', 'Furniture', 'Accessories'],
                datasets: [{
                    data: [40, 25, 15, 10, 10],
                    backgroundColor: ['#172D4D', '#269B73', '#D4AF72', '#DC5656', '#6c757d'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
});