    // The following lines are not valid in a .js file:
    // src="js/bootstrap.bundle.min.js"
    // src="https://cdn.jsdelivr.net/npm/chart.js"

    // To use Chart.js in your .js file, make sure Chart.js is loaded in your HTML before this script runs.
    // Example in your HTML file:
    // <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    // <script src="js/bootstrap.bundle.min.js"></script>
    // <script src="js/StatisticsInAdmin.js"></script>
    // Initialize charts when page loads

// Helper function to detect current language
function isCurrentLanguageArabic() {
    return document.body.classList.contains('rtl') || 
           document.body.dir === 'rtl' || 
           document.body.lang === 'ar' ||
           document.documentElement.dir === 'rtl';
}

// Helper function to get current language code
function getCurrentLanguage() {
    return isCurrentLanguageArabic() ? 'ar' : 'en';
}

// Helper function to get translated text
function getTranslatedText(key, fallbackEn = '', fallbackAr = '', lang = null) {
    const currentLang = lang || getCurrentLanguage();
    if (window.translations && window.translations[currentLang] && window.translations[currentLang][key]) {
        return window.translations[currentLang][key];
    }
    // Fallback to provided defaults
    return currentLang === 'ar' ? fallbackAr : fallbackEn;
}

// Global variable to store most viewed data for language switching
let mostViewedData = null;

document.addEventListener('DOMContentLoaded', function () {
    
    fetch('/Admin/GetDashboardStats')
        .then(res => {
            return res.json();
        })
        .then(stats => {
            
            // Update stat cards
            const totalPoliciesElem = document.querySelector('.stats-card-blue .number');
            if (totalPoliciesElem && stats.totalPolicies !== undefined) {
                totalPoliciesElem.textContent = stats.totalPolicies;
            }

            // Store most viewed data for language switching
            if (stats.mostViewed) {
                mostViewedData = stats.mostViewed;
            }

            const mostViewedSubtitle = document.querySelector('.stats-card-green .subtitle');
            if (mostViewedSubtitle && stats.mostViewed && (stats.mostViewed.name || stats.mostViewed.nameAr)) {
                // Check current language to display appropriate name
                const isArabic = isCurrentLanguageArabic();
                const displayName = isArabic && stats.mostViewed.nameAr && stats.mostViewed.nameAr !== "N/A" 
                    ? stats.mostViewed.nameAr 
                    : stats.mostViewed.name;
                mostViewedSubtitle.textContent = displayName || "N/A";
            }
            
            const mostViewedText = document.querySelector('.stats-card-green .viewed-text');
            if (mostViewedText && stats.mostViewed && stats.mostViewed.views !== undefined) {
                // Get translated text using the same system as other components
                const viewedText = getTranslatedText('admin-stats-viewed-text', 'Viewed', 'مشاهدات');
                const timesText = getTranslatedText('admin-stats-times-text', 'times', 'مرة');
                mostViewedText.textContent = `${viewedText}: ${stats.mostViewed.views} ${timesText}`;
            }

            // Donut Chart (Pie Chart)
            if (stats.donutData && stats.donutData.length > 0) {
                const donutLabels = stats.donutData.map(d => d.label);
                const donutValues = stats.donutData.map(d => d.value || d.count); // Handle both value and count
                const donutPercentages = stats.donutData.map(d => d.percentage);
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
                                            const currentLang = getCurrentLanguage();
                                            const translatedLabel = window.translateDocumentType ? 
                                                window.translateDocumentType(donutLabels[index], currentLang) : donutLabels[index];
                                            return `${translatedLabel}: ${donutValues[index]} (${donutPercentages[index]}%)`;
                                        }
                                    }
                                }
                            },
                            cutout: '60%'
                        }
                    });
                    

                    
                    // Update legend with bottom layout and count in parentheses
                    const legendContainer = document.querySelector('.legend-container');
                    if (legendContainer) {
                        legendContainer.innerHTML = '';
                        
                        // Create a flex container for horizontal layout
                        legendContainer.style.display = 'flex';
                        legendContainer.style.flexWrap = 'wrap';
                        legendContainer.style.justifyContent = 'center';
                        legendContainer.style.gap = '15px';
                        
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
                            
                            // Get current language and translate if needed
                            const currentLang = getCurrentLanguage();
                            const translatedLabel = window.translateDocumentType ? 
                                window.translateDocumentType(item.label, currentLang) : item.label;
                            
                            legendLabel.textContent = `${translatedLabel} ${item.percentage}% (${value})`;

                            legendItem.appendChild(legendColor);
                            legendItem.appendChild(legendLabel);
                            legendContainer.appendChild(legendItem);
                        });
                    }
                } else {
                }
            } else {
                // Try the dedicated donut chart endpoint as fallback
                fetch('/Admin/GetDocumentTypeStats')
                    .then(res => {
                        return res.json();
                    })
                    .then(donutData => {
                        
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
                                        
                                        // Get current language and translate if needed
                                        const currentLang = getCurrentLanguage();
                                        const translatedLabel = window.translateDocumentType ? 
                                            window.translateDocumentType(item.label, currentLang) : item.label;
                                        
                                        legendText.textContent = `${translatedLabel} ${item.percentage}% (${item.count})`;

                                        legendItem.appendChild(legendColor);
                                        legendItem.appendChild(legendText);
                                        legendContainer.appendChild(legendItem);
                                    });
                                }
                            }
                        }
                    })
                    .catch(fallbackError => {
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
        }
    );
    
    // Listen for language changes to update chart legends and most viewed text
    document.addEventListener('languageChanged', function(event) {
        const newLang = event.detail.language;
        if (typeof updateChartLegends === 'function') {
            updateChartLegends(newLang);
        }
        
        // Update the "Most Viewed" card when language changes
        if (mostViewedData) {
            const mostViewedSubtitle = document.querySelector('.stats-card-green .subtitle');
            if (mostViewedSubtitle) {
                const isArabic = newLang === 'ar';
                const displayName = isArabic && mostViewedData.nameAr && mostViewedData.nameAr !== "N/A" 
                    ? mostViewedData.nameAr 
                    : mostViewedData.name;
                mostViewedSubtitle.textContent = displayName || "N/A";
            }
            
            const mostViewedText = document.querySelector('.stats-card-green .viewed-text');
            if (mostViewedText && mostViewedData.views !== undefined) {
                const viewedText = getTranslatedText('admin-stats-viewed-text', 'Viewed', 'مشاهدات', newLang);
                const timesText = getTranslatedText('admin-stats-times-text', 'times', 'مرة', newLang);
                mostViewedText.textContent = `${viewedText}: ${mostViewedData.views} ${timesText}`;
            }
        }
    });
    }
)
