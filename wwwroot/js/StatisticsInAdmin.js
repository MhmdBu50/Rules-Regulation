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
    console.log('StatisticsInAdmin.js loaded');
    
    fetch('/Admin/GetDashboardStats')
        .then(res => {
            console.log('Dashboard stats response status:', res.status);
            return res.json();
        })
        .then(stats => {
            console.log('Dashboard stats received:', stats);
            
            // Update stat cards
            const totalPoliciesElem = document.querySelector('.stats-card-blue .number');
            if (totalPoliciesElem && stats.totalPolicies !== undefined) {
                totalPoliciesElem.textContent = stats.totalPolicies;
                console.log('Updated total policies:', stats.totalPolicies);
            }

            const mostViewedSubtitle = document.querySelector('.stats-card-green .subtitle');
            if (mostViewedSubtitle && stats.mostViewed && stats.mostViewed.name) {
                mostViewedSubtitle.textContent = stats.mostViewed.name;
                console.log('Updated most viewed name:', stats.mostViewed.name);
            }
            
            const mostViewedText = document.querySelector('.stats-card-green .viewed-text');
            if (mostViewedText && stats.mostViewed && stats.mostViewed.views !== undefined) {
                mostViewedText.textContent = `Viewed: ${stats.mostViewed.views} times`;
                console.log('Updated most viewed views:', stats.mostViewed.views);
            }

            // Donut Chart (Pie Chart)
            if (stats.donutData && stats.donutData.length > 0) {
                const donutLabels = stats.donutData.map(d => d.label);
                const donutValues = stats.donutData.map(d => d.value || d.count); // Handle both value and count
                const donutPercentages = stats.donutData.map(d => d.percentage);
                const donutColors = ['#8B4513', '#2E8B57', '#4682B4', '#DAA520'];
                
                console.log('Donut chart data:', { donutLabels, donutValues, donutPercentages });
                
                const ctx = document.getElementById('chartCanvas');
                if (ctx) {
                    new Chart(ctx.getContext('2d'), {
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
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (tooltipItem) {
                                            const index = tooltipItem.dataIndex;
                                            return `${donutLabels[index]}: ${donutValues[index]} (${donutPercentages[index]}%)`;
                                        }
                                    }
                                }
                            },
                            cutout: '60%'
                        }
                    });
                    
                    console.log('Donut chart created successfully');
                    
                    // Update legend with bottom layout and count in parentheses
                    const legendContainer = document.querySelector('.legend-container');
                    if (legendContainer) {
                        legendContainer.innerHTML = '';
                        
                        // Create a flex container for horizontal layout
                        legendContainer.style.display = 'flex';
                        legendContainer.style.flexWrap = 'wrap';
                        legendContainer.style.justifyContent = 'center';
                        legendContainer.style.alignItems = 'center';
                        legendContainer.style.gap = '15px';
                        legendContainer.style.marginTop = '20px';
                        
                        stats.donutData.forEach((item, index) => {
                            const legendItem = document.createElement('div');
                            legendItem.classList.add('legend-item');
                            legendItem.style.display = 'flex';
                            legendItem.style.alignItems = 'center';
                            legendItem.style.gap = '8px';
                            legendItem.style.fontSize = '14px';

                            const legendColor = document.createElement('div');
                            legendColor.classList.add('legend-color');
                            legendColor.style.backgroundColor = donutColors[index % donutColors.length];
                            legendColor.style.width = '16px';
                            legendColor.style.height = '16px';
                            legendColor.style.borderRadius = '50%';
                            legendColor.style.flexShrink = '0';

                            const legendLabel = document.createElement('span');
                            legendLabel.classList.add('legend-text');
                            legendLabel.style.color = '#333';
                            legendLabel.style.fontWeight = '500';
                            
                            // Format: "Category name" + percentage + (count)
                            const value = item.value || item.count || 0;
                            legendLabel.textContent = `${item.label} ${item.percentage}% (${value})`;

                            legendItem.appendChild(legendColor);
                            legendItem.appendChild(legendLabel);
                            legendContainer.appendChild(legendItem);
                        });
                        console.log('Legend updated successfully with bottom layout');
                    }
                } else {
                    console.error('Chart canvas element not found');
                }
            } else {
                console.error('No donut data received or empty array');
                // Try the dedicated donut chart endpoint as fallback
                fetch('/Admin/GetDocumentTypeStats')
                    .then(res => {
                        console.log('Document type stats response status:', res.status);
                        return res.json();
                    })
                    .then(donutData => {
                        console.log('Document type stats received:', donutData);
                        
                        if (donutData && donutData.length > 0) {
                            const donutLabels = donutData.map(d => d.label);
                            const donutValues = donutData.map(d => d.count); // Changed from d.value to d.count
                            const donutPercentages = donutData.map(d => d.percentage);
                            const donutColors = ['#8B4513', '#2E8B57', '#4682B4', '#DAA520'];
                            
                            const ctx = document.getElementById('chartCanvas');
                            if (ctx) {
                                new Chart(ctx.getContext('2d'), {
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
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (tooltipItem) {
                                                        const index = tooltipItem.dataIndex;
                                                        return `${donutLabels[index]}: ${donutValues[index]} (${donutPercentages[index]}%)`;
                                                    }
                                                }
                                            }
                                        },
                                        cutout: '60%'
                                    }
                                });
                                console.log('Fallback donut chart created successfully');
                                
                                // Update legend
                                const legendContainer = document.querySelector('.legend-container');
                                if (legendContainer) {
                                    legendContainer.innerHTML = '';
                                    // Set legend container to horizontal layout at bottom
                                    legendContainer.style.display = 'flex';
                                    legendContainer.style.flexWrap = 'wrap';
                                    legendContainer.style.justifyContent = 'center';
                                    legendContainer.style.marginTop = '10px';
                                    legendContainer.style.gap = '15px';
                                    
                                    donutData.forEach((item, index) => {
                                        const legendItem = document.createElement('div');
                                        legendItem.style.display = 'flex';
                                        legendItem.style.alignItems = 'center';
                                        legendItem.style.gap = '5px';
                                        legendItem.style.fontSize = '12px';

                                        const legendColor = document.createElement('div');
                                        legendColor.style.width = '12px';
                                        legendColor.style.height = '12px';
                                        legendColor.style.backgroundColor = donutColors[index % donutColors.length];
                                        legendColor.style.borderRadius = '2px';

                                        const legendText = document.createElement('span');
                                        legendText.style.fontWeight = '500';
                                        legendText.textContent = `${item.label} ${item.percentage}% (${item.count})`;

                                        legendItem.appendChild(legendColor);
                                        legendItem.appendChild(legendText);
                                        legendContainer.appendChild(legendItem);
                                    });
                                    console.log('Fallback legend updated successfully');
                                }
                            }
                        }
                    })
                    .catch(fallbackError => {
                        console.error('Fallback donut chart also failed:', fallbackError);
                    });
            }

            // Bar Chart
            if (stats.barData && stats.barData.length > 0) {
                const barLabels = stats.barData.map(d => d.month);
                const barValues = stats.barData.map(d => d.visits);
                
                console.log('Bar chart data:', { barLabels, barValues });
                
                const barCtx = document.getElementById('barChartCanvas');
                if (barCtx) {
                    new Chart(barCtx.getContext('2d'), {
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
                    console.log('Bar chart created successfully');
                } else {
                    console.error('Bar chart canvas element not found');
                }
            } else {
                console.error('No bar data received or empty array');
            }
        })
        .catch(error => {
            console.error('Error fetching dashboard stats:', error);
            
            // Set default values if fetch fails
            const totalPoliciesElem = document.querySelector('.stats-card-blue .number');
            const mostViewedSubtitle = document.querySelector('.stats-card-green .subtitle');
            const mostViewedText = document.querySelector('.stats-card-green .viewed-text');
            
            if (totalPoliciesElem) totalPoliciesElem.textContent = '0';
            if (mostViewedSubtitle) mostViewedSubtitle.textContent = 'N/A';
            if (mostViewedText) mostViewedText.textContent = 'Viewed: 0 times';
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