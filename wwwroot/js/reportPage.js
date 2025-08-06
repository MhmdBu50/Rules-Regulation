// Report Page JavaScript Functionality

// Global variables
let viewsDownloadsChart = null;
let topRecordsChart = null;
let topDownloadsChart = null;
let documentTypeChart = null;
let chartData = null;
let allDocuments = []; // Store original documents data for sorting/filtering

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Get chart data from the page
    const chartDataElement = document.getElementById('chartData');
    if (chartDataElement) {
        try {
            chartData = JSON.parse(chartDataElement.textContent);

            
            // Initialize charts with accurate data
            initializeViewsDownloadsChart();
            initializeTopRecordsChart();
            initializeTopDownloadsChart();
            initializeDocumentTypeChart();
            
            // Initialize table functionality
            storeDocumentsData();
            initializeTableControls();
            
        } catch (error) {

        }
    } else {

    }
});

/**
 * Line Chart: Views & Downloads over Time (using accurate monthly data)
 */
function initializeViewsDownloadsChart() {
    const ctx = document.getElementById('viewsDownloadsChart');
    if (!ctx) {

        return;
    }



    // Prepare data from server
    const labels = chartData.monthlyChartData.map(item => {
        const [year, month] = item.monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    const viewsData = chartData.monthlyChartData.map(item => item.views);
    const downloadsData = chartData.monthlyChartData.map(item => item.downloads);

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Views',
                data: viewsData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }, {
                label: 'Downloads',
                data: downloadsData,
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#e74c3c',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Views & Downloads Trend (Last 6 Months)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000
            }
        }
    };

    viewsDownloadsChart = new Chart(ctx, config);

}

/**
 * Bar Chart: Top 5 Most Viewed Records (using accurate database data)
 */
function initializeTopRecordsChart() {
    const ctx = document.getElementById('topRecordsChart');
    if (!ctx) {

        return;
    }



    // Prepare data from server
    const labels = chartData.topRecordsData.map(item => {
        const title = item.title;
        return title.length > 25 ? title.substring(0, 25) + '...' : title;
    });
    const data = chartData.topRecordsData.map(item => item.viewCount);

    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Views',
                data: data,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 5 Most Viewed Records',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const fullTitle = chartData.topRecordsData[context[0].dataIndex].title;
                            return fullTitle;
                        },
                        label: function(context) {
                            const recordId = chartData.topRecordsData[context.dataIndex].recordId;
                            return `Record ID: ${recordId} - Views: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000
            }
        }
    };

    topRecordsChart = new Chart(ctx, config);

}

/**
 * Bar Chart: Top 5 Most Downloaded Records (using accurate database data)
 */
function initializeTopDownloadsChart() {
    const ctx = document.getElementById('topDownloadsChart');
    if (!ctx) {

        return;
    }



    // Prepare data from server
    const labels = chartData.topDownloadsData.map(item => {
        const title = item.title;
        return title.length > 25 ? title.substring(0, 25) + '...' : title;
    });
    const data = chartData.topDownloadsData.map(item => item.downloadCount);

    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Downloads',
                data: data,
                backgroundColor: [
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(52, 152, 219, 0.8)'
                ],
                borderColor: [
                    'rgba(231, 76, 60, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(52, 152, 219, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 5 Most Downloaded Records',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const fullTitle = chartData.topDownloadsData[context[0].dataIndex].title;
                            return fullTitle;
                        },
                        label: function(context) {
                            const recordId = chartData.topDownloadsData[context.dataIndex].recordId;
                            return `Record ID: ${recordId} - Downloads: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000
            }
        }
    };

    topDownloadsChart = new Chart(ctx, config);

}

/**
 * Pie Chart: Document Type Distribution (using accurate database data)
 */
function initializeDocumentTypeChart() {
    const ctx = document.getElementById('documentTypeChart');
    if (!ctx) {

        return;
    }



    // Prepare chart data
    const labels = chartData.documentTypes.map(item => item.label);
    const data = chartData.documentTypes.map(item => item.value);
    const percentages = chartData.documentTypes.map(item => item.percentage);

    // Generate colors
    const colors = [
        '#4facfe', '#43e97b', '#fa709a', '#a855f7', '#feca57',
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'
    ];

    const config = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Document Type Distribution',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = percentages[context.dataIndex];
                            return `${label}: ${value} documents (${percentage}%)`;
                        }
                    },
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#4facfe',
                    borderWidth: 1
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000
            }
        }
    };

    documentTypeChart = new Chart(ctx, config);

}

/**
 * Store original documents data for filtering and sorting
 */
function storeDocumentsData() {
    const table = document.getElementById('documentsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    allDocuments = Array.from(rows).map(row => ({
        element: row,
        name: row.getAttribute('data-name') || '',
        type: row.getAttribute('data-type') || '',
        downloads: parseInt(row.getAttribute('data-downloads')) || 0,
        views: parseInt(row.getAttribute('data-views')) || 0,
        details: parseInt(row.getAttribute('data-details')) || 0,
        total: parseInt(row.getAttribute('data-total')) || 0
    }));


}

/**
 * Initialize table controls (sorting and filtering)
 */
function initializeTableControls() {
    const sortSelect = document.getElementById('sortSelect');
    const filterSelect = document.getElementById('filterSelect');

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortTable(this.value);
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            filterTable(this.value);
        });
    }


}

/**
 * Sort table by specified criteria
 */
function sortTable(sortBy) {


    let sortedDocuments = [...allDocuments];

    switch (sortBy) {
        case 'totalInteractions':
            sortedDocuments.sort((a, b) => b.total - a.total);
            break;
        case 'downloads':
            sortedDocuments.sort((a, b) => b.downloads - a.downloads);
            break;
        case 'views':
            sortedDocuments.sort((a, b) => b.views - a.views);
            break;
        case 'details':
            sortedDocuments.sort((a, b) => b.details - a.details);
            break;
        case 'name':
            sortedDocuments.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'type':
            sortedDocuments.sort((a, b) => a.type.localeCompare(b.type));
            break;
    }

    // Apply current filter if any
    const filterSelect = document.getElementById('filterSelect');
    const currentFilter = filterSelect ? filterSelect.value : '';
    if (currentFilter) {
        sortedDocuments = sortedDocuments.filter(doc => doc.type === currentFilter);
    }

    renderTable(sortedDocuments);
}

/**
 * Filter table by document type
 */
function filterTable(filterBy) {


    let filteredDocuments = [...allDocuments];

    if (filterBy) {
        filteredDocuments = filteredDocuments.filter(doc => doc.type === filterBy);
    }

    // Apply current sort if any
    const sortSelect = document.getElementById('sortSelect');
    const currentSort = sortSelect ? sortSelect.value : 'totalInteractions';
    
    switch (currentSort) {
        case 'totalInteractions':
            filteredDocuments.sort((a, b) => b.total - a.total);
            break;
        case 'downloads':
            filteredDocuments.sort((a, b) => b.downloads - a.downloads);
            break;
        case 'views':
            filteredDocuments.sort((a, b) => b.views - a.views);
            break;
        case 'details':
            filteredDocuments.sort((a, b) => b.details - a.details);
            break;
        case 'name':
            filteredDocuments.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'type':
            filteredDocuments.sort((a, b) => a.type.localeCompare(b.type));
            break;
    }

    renderTable(filteredDocuments);
}

/**
 * Render table with provided documents
 */
function renderTable(documents) {
    const tbody = document.querySelector('#documentsTable tbody');
    if (!tbody) return;

    // Clear current content
    tbody.innerHTML = '';

    // Add documents with animation
    documents.forEach((doc, index) => {
        const newRow = doc.element.cloneNode(true);
        newRow.style.opacity = '0';
        newRow.style.transform = 'translateY(20px)';
        tbody.appendChild(newRow);

        // Animate in
        setTimeout(() => {
            newRow.style.transition = 'all 0.3s ease';
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateY(0)';
        }, index * 50);
    });


}

/**
 * Export entire report to PDF
 */
async function exportToPDF() {


    // Show loading state
    const exportBtn = document.querySelector('.export-pdf-btn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
    exportBtn.disabled = true;

    try {
        // Import jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Add title and header
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('Analytics Dashboard Report', 20, 30);

        // Add generation date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 40);

        let yPosition = 60;

        // Add statistics summary with improved data extraction
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Summary Statistics', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(11);
        doc.setTextColor(60);

        // Extract statistics with better selectors and fallbacks
        const totalDocs = document.querySelector('.stat-card-blue .stat-content h3')?.textContent?.trim() || 
                         document.querySelector('.stat-card:nth-child(1) .stat-content h3')?.textContent?.trim() ||
                         document.querySelector('[data-stat="documents"] .stat-content h3')?.textContent?.trim() || 'N/A';
        
        const totalUsers = document.querySelector('.stat-card-green .stat-content h3')?.textContent?.trim() || 
                          document.querySelector('.stat-card:nth-child(2) .stat-content h3')?.textContent?.trim() ||
                          document.querySelector('[data-stat="users"] .stat-content h3')?.textContent?.trim() || 'N/A';
        
        const totalDownloads = document.querySelector('.stat-card-orange .stat-number')?.textContent?.trim() || 
                              document.querySelector('.stat-card[data-stat="downloads"] .stat-number')?.textContent?.trim() ||
                              document.querySelector('.stat-card:nth-child(3) .stat-number')?.textContent?.trim() || 'N/A';
        
        const totalViews = document.querySelector('.stat-card-purple .stat-number')?.textContent?.trim() || 
                          document.querySelector('.stat-card[data-stat="views"] .stat-number')?.textContent?.trim() ||
                          document.querySelector('.stat-card:nth-child(4) .stat-number')?.textContent?.trim() || 'N/A';

        const stats = [
            `Total Documents: ${totalDocs}`,
            `Registered Users: ${totalUsers}`,
            `Total Downloads: ${totalDownloads}`,
            `Total Views: ${totalViews}`
        ];

        stats.forEach(stat => {
            doc.text(stat, 25, yPosition);
            yPosition += 10;
        });

        yPosition += 15;

        // Add all 4 charts with better error handling and spacing
        const charts = [
            { chart: viewsDownloadsChart, title: 'Views & Downloads Trend Over Time', id: 'viewsDownloadsChart' },
            { chart: topRecordsChart, title: 'Top 5 Most Viewed Records', id: 'topRecordsChart' },
            { chart: topDownloadsChart, title: 'Top 5 Most Downloaded Records', id: 'topDownloadsChart' },
            { chart: documentTypeChart, title: 'Document Type Distribution', id: 'documentTypeChart' }
        ];

        for (let i = 0; i < charts.length; i++) {
            const { chart, title, id } = charts[i];
            
            // Check if we need a new page
            if (yPosition > 180) {
                doc.addPage();
                yPosition = 30;
            }

            if (chart && chart.canvas) {

                await addChartToPDF(doc, chart, title, yPosition);
                yPosition += 85;
                
                // Add Document Type Distribution percentages under the pie chart
                if (id === 'documentTypeChart' && chartData && chartData.documentTypes && chartData.documentTypes.length > 0) {
                    doc.setFontSize(10);
                    doc.setTextColor(60);
                    
                    // Add a small gap
                    yPosition += 5;
                    
                    chartData.documentTypes.forEach((item, index) => {
                        const typeName = item.label || 'Unknown';
                        const count = item.value || 0;
                        const percentage = item.percentage || '0';
                        
                        doc.text(`- ${typeName}: ${count} documents (${percentage}%)`, 25, yPosition);
                        yPosition += 6;
                    });
                    
                    yPosition += 10; // Extra space after percentages
                }
            } else {

                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(`Chart not available: ${title}`, 25, yPosition);
                yPosition += 15;
            }
        }

        // Add Top Lists sections on new page
        doc.addPage();
        yPosition = 30;
        
        // Add Top Downloaded section
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Top Downloaded Records', 20, yPosition);
        yPosition += 15;

        // Extract top downloaded records from chart data instead of DOM
        if (chartData && chartData.topDownloadsData && chartData.topDownloadsData.length > 0) {
            doc.setFontSize(11);
            doc.setTextColor(60);
            
            chartData.topDownloadsData.slice(0, 5).forEach((item, index) => {
                const ranking = index + 1;
                const title = item.title || 'N/A';
                const downloads = item.downloadCount || 0;
                
                // Add ranking badge indicator
                let badge = '';
                if (ranking === 1) badge = '#1';
                else if (ranking === 2) badge = '#2';
                else if (ranking === 3) badge = '#3';
                else badge = `#${ranking}`;
                
                // Truncate title if too long
                const displayTitle = title.length > 45 ? title.substring(0, 42) + '...' : title;
                
                doc.text(`${badge} ${displayTitle}`, 25, yPosition);
                doc.text(`${downloads} downloads`, 170, yPosition);
                yPosition += 8;
            });
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('No downloaded records data available', 25, yPosition);
            yPosition += 8;
        }

        yPosition += 15;

        // Add Top Viewed section
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Top Viewed Records', 20, yPosition);
        yPosition += 15;

        // Extract top viewed records from chart data instead of DOM
        if (chartData && chartData.topRecordsData && chartData.topRecordsData.length > 0) {
            doc.setFontSize(11);
            doc.setTextColor(60);
            
            chartData.topRecordsData.slice(0, 5).forEach((item, index) => {
                const ranking = index + 1;
                const title = item.title || 'N/A';
                const views = item.viewCount || 0;
                
                // Add ranking badge indicator
                let badge = '';
                if (ranking === 1) badge = '#1';
                else if (ranking === 2) badge = '#2';
                else if (ranking === 3) badge = '#3';
                else badge = `#${ranking}`;
                
                // Truncate title if too long
                const displayTitle = title.length > 45 ? title.substring(0, 42) + '...' : title;
                
                doc.text(`${badge} ${displayTitle}`, 25, yPosition);
                doc.text(`${views} views`, 170, yPosition);
                yPosition += 8;
            });
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('No viewed records data available', 25, yPosition);
            yPosition += 8;
        }

        yPosition += 15;

        // Add Most Details Shown section
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Most Details Shown', 20, yPosition);
        yPosition += 15;

        // Extract most details shown records from table data
        const detailsTableRows = document.querySelectorAll('#documentsTable tbody tr');
        if (detailsTableRows.length > 0) {
            doc.setFontSize(11);
            doc.setTextColor(60);
            
            // Create array from table data and sort by details column
            const detailsData = Array.from(detailsTableRows).map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    title: cells[1]?.textContent?.trim() || 'N/A',
                    details: parseInt(cells[6]?.textContent?.trim()) || 0
                };
            }).filter(item => item.details > 0)
              .sort((a, b) => b.details - a.details)
              .slice(0, 5);
            
            if (detailsData.length > 0) {
                detailsData.forEach((item, index) => {
                    const ranking = index + 1;
                    
                    // Add ranking badge indicator
                    let badge = '';
                    if (ranking === 1) badge = '#1';
                    else if (ranking === 2) badge = '#2';
                    else if (ranking === 3) badge = '#3';
                    else badge = `#${ranking}`;
                    
                    // Truncate title if too long
                    const displayTitle = item.title.length > 45 ? item.title.substring(0, 42) + '...' : item.title;
                    
                    doc.text(`${badge} ${displayTitle}`, 25, yPosition);
                    doc.text(`${item.details} details`, 170, yPosition);
                    yPosition += 8;
                });
            } else {
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text('No details shown data available', 25, yPosition);
                yPosition += 8;
            }
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('No details shown data available', 25, yPosition);
            yPosition += 8;
        }

        // Add document statistics table on new page
        doc.addPage();
        yPosition = 30;
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Document Statistics', 20, yPosition);
        yPosition += 15;

        // Table headers with better spacing
        doc.setFontSize(9);
        doc.setTextColor(0);
        const headers = ['ID', 'Document Name', 'Type', 'Department', 'Downloads', 'Views', 'Details', 'Total'];
        const colWidths = [12, 45, 25, 25, 12, 12, 12, 12];
        let xPos = 20;

        // Header background
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPosition - 5, 170, 8, 'F');

        headers.forEach((header, i) => {
            doc.text(header, xPos + 1, yPosition);
            xPos += colWidths[i];
        });

        yPosition += 8;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;

        // Table data with improved text handling
        const tableRows = document.querySelectorAll('#documentsTable tbody tr');
        let rowCount = 0;
        
        Array.from(tableRows).slice(0, 35).forEach(row => { // Increased limit to 35 rows
            const cells = row.querySelectorAll('td');
            if (cells.length >= 8) {
                xPos = 20;
                
                // Alternate row coloring
                if (rowCount % 2 === 1) {
                    doc.setFillColor(248, 248, 248);
                    doc.rect(20, yPosition - 3, 170, 7, 'F');
                }

                doc.setTextColor(0);
                
                // Record ID
                doc.text(cells[0].textContent.trim(), xPos + 1, yPosition);
                xPos += colWidths[0];
                
                // Document name (improved truncation)
                let docName = cells[1].textContent.trim();
                if (docName.length > 30) docName = docName.substring(0, 27) + '...';
                doc.text(docName, xPos + 1, yPosition);
                xPos += colWidths[1];

                // Type (improved truncation)
                let docType = cells[2].textContent.trim();
                if (docType.length > 15) docType = docType.substring(0, 12) + '...';
                doc.text(docType, xPos + 1, yPosition);
                xPos += colWidths[2];

                // Department (improved truncation)
                let department = cells[3].textContent.trim();
                if (department.length > 15) department = department.substring(0, 12) + '...';
                doc.text(department, xPos + 1, yPosition);
                xPos += colWidths[3];

                // Numbers (Downloads, Views, Details, Total) - centered
                for (let i = 4; i <= 7; i++) {
                    const value = cells[i].textContent.trim();
                    const valueWidth = doc.getTextWidth(value);
                    const centerPos = xPos + (colWidths[i] - valueWidth) / 2;
                    doc.text(value, centerPos, yPosition);
                    xPos += colWidths[i];
                }

                yPosition += 7;
                rowCount++;

                // Check if we need a new page
                if (yPosition > 275) {
                    doc.addPage();
                    yPosition = 30;
                    
                    // Re-add headers on new page
                    doc.setFontSize(9);
                    xPos = 20;
                    doc.setFillColor(240, 240, 240);
                    doc.rect(20, yPosition - 5, 170, 8, 'F');
                    
                    headers.forEach((header, i) => {
                        doc.text(header, xPos + 1, yPosition);
                        xPos += colWidths[i];
                    });
                    
                    yPosition += 8;
                    doc.line(20, yPosition, 190, yPosition);
                    yPosition += 5;
                }
            }
        });

        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, 170, 290);
            doc.text('Generated by Rules & Regulation System', 20, 290);
        }

        // Save the PDF
        const fileName = `Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);



    } catch (error) {

        alert(`Error generating PDF: ${error.message}. Please try again.`);
    } finally {
        // Reset button
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
    }
}

/**
 * Add chart to PDF as image
 */
async function addChartToPDF(doc, chart, title, yPosition) {
    try {
        const canvas = chart.canvas;
        
        // Wait a moment to ensure chart is fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get chart image data with white background
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Add title
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(title, 20, yPosition);
        
        // Add chart image with better sizing
        doc.addImage(imgData, 'PNG', 20, yPosition + 5, 170, 70);
        
    } catch (error) {

        // Fallback: add placeholder text
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Chart could not be exported: ${title}`, 20, yPosition + 20);
    }
}

/**
 * Go back to Admin page
 */
function goBack() {
    window.location.href = '/Admin/AdminPage';
}

/**
 * View Report function (called from Admin page)
 */
function viewReport() {
    window.location.href = '/Reports/ReportPage';
}
