    // The following lines are not valid in a .js file:
    // src="js/bootstrap.bundle.min.js"
    // src="https://cdn.jsdelivr.net/npm/chart.js"

    // Instead, in a .js file, you do not include <script> tags or src attributes.
    // To use Chart.js in your .js file, make sure Chart.js is loaded in your HTML before this script runs.
    // Example in your HTML file:
    // <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    // <script src="js/bootstrap.bundle.min.js"></script>
    // <script src="js/StatisticsInAdmin.js"></script>
    // Initialize charts when page loads
        document.addEventListener('DOMContentLoaded', function () {
            initializeCharts();
        });

        function initializeCharts() {
            // Donut Chart
            const ctx = document.getElementById('chartCanvas').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Academic rules', 'Employment rules & regulations', 'Student rules & regulations', 'Student rules & regulations'],
                    datasets: [{
                        data: [40, 30, 25, 15],
                        backgroundColor: ['#8B4513', '#2E8B57', '#4682B4', '#DAA520'],
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
            const barCtx = document.getElementById('barChartCanvas').getContext('2d');
            new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: ['March', 'April', 'May', 'June', 'July', 'August'],
                    datasets: [{
                        data: [180, 150, 220, 180, 320, 200],
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
        }

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