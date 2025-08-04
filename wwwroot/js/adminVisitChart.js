// Global variable to hold the chart instance (used to destroy it before re-rendering)
let barChartInstance = null;

// Global flag to track whether we’re showing unique visits
let showingUnique = false;

// Load chart after the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Get the canvas element (bar chart)
    const canvas = document.getElementById('barChartCanvas');
    if (!canvas) return; // Don't run this chart code if the canvas isn't on the page

    const ctx = canvas.getContext('2d');

    // If a Chart.js instance already exists on this canvas, destroy it first
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    // Fetch visit data from the backend API
    fetch('/api/analytics/monthly-visits')
        .then(res => res.json())
        .then(data => {
            // Create and assign a new Chart.js instance to render the bar chart
            barChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels, // Month names
                    datasets: [{
                        label: 'Monthly Visits',
                        data: data.data, // Visit counts
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true // Always start Y-axis from 0
                        }
                    },
                    plugins: {
                        legend: {
                            // Override default legend click behavior to toggle between total and unique visits
                            onClick: function (_, __, legend) {
                                // Flip the global flag
                                showingUnique = !showingUnique;

                                // Select the appropriate API endpoint
                                const apiUrl = showingUnique
                                    ? '/api/analytics/unique-monthly-visits'
                                    : '/api/analytics/monthly-visits';

                                // Fetch new data and update the chart
                                fetch(apiUrl)
                                    .then(res => res.json())
                                    .then(data => {
                                        const chart = legend.chart;

                                        // Replace chart data with the new dataset
                                        chart.data.labels = data.labels;
                                        chart.data.datasets[0].label = showingUnique
                                            ? 'Unique Monthly Visits'
                                            : 'Monthly Visits';
                                        chart.data.datasets[0].data = data.data;

                                        chart.getDatasetMeta(0).hidden = false; // Ensure the dataset is visible

                                        chart.update(); // Re-render the chart with new data
                                    })
                                    .catch(error => console.error("Chart toggle error:", error)); // Handle fetch or rendering errors
                            },

                            // Customize legend appearance to remove the color box
                            labels: {
                                generateLabels: function (chart) {
                                    return [{
                                        text: showingUnique ? 'Unique Monthly Visits' : 'Monthly Visits',
                                        fillStyle: 'transparent', // Hide color box
                                        strokeStyle: 'transparent',
                                        hidden: false,
                                        index: 0
                                    }];
                                }
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error("Chart load error:", error)); // Handle fetch or rendering errors
});