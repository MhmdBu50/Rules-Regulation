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
            // Get current language
            const currentLang = localStorage.getItem("websiteLanguage") || "en";
            
            // Translate month labels if translations are available
            let translatedLabels = data.labels;
            if (window.monthTranslations) {
                translatedLabels = data.labels.map(label => {
                    const index = window.monthTranslations["en"].indexOf(label);
                    return index >= 0 ? window.monthTranslations[currentLang][index] : label;
                });
            }
            
            // Create and assign a new Chart.js instance to render the bar chart
            barChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: translatedLabels, // Use translated month names
                    datasets: [{
                        label: currentLang === 'ar' ? 'الزيارات الشهرية' : 'Monthly Visits',
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
                    maintainAspectRatio: false,
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
            // Store the chart instance globally so we can access it later
            window.barChartInstance = barChartInstance;

            // Get reference to custom toggle element
            const toggle = document.getElementById('visitToggler');

            // Initialize label with correct language
            toggle.textContent = currentLang === 'ar' ? 'الزيارات الشهرية' : 'Monthly Visits';

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
                    const currentLang = localStorage.getItem("websiteLanguage") || "en";
                    let translatedLabels = data.labels;
                    
                    // Only translate if monthTranslations is available
                    if (window.monthTranslations) {
                        translatedLabels = data.labels.map(label => {
                            const index = window.monthTranslations["en"].indexOf(label);
                            return index >= 0 ? window.monthTranslations[currentLang][index] : label;
                        });
                    }

                    barChartInstance.data.labels = translatedLabels;
                    barChartInstance.data.datasets[0].label = showingUnique
                        ? (currentLang === 'ar' ? 'الزيارات الشهرية الفريدة' : 'Unique Monthly Visits')
                        : (currentLang === 'ar' ? 'الزيارات الشهرية' : 'Monthly Visits');
                    barChartInstance.data.datasets[0].data = data.data;

                    barChartInstance.getDatasetMeta(0).hidden = false;
                    barChartInstance.update();

                    toggle.textContent = barChartInstance.data.datasets[0].label;
                })
                    .catch(error => console.error("Toggle fetch error:", error));
            });
        })
        .catch(error => console.error("Chart load error:", error)); // Handle fetch or rendering errors
});