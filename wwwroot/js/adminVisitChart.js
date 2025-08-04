// Global variable to hold the chart instance (used to destroy it before re-rendering)
let barChartInstance = null;

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
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true // Always start Y-axis from 0
                        }
                    }
                }
            });
        })
        .catch(error => console.error("Chart load error:", error)); // Handle fetch or rendering errors
});