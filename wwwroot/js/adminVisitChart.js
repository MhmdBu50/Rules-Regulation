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
                            display: false // We hide Chart.js legend entirely in favor of a custom toggler
                        }
                    }
                }
            });

            // Get reference to custom toggle element
            const toggle = document.getElementById('visitToggler');

            // Initialize label
            toggle.textContent = 'Monthly Visits';

            // Add click event to toggle dataset
            toggle.addEventListener('click', () => {
                // Flip the global flag
                showingUnique = !showingUnique;

                // Choose correct API
                const apiUrl = showingUnique
                    ? '/api/analytics/unique-monthly-visits'
                    : '/api/analytics/monthly-visits';

                // Fetch new data
                fetch(apiUrl)
                    .then(res => res.json())
                    .then(data => {
                        barChartInstance.data.labels = data.labels;
                        barChartInstance.data.datasets[0].label = showingUnique
                            ? 'Unique Monthly Visits'
                            : 'Monthly Visits';
                        barChartInstance.data.datasets[0].data = data.data;

                        barChartInstance.getDatasetMeta(0).hidden = false; // Ensure dataset is visible
                        barChartInstance.update();

                        // Update label text
                        toggle.textContent = showingUnique
                            ? 'Unique Monthly Visits'
                            : 'Monthly Visits';
                    })
                    .catch(error => console.error("Toggle fetch error:", error));
            });
        })
        .catch(error => console.error("Chart load error:", error)); // Handle fetch or rendering errors
});