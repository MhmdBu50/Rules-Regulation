    // The following lines are not valid in a .js file:
    // src="js/bootstrap.bundle.min.js"
    // src="https://cdn.jsdelivr.net/npm/chart.js"

    // To use Chart.js in your .js file, make sure Chart.js is loaded in your HTML before this script runs.
    // Example in your HTML file:
    // <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    // <script src="js/bootstrap.bundle.min.js"></script>
    // <script src="js/StatisticsInAdmin.js"></script>
    // Initialize charts when page loads

document.addEventListener('DOMContentLoaded', function () {
    fetch('/Admin/GetDashboardStats')
        .then(res => res.json())
        .then(stats => {
            // Update stat cards (adjust selectors as needed)
            const totalPoliciesElem = document.querySelector('.stats-card-blue .number');
            if (totalPoliciesElem) totalPoliciesElem.textContent = stats.totalPolicies;

            const mostViewedSubtitle = document.querySelector('.stats-card-green .subtitle');
            if (mostViewedSubtitle) mostViewedSubtitle.textContent = stats.mostViewed.name;
            const mostViewedText = document.querySelector('.stats-card-green .viewed-text');
            if (mostViewedText) mostViewedText.textContent = `Viewed: ${stats.mostViewed.views} times`;

            // Donut Chart
            const donutLabels = stats.donutData.map(d => d.label);
            const donutValues = stats.donutData.map(d => d.value);
            const donutColors = ['#8B4513', '#2E8B57', '#4682B4', '#DAA520'];
            const ctx = document.getElementById('chartCanvas').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: donutLabels,
                    datasets: [{
                        data: donutValues,
                        backgroundColor: donutColors,
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    cutout: '60%'
                }
            });

            // Bar Chart
            const barLabels = stats.barData.map(d => d.month);
            const barValues = stats.barData.map(d => d.visits);
            const barCtx = document.getElementById('barChartCanvas').getContext('2d');
            new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: barLabels,
                    datasets: [{
                        data: barValues,
                        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA726', '#AB47BC', '#26C6DA'],
                        borderRadius: 4,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 400,
                            grid: {
                                display: true,
                                color: '#e9ecef'
                            },
                            ticks: {
                                stepSize: 100,
                                font: {
                                    size: 10
                                },
                                color: '#6c757d'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 10
                                },
                                color: '#6c757d'
                            }
                        }
                    },
                    layout: {
                        padding: {
                            top: 10,
                            right: 10,
                            bottom: 10,
                            left: 10
                        }
                    }
                }
            });
        });
});

        // Button functions
        function viewReport() {
            alert('View Report clicked!');
            // Add your functionality here
        }

        function addNewRecord() {
            alert('Add New Record clicked!');
            // Add your functionality here
        }

        function exportData() {
            alert('Export Data clicked!');
            // Add your functionality here
        }

        function contactInfo() {
            alert('Contact Info clicked!');
            // Add your functionality here
        }