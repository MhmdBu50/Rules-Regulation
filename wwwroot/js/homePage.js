

        //chatbot functionality

        const chatIcon = document.getElementById('chat-icon');
        const chatBox = document.getElementById('chat-box');
        const chatClose = document.getElementById('chat-close');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const chatMessages = document.getElementById('chat-messages');


        chatIcon.addEventListener('click', () => {
            chatBox.classList.add('active');
        });


        chatClose.addEventListener('click', () => {
            chatBox.classList.remove('active');
        });

        function sendMessage() {
            const message = messageInput.value.trim();
            if (message !== '') {

                const userMessage = document.createElement('div');
                userMessage.classList.add('message', 'user-message');
                userMessage.textContent = message;
                chatMessages.appendChild(userMessage);

                messageInput.value = '';

                chatMessages.scrollTop = chatMessages.scrollHeight;

                setTimeout(() => {
                    const botMessage = document.createElement('div');
                    botMessage.classList.add('message', 'bot-message');
                    botMessage.textContent = "Eat kabsa habibi";
                    chatMessages.appendChild(botMessage);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
            }
        }

        sendButton.addEventListener('click', sendMessage)
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        document.addEventListener('click', (event) => {
            // If the chat box is open AND the click target is outside both the chatBox and chatIcon
            if (
                chatBox.classList.contains('active') &&
                !chatBox.contains(event.target) &&
                !chatIcon.contains(event.target)
            ) {
                chatBox.classList.remove('active');
            }
        });

        //filter panel functionality

        document.addEventListener("DOMContentLoaded", function () {
            const button = document.getElementById("filter-button");
            const panel = document.getElementById("filter-panel");

            button.addEventListener("click", function (e) {
                e.stopPropagation();
                panel.classList.toggle("d-none");
            });

            document.addEventListener("click", function (e) {
                if (!panel.contains(e.target) && e.target !== button) {
                    panel.classList.add("d-none");
                }
            });
        });

        // date filter functionality
        document.addEventListener("DOMContentLoaded", function () {
            const radios = document.querySelectorAll('input[name="dateOption"]');
            const dateFields = document.getElementById("dateRangeFields");

            radios.forEach(radio => {
                radio.addEventListener("change", function () {
                    if (this.value === "range") {
                        dateFields.style.display = "block";
                    } else {
                        dateFields.style.display = "none";
                    }
                });
            });
        });
        /*        // Fitty.js for responsive text sizing
        fitty('.nav-label:not(.history-button) label', {
            minSize: 14,
            maxSize: 18,
            multiLine: true
        });
        

        fitty('.history-button label', {
            minSize: 12,
            maxSize: 24,
            multiLine: true
        });*/

        document.querySelectorAll('.bar-button .nav-label label').forEach(el => {
            el.style.setProperty('white-space', 'normal', 'important');
        });

//  Safe SVG loader using innerHTML
    function getSVGFromTemplate(id) {
        const tpl = document.getElementById(id);
        if (!tpl) return null;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = tpl.innerHTML.trim();
        return wrapper.firstElementChild;
    }

    //  Replace .svg-container with normal version from template
    function initIcons(selector) {
        document.querySelectorAll(selector).forEach(container => {
            const parent = container.closest('[data-id]');
            if (!parent) return;

            const dataId = parent.getAttribute('data-id');
            const svg = getSVGFromTemplate(`normal-${dataId}`);
            if (svg) {
                container.innerHTML = '';  // clean existing
                container.appendChild(svg);
            }
        });
    }

    //  Toggle between normal and altered SVGs when clicked
    function alter(clickedEl) {
        document.querySelectorAll('[data-id]').forEach(el => {
            const id = el.dataset.id;
            const container = el.querySelector('.svg-container');
            const normal = getSVGFromTemplate(`normal-${id}`);
            if (container && normal) {
                container.innerHTML = '';
                container.appendChild(normal);
            }
        });

        const id = clickedEl.dataset.id;
        const container = clickedEl.querySelector('.svg-container');
        const altered = getSVGFromTemplate(`altered-${id}`);
        if (container && altered) {
            container.innerHTML = '';
            container.appendChild(altered);
        }
    }

    //  Wait until DOM is fully loaded, then run once
    document.addEventListener('DOMContentLoaded', () => {
        initIcons('.navigation-bar .svg-container');
        initIcons('#sideNavBar .svg-container');
        
        // Add small delay to ensure SVG templates are fully loaded
        setTimeout(() => {
            // Set home button to altered state since we're on the home page
            const homeButton = document.querySelector('[data-id="homeButton"]');
            if (homeButton) {
                const container = homeButton.querySelector('.svg-container');
                if (container) {
                    const alteredHomeSvg = getSVGFromTemplate('altered-homeButton');
                    if (alteredHomeSvg) {
                        container.innerHTML = '';
                        container.appendChild(alteredHomeSvg);
                    }
                }
                
                // Also mark it as active
                homeButton.classList.add('active');
                homeButton.classList.add('hovered');
            }
        }, 200); // Increased delay to ensure everything is loaded
    });


document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll('.bar-button');
    let activeBtn = null;
    
    // Set home button as initially active since we're on the home page
    const homeButton = document.querySelector('[data-id="homeButton"]');
    if (homeButton) {
        activeBtn = homeButton;
    }

    buttons.forEach(btn => {
        // Hover in: expand hovered button, shrink active if different
        btn.addEventListener('mouseenter', () => {
            btn.classList.add('hovered');
            if (activeBtn && activeBtn !== btn) {
                activeBtn.classList.remove('hovered');
            }
        });

        // Hover out: collapse unless active, and restore active if nothing is hovered
        btn.addEventListener('mouseleave', () => {
            if (btn !== activeBtn) {
                btn.classList.remove('hovered');
            }

            // 👇 This is the important part
            setTimeout(() => {
                const isHoveringAny = Array.from(buttons).some(b => b.matches(':hover'));
                if (!isHoveringAny && activeBtn) {
                    activeBtn.classList.add('hovered');
                }
            }, 10); // Small delay to catch edge cases
        });

        // Click: mark as active and expand
        btn.addEventListener('click', () => {
            if (activeBtn && activeBtn !== btn) {
                activeBtn.classList.remove('active');
                activeBtn.classList.remove('hovered');
            }

            activeBtn = btn;
            activeBtn.classList.add('active');
            activeBtn.classList.add('hovered');
        });
    });
});

//redirect to PDF download page
function DownloadPdf(id) {
    // Record the download action in history and wait for it to complete
    recordAction(id, 'download')
        .then(() => {
            // Only redirect after history is recorded
            window.location.href = `/admin/DownloadPdf/${id}`;
        })
        .catch(error => {
            // Even if history fails, still allow download
            window.location.href = `/admin/DownloadPdf/${id}`;
        });
}

// Example: open PDF in a new tab
function ViewPdf(id) {
    // Record the view action in history
    recordAction(id, 'view')
        .then(() => {
            // Open PDF after history is recorded
            window.open(`/admin/ViewPdf/${id}`, '_blank');
        })
        .catch(error => {

            // Even if history fails, still allow viewing
            window.open(`/admin/ViewPdf/${id}`, '_blank');
        });
}

// Function to record user actions in history
function recordAction(recordId, action) {
    return fetch('/History/RecordAction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recordId: recordId,
            action: action
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {

            return data;
        } else {

            throw new Error('Failed to record action');
        }
    })
    .catch(error => {

        throw error;
    });
}

// ==================== Navigation Bar Button Handlers ====================

// Home button: resets all filters
function navigateToHome(buttonElement) {
    alter(buttonElement);     // Call alter function for visual feedback
    resetCardDisplay();       // Unhide any hidden cards from previous filter
    clearFilters();           // Clears all filters and shows all records dynamically
}

// Student Guides button: sets filters and applies
function navigateToStudentGuides(buttonElement) {
    alter(buttonElement);     // Call alter function for visual feedback
    resetCardDisplay();       // Unhide hidden cards before applying filters

    // Apply Students section and Guidelines type filters dynamically
    setFilters({
        sections: ['Students'],
        types: ['Guidelines']
    });
}

// Student Rules button: Students section + Regulation & Policy types
function navigateToStudentRules(buttonElement) {
    alter(buttonElement);     // Call alter function for visual feedback
    resetCardDisplay();       // Unhide hidden cards before applying filters

    // Apply filters: Students section, Regulation + Policy document types
    setFilters({
        sections: ['Students'],
        types: ['Regulation', 'Policy']
    });
}

// Employee Rules button: Members section + Regulation & Policy types
function navigateToEmployeeRules(buttonElement) {
    alter(buttonElement);     // Call alter function for visual feedback
    resetCardDisplay();       // Unhide hidden cards before applying filters

    // Apply filters: Members section, Regulation + Policy document types
    setFilters({
        sections: ['Members'],
        types: ['Regulation', 'Policy']
    });
}

// Academic Rules button: Enrolled Programs section + Regulation & Policy types
function navigateToAcademicRules(buttonElement) {
    alter(buttonElement);     // Call alter function for visual feedback
    resetCardDisplay();       // Unhide hidden cards before applying filters

    // Apply filters: Enrolled Programs section, Regulation + Policy document types
    setFilters({
        sections: ['Enrolled Programs'],
        types: ['Regulation', 'Policy']
    });
}

// ==================== HISTORY FUNCTIONALITY ====================
// This section handles the complete history page implementation including:
// - Dynamic page generation with translation support
// - View switching between table and card layouts
// - Data fetching and processing from backend
// - Real-time language switching without page reload

function navigateToHistory() {
    // Hide the main records container to show history page instead
    // This provides a smooth transition from main page to history view
    const recordsContainer = document.querySelector('.row.justify-content-center.g-lg-4.g-md-3.g-sm-2.g-1');
    if (recordsContainer) {
        recordsContainer.style.display = 'none'; // Hide main content
    }
    
    // Remove any existing history container to prevent duplicates
    // This ensures clean state when navigating back to history
    const existingHistory = document.getElementById('history-container');
    if (existingHistory) {
        existingHistory.remove(); // Clean up previous history instance
    }
    
    // Get current language and translations for dynamic content generation
    // This enables immediate translation support without waiting for language change events
    const currentLanguage = localStorage.getItem('websiteLanguage') || 'en'; // Default to English if no language set
    const trans = translations && translations[currentLanguage] ? translations[currentLanguage] : {}; // Get translation object or empty object as fallback
    
    // Create the main history container element dynamically
    // This approach allows for complete control over the layout and styling
    const historyContainer = document.createElement('div');
    historyContainer.id = 'history-container'; // Unique ID for targeting and cleanup
    historyContainer.className = 'container-fluid'; // Bootstrap container for responsive layout
    historyContainer.style.marginTop = '40px'; // Position 40px below navigation bar for proper spacing
    
    // Generate the complete HTML structure for the history page
    // This includes header, view toggle buttons, and content containers
    historyContainer.innerHTML = `
        <div class="row justify-content-center g-lg-4 g-md-3 g-sm-2 g-1" style="margin: 0px 40px;">
            <div class="col-12">
                <!-- Header with title and toggle buttons outside table -->
                <!-- Uses gradient background and responsive design for visual appeal -->
                <div class="d-flex justify-content-between align-items-center mb-5" style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
                    <div>
                        <!-- Main title with icon and dynamic translation -->
                        <h3 class="mb-0">
                            <i class="fas fa-history me-3"></i>
                            <span class="fw-bold">${trans['history-activity-title'] || 'Your Activity History'}</span>
                        </h3>
                        <!-- Subtitle with dynamic translation and info icon -->
                        <p class="mb-0 mt-2 opacity-75">
                            <i class="fas fa-info-circle me-2"></i>${trans['history-track-activity'] || 'Track your recent views and downloads'}
                        </p>
                    </div>
                    <!-- View toggle buttons - allow switching between table and card views -->
                    <div class="view-toggle" dir="ltr">
                        <div class="btn-group" role="group" aria-label="View toggle">
                            <!-- Table view button with icon and translated text -->
                            <button type="button" class="btn btn-outline-light btn-sm" id="table-view-btn" onclick="toggleHistoryView('table')">
                                <i class="fas fa-table me-1"></i>${trans['history-table-btn'] || 'Table'}
                            </button>
                            <!-- Card view button with icon and translated text -->
                            <button type="button" class="btn btn-outline-light btn-sm" id="card-view-btn" onclick="toggleHistoryView('card')">
                                <i class="fas fa-th-large me-1"></i>${trans['history-cards-btn'] || 'Cards'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Table container - initially visible, shows tabular data -->
                <div id="table-container" class="card shadow-lg border-0" style="border-radius: 15px; display: block;">
                    <div class="card-body p-4" style="background: rgba(255,255,255,0.95); border-radius: 15px;">
                        <div id="history-table-content">
                            <!-- Loading state while fetching data from backend -->
                            <div class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">${trans['history-loading'] || 'Loading...'}</span>
                                </div>
                                <p class="mt-3 text-muted">
                                    <i class="fas fa-clock me-2"></i>${trans['history-loading-text'] || 'Loading your history...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cards container - initially hidden, shows card-based layout -->
                <div id="cards-container" style="display: none;">
                    <div id="history-cards-content">
                        <!-- Cards will be rendered here dynamically -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert the history container into the DOM at the correct position
    // This ensures proper layout and positioning relative to navigation
    const navigationBar = document.querySelector('.navigation-bar.d-none.d-lg-flex');
    
    if (navigationBar) {
        // Preferred insertion point: right after the navigation bar
        // This maintains consistent spacing and visual hierarchy
        navigationBar.insertAdjacentElement('afterend', historyContainer);
    } else {
        // Fallback insertion: before main content container
        // Used when navigation bar structure differs or is not found
        const containerFluid = document.querySelector('.container-fluid');
        if (containerFluid) {
            containerFluid.parentNode.insertBefore(historyContainer, containerFluid);
        } else {
            // Last resort: append to body if no suitable container found
            document.body.appendChild(historyContainer);
        }
    }
    
    // Fetch user history data from the backend API
    // This makes an asynchronous request to get the user's activity history
    fetch('/History/GetUserHistory')
        .then(response => {
            // Parse the JSON response from the server
            return response.json();
        })
        .then(data => {
            // Process and organize the raw history data for display
            // Group actions by record and keep latest action for each action type
            const recordActions = {};
            
            // Check if data exists and is not empty
            if (data && data.length > 0) {
                // Loop through each history item from the backend
                data.forEach(item => {
                    const recordId = item.recordId; // Unique identifier for the document
                    const actionType = item.action.toLowerCase(); // Normalize action type (view, download, show_details)
                    
                    // Initialize record structure if not exists
                    if (!recordActions[recordId]) {
                        recordActions[recordId] = {
                            recordName: item.recordName, // Store document name in English
                            regulationNameAr: item.regulationNameAr, // Store document name in Arabic
                            view: null, // Track view actions
                            download: null, // Track download actions
                            show_details: null // Track show details actions
                        };
                    }
                    
                    // Keep only the most recent action for each action type
                    // This prevents duplicate entries and shows latest activity
                    if (!recordActions[recordId][actionType] || 
                        new Date(item.actionDate) > new Date(recordActions[recordId][actionType].actionDate)) {
                        recordActions[recordId][actionType] = item; // Store the most recent action
                    }
                });
            }
            
            // Store processed data globally for view switching
            // This allows switching between table and card views without re-fetching
            historyData = recordActions;
            
            // Set default active button state for table view
            // Table view is the default display mode
            const tableBtn = document.getElementById('table-view-btn');
            const cardBtn = document.getElementById('card-view-btn');
            
            if (tableBtn && cardBtn) {
                // Highlight table button as active (solid background)
                tableBtn.classList.remove('btn-outline-light');
                tableBtn.classList.add('btn-light');
                // Set card button as inactive (outline style)
                cardBtn.classList.remove('btn-light');
                cardBtn.classList.add('btn-outline-light');
            }
            
            // Render the default table view with the processed data
            // This displays the history in tabular format
            renderTableView();
        })
        .catch(error => {
            // Handle any errors during data fetching
            // Display user-friendly error message instead of crashing
            console.error('Error fetching history:', error);
            const historyTableContent = document.getElementById('history-table-content');
            if (historyTableContent) {
                historyTableContent.innerHTML = '<div class="alert alert-danger">Error loading history</div>';
            }
        });
}

// Global variables for history functionality
// These variables maintain state across different functions and view switches
let historyData = []; // Stores processed history data from backend
let currentView = 'table'; // Tracks current display mode: 'table' or 'card' (default: table)

// ==================== VIEW SWITCHING FUNCTIONALITY ====================
// Toggle between table and card views without re-fetching data
// This provides responsive design options for different user preferences
function toggleHistoryView(viewType) {
    currentView = viewType; // Update global state
    
    // Get button elements for visual state management
    const tableBtn = document.getElementById('table-view-btn');
    const cardBtn = document.getElementById('card-view-btn');
    
    // Get container elements for show/hide functionality
    const tableContainer = document.getElementById('table-container');
    const cardsContainer = document.getElementById('cards-container');
    
    if (viewType === 'table') {
        // Switch to table view: show table, hide cards
        tableContainer.style.display = 'block'; // Make table visible
        cardsContainer.style.display = 'none'; // Hide card container
        
        // Update button visual states
        tableBtn.classList.remove('btn-outline-light'); // Remove outline style
        tableBtn.classList.add('btn-light'); // Add solid background (active state)
        cardBtn.classList.remove('btn-light'); // Remove solid background
        cardBtn.classList.add('btn-outline-light'); // Add outline style (inactive state)
        
        // Render table view with current data
        renderTableView();
    } else {
        // Switch to card view: hide table, show cards
        tableContainer.style.display = 'none'; // Hide table container
        cardsContainer.style.display = 'block'; // Make cards visible
        
        // Update button visual states (opposite of table view)
        cardBtn.classList.remove('btn-outline-light'); // Remove outline style
        cardBtn.classList.add('btn-light'); // Add solid background (active state)
        tableBtn.classList.remove('btn-light'); // Remove solid background
        tableBtn.classList.add('btn-outline-light'); // Add outline style (inactive state)
        
        // Render card view with current data
        renderCardView();
    }
}

// ==================== TABLE VIEW RENDERING ====================
// Render history data in tabular format with sorting and translation support
function renderTableView() {
    const historyTableContent = document.getElementById('history-table-content');
    
    // Get current language and translations for dynamic content
    // This ensures all table content is properly translated
    const currentLanguage = localStorage.getItem('websiteLanguage') || 'en';
    const trans = translations && translations[currentLanguage] ? translations[currentLanguage] : {};
    
    // Handle empty history state with translated messages
    if (!historyData || Object.keys(historyData).length === 0) {
        historyTableContent.innerHTML = `
            <div class="text-center py-5">
                <!-- Large icon for visual emphasis on empty state -->
                <i class="fas fa-history text-muted" style="font-size: 4rem; opacity: 0.3;"></i>
                <!-- Main empty state message with translation -->
                <h5 class="mt-3 text-muted">${trans['history-no-history'] || 'No History Yet'}</h5>
                <!-- Instructional text to guide user actions -->
                <p class="text-muted">${trans['history-start-viewing'] || 'Start viewing or downloading records to see your activity here!'}</p>
                <!-- Action category indicators with icons and translations -->
                <div class="mt-4">
                    <i class="fas fa-eye text-info me-3"></i>
                    <span class="text-muted me-4">${trans['history-view-actions'] || 'View actions'}</span>
                    <i class="fas fa-download text-success me-3"></i>
                    <span class="text-muted me-4">${trans['history-download-actions'] || 'Download actions'}</span>
                    <i class="fas fa-info-circle text-warning me-3"></i>
                    <span class="text-muted">${trans['history-details-actions'] || 'Show details actions'}</span>
                </div>
            </div>
        `;
        return; // Exit early if no data to display
    }
    
    // Build the table HTML structure with embedded CSS for styling
    // Using template literals for clean, maintainable HTML generation
    let historyHTML = `
        <style>
            /* Custom CSS for enhanced table appearance and responsiveness */
            .history-table {
                border-radius: 10px; /* Rounded corners for modern look */
                overflow: hidden; /* Ensure rounded corners work properly */
                box-shadow: 0 4px 15px rgba(0,0,0,0.1); /* Subtle shadow for depth */
            }
            .history-table thead th {
                background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%); /* Gradient header background */
                color: white; /* White text for contrast */
                border: none; /* Remove default borders */
                font-weight: 600; /* Semi-bold text */
                text-transform: uppercase; /* Uppercase headers for emphasis */
                letter-spacing: 1px; /* Spaced letters for readability */
                padding: 15px; /* Generous padding for touch targets */
            }
            .history-table tbody tr {
                transition: all 0.3s ease; /* Smooth hover animations */
                background: white; /* Default white background */
            }
            .history-table tbody tr:nth-child(even) {
                background: #f8f9fa; /* Alternating row colors for readability */
            }
            .history-table tbody tr:nth-child(odd) {
                background: white; /* Odd rows remain white */
            }
            .history-table tbody tr:hover {
                background: linear-gradient(45deg, #f8f9ff 0%, #e8f4fd 100%) !important; /* Hover effect with gradient */
                transform: translateY(-2px); /* Subtle lift on hover */
                box-shadow: 0 5px 15px rgba(0,0,0,0.1); /* Enhanced shadow on hover */
            }
            .history-table tbody td {
                padding: 15px; /* Consistent padding */
                border: none; /* Clean appearance without borders */
                vertical-align: middle; /* Center content vertically */
            }
            .action-badge {
                padding: 8px 16px; /* Balanced padding for badges */
                border-radius: 20px; /* Pill-shaped badges */
                font-weight: 600; /* Bold text for badges */
                letter-spacing: 0.5px; /* Spaced letters for emphasis */
            }
            .record-name {
                font-weight: 600; /* Bold record names */
                color: #2c3e50; /* Dark blue-gray color */
            }
            .timestamp-text {
                color: #7f8c8d; /* Muted color for timestamps */
                font-size: 0.9em; /* Slightly smaller font */
            }
        </style>
        <div class="table-responsive"> <!-- Bootstrap responsive wrapper -->
            <table class="table history-table">
                <thead>
                    <tr>
                        <!-- Table headers with icons and translated text -->
                        <th><i class="fas fa-file-alt me-2"></i>${trans['history-record-name'] || 'Record Name'}</th>
                        <th><i class="fas fa-bolt me-2"></i>${trans['history-all-actions'] || 'All Actions'}</th>
                        <th><i class="fas fa-star me-2"></i>${trans['history-last-action'] || 'Last Action'}</th>
                        <th><i class="fas fa-clock me-2"></i>${trans['history-timestamp'] || 'Timestamp'}</th>
                    </tr>
                </thead>
                <tbody>`;

    // Process and sort history data for display
    // Create an array of records with their latest action dates for chronological sorting
    const recordsArray = Object.keys(historyData).map(recordId => {
        const record = historyData[recordId]; // Get record data
        
        // Find the most recent action overall for sorting purposes
        // This ensures records with recent activity appear first
        let latestDate = null;
        ['view', 'download', 'show_details'].forEach(actionType => {
            if (record[actionType]) { // Check if this action exists
                const actionDate = new Date(record[actionType].actionDate);
                if (!latestDate || actionDate > latestDate) {
                    latestDate = actionDate; // Update latest date if this action is more recent
                }
            }
        });
        
        return {
            recordId: recordId,
            record: record,
            latestDate: latestDate // Store for sorting
        };
    });
    
    // Sort records by latest action date (most recent first)
    // This provides chronological order with newest activity at the top
    recordsArray.sort((a, b) => {
        if (!a.latestDate && !b.latestDate) return 0; // Both have no dates - equal
        if (!a.latestDate) return 1; // A has no date - goes to bottom
        if (!b.latestDate) return -1; // B has no date - A goes to top
        return new Date(b.latestDate) - new Date(a.latestDate); // Sort by date descending
    });
    
    // Now loop through the sorted records
    recordsArray.forEach(item => {
        const recordId = item.recordId;
        const record = item.record;
        // Use Arabic name if language is Arabic, otherwise use English name
        const recordName = (currentLanguage === 'ar' && record.regulationNameAr) 
            ? record.regulationNameAr 
            : (record.recordName || 'Unknown Record');
        
        // Find the most recent action overall for timestamp display
        let latestDate = null;
        ['view', 'download', 'show_details'].forEach(actionType => {
            if (record[actionType]) {
                const actionDate = new Date(record[actionType].actionDate);
                if (!latestDate || actionDate > latestDate) {
                    latestDate = actionDate;
                }
            }
        });
        
        const latestTimestamp = latestDate ? latestDate.toLocaleString('en-US') : '';
        
        // Find the most recent action for the "Last Action" column
        let lastActionInfo = null;
        ['view', 'download', 'show_details'].forEach(actionType => {
            if (record[actionType]) {
                const actionDate = new Date(record[actionType].actionDate);
                if (!lastActionInfo || actionDate > new Date(lastActionInfo.actionDate)) {
                    lastActionInfo = record[actionType];
                }
            }
        });
        
        // Generate last action badge
        let lastActionBadge = '';
        if (lastActionInfo) {
            let actionName, actionIcon, actionStyle;
            
            switch(lastActionInfo.action.toLowerCase()) {
                case 'view':
                    actionName = trans['history-view'] || 'View';
                    actionIcon = 'fas fa-eye';
                    actionStyle = 'background-color: #0dcaf0; color: white;';
                    break;
                case 'download':
                    actionName = trans['history-download'] || 'Download';
                    actionIcon = 'fas fa-download';
                    actionStyle = 'background-color: #198754; color: white;';
                    break;
                case 'show_details':
                    actionName = trans['history-show-details'] || 'Show Details';
                    actionIcon = 'fas fa-info-circle';
                    actionStyle = 'background-color: #ffc107; color: #212529;';
                    break;
                default:
                    actionName = lastActionInfo.action;
                    actionIcon = 'fas fa-question-circle';
                    actionStyle = 'background-color: #6c757d; color: white;';
            }
            
            lastActionBadge = `
                <span class="action-badge d-inline-block" style="padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; ${actionStyle}">
                    <i class="${actionIcon} me-1"></i>${actionName}
                </span>
            `;
        } else {
            lastActionBadge = `<span class="text-muted">${trans['history-no-actions'] || 'No actions yet'}</span>`;
        }
        
        // Generate action badges for all three action types with translated labels
        // This creates a visual representation of user actions with status indicators
        const actionTypes = [
            { key: 'view', name: trans['history-view'] || 'View', icon: 'fas fa-eye', style: 'background-color: #0dcaf0; color: white;' }, // Blue for view actions
            { key: 'download', name: trans['history-download'] || 'Download', icon: 'fas fa-download', style: 'background-color: #198754; color: white;' }, // Green for downloads
            { key: 'show_details', name: trans['history-show-details'] || 'Show Details', icon: 'fas fa-info-circle', style: 'background-color: #ffc107; color: #212529;' } // Yellow for details
        ];
        
        let actionBadgesHTML = '';
        actionTypes.forEach(actionType => {
            if (record[actionType.key]) {
                // Action was performed - show with timestamp and full opacity
                const actionTimestamp = new Date(record[actionType.key].actionDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                actionBadgesHTML += `
                    <span class="action-badge me-2 mb-1 d-inline-block" style="padding: 6px 12px; border-radius: 15px; font-size: 0.75rem; font-weight: 600; ${actionType.style}">
                        <i class="${actionType.icon} me-1"></i>${actionType.name}
                        <small class="d-block" style="font-size: 0.65rem; opacity: 0.8;">${actionTimestamp}</small>
                    </span>
                `;
            } else {
                // Action not performed - show with reduced opacity and "not performed" text
                actionBadgesHTML += `
                    <span class="action-badge me-2 mb-1 d-inline-block" style="padding: 6px 12px; border-radius: 15px; font-size: 0.75rem; font-weight: 600; ${actionType.style} opacity: 0.4;">
                        <i class="${actionType.icon} me-1"></i>${actionType.name}
                        <small class="d-block" style="font-size: 0.65rem; opacity: 0.8;">${trans['history-not-performed'] || 'Not performed'}</small>
                    </span>
                `;
            }
        });
        
        historyHTML += `
            <tr>
                <td class="record-name">
                    <i class="fas fa-file-pdf text-danger me-2"></i>
                    ${recordName}
                </td>
                <td>
                    ${actionBadgesHTML}
                </td>
                <td>
                    ${lastActionBadge}
                </td>
                <td class="timestamp-text">
                    <i class="fas fa-calendar-alt me-2"></i>
                    ${latestTimestamp}
                </td>
            </tr>
        `;
    });

    historyHTML += '</tbody></table></div>';
    historyTableContent.innerHTML = historyHTML;
}

// Render card view
function renderCardView() {
    const historyCardsContent = document.getElementById('history-cards-content');
    
    // Get current language for dynamic content
    const currentLanguage = localStorage.getItem('websiteLanguage') || 'en';
    const trans = translations && translations[currentLanguage] ? translations[currentLanguage] : {};
    
    if (!historyData || Object.keys(historyData).length === 0) {
        historyCardsContent.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-history text-muted" style="font-size: 4rem; opacity: 0.3;"></i>
                <h5 class="mt-3 text-muted">${trans['history-no-history'] || 'No History Yet'}</h5>
                <p class="text-muted">${trans['history-start-viewing'] || 'Start viewing or downloading records to see your activity here!'}</p>
                <div class="mt-4">
                    <i class="fas fa-eye text-info me-3"></i>
                    <span class="text-muted me-4">${trans['history-view-actions'] || 'View actions'}</span>
                    <i class="fas fa-download text-success me-3"></i>
                    <span class="text-muted me-4">${trans['history-download-actions'] || 'Download actions'}</span>
                    <i class="fas fa-info-circle text-warning me-3"></i>
                    <span class="text-muted">${trans['history-details-actions'] || 'Show details actions'}</span>
                </div>
            </div>
        `;
        return;
    }
    
    let historyHTML = '<div class="row justify-content-center g-lg-4 g-md-3 g-sm-2 g-1">';

    // Add CSS to make action status sections scale with cards
    historyHTML += `
        <style>
            .action-status-section {
                transition: transform 0.3s ease;
                box-sizing: border-box !important;
            }
            
            .action-status-section .row {
                width: 100% !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            
            .action-status-section .col {
                padding-left: 5px !important;
                padding-right: 5px !important;
            }
            
            @media (max-width: 1024px) {
                .large-card .action-status-section {
                    transform: scale(1) !important;
                }
            }
            
            @media (min-width: 1024px) {
                .large-card .action-status-section {
                    transform: scale(1.1) !important;
                }
            }
            
            @media (min-width: 1300px) {
                .large-card .action-status-section {
                    transform: scale(1.23) !important;
                }
            }
            
            @media (min-width: 1600px) {
                .large-card .action-status-section {
                    transform: scale(1.3) !important;
                }
            }
        </style>
    `;

    // Loop through each record and its actions
    // First, create an array of records with their latest action dates for sorting
    const recordsArray = Object.keys(historyData).map(recordId => {
        const record = historyData[recordId];
        
        // Find the most recent action overall for sorting
        let latestDate = null;
        ['view', 'download', 'show_details'].forEach(actionType => {
            if (record[actionType]) {
                const actionDate = new Date(record[actionType].actionDate);
                if (!latestDate || actionDate > latestDate) {
                    latestDate = actionDate;
                }
            }
        });
        
        return {
            recordId: recordId,
            record: record,
            latestDate: latestDate
        };
    });
    
    // Sort records by latest action date (most recent first)
    recordsArray.sort((a, b) => {
        if (!a.latestDate && !b.latestDate) return 0;
        if (!a.latestDate) return 1;
        if (!b.latestDate) return -1;
        return new Date(b.latestDate) - new Date(a.latestDate);
    });
    
    // Now loop through the sorted records
    recordsArray.forEach(item => {
        const recordId = item.recordId;
        const record = item.record;
        // Use Arabic name if language is Arabic, otherwise use English name
        const recordName = (currentLanguage === 'ar' && record.regulationNameAr) 
            ? record.regulationNameAr 
            : (record.recordName || 'Unknown Record');
        
        // Find the most recent action overall for timestamp display
        let latestDate = null;
        ['view', 'download', 'show_details'].forEach(actionType => {
            if (record[actionType]) {
                const actionDate = new Date(record[actionType].actionDate);
                if (!latestDate || actionDate > latestDate) {
                    latestDate = actionDate;
                }
            }
        });
        
        const latestTimestamp = latestDate ? latestDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : '';
        
        // Generate badges for the three action types
        let actionBadgesHTML = '';
        
        // Always show these three action types in order with translations
        const actionTypes = [
            { key: 'view', name: trans['history-view'] || 'Viewed', icon: 'fas fa-eye', class: 'text-white', style: 'background-color: #0dcaf0;' }, // bg-info color
            { key: 'download', name: trans['history-download'] || 'Downloaded', icon: 'fas fa-download', class: 'text-white', style: 'background-color: #198754;' }, // bg-success color
            { key: 'show_details', name: trans['history-show-details'] || 'Show Details', icon: 'fas fa-info-circle', class: 'text-dark', style: 'background-color: #ffc107;' } // bg-warning color
        ];
        
        actionTypes.forEach(actionType => {
            if (record[actionType.key]) {
                const actionTimestamp = new Date(record[actionType.key].actionDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                actionBadgesHTML += `
                    <div class="col text-center">
                        <div class="badge ${actionType.class} rounded-pill px-3 py-2 mb-2" style="font-size: 0.7rem; font-weight: 600; width: 100%; ${actionType.style}">
                            <i class="${actionType.icon} me-1"></i>${actionType.name}
                        </div>
                        <div class="text-muted" style="font-size: 0.6rem; font-weight: 500;">
                            ${actionTimestamp}
                        </div>
                    </div>
                `;
            } else {
                // Show placeholder for actions that haven't been performed
                actionBadgesHTML += `
                    <div class="col text-center">
                        <div class="badge rounded-pill px-3 py-2 mb-2" style="font-size: 0.7rem; font-weight: 600; width: 100%; ${actionType.style} opacity: 0.5;">
                            <i class="${actionType.icon} me-1"></i>${actionType.name}
                        </div>
                        <div class="text-muted" style="font-size: 0.6rem; font-weight: 500;">
                            ${trans['history-not-performed'] || 'Not performed'}
                        </div>
                    </div>
                `;
            }
        });
        
        historyHTML += `
            <div class="col-auto medium-card large-card" style="display: flex; flex-direction: column; align-items: center;">
                <div class="card document-card" data-title="${recordName}" data-department="History" data-section="" data-type="History Record" data-version-date="${latestTimestamp}">
                    <div class="bookmark-wrapper">
                        <div class="bookmark" data-record-id="${recordId}" onclick="toggleBookmark(this)" style="background: rgba(255, 255, 255, 0.9);">
                        </div>
                    </div>
                    <div class="document-icon" onclick="ViewPdf(${recordId})" title="Click to preview PDF">
                        <div class="pdf-thumbnail-container">
                            <div class="thumbnail-loading" id="loading-${recordId}" style="display: none;">
                                <div class="spinner"></div>
                                <span>Loading...</span>
                            </div>
                            <img class="pdf-thumbnail" id="thumbnail-${recordId}" data-record-id="${recordId}" style="display: block; opacity: 1;" alt="PDF Thumbnail" src="/api/pdf/thumbnail?recordId=${recordId}">
                        </div>
                    </div>
                    <h2 class="card-title">${recordName}</h2>

                    <div class="info-footer">
                        <div class="action-buttons">
                            <button class="action-btn" onclick="DownloadPdf(${recordId})" title="Download">
                                <i class="fas fa-download">
                                    <img src="/svgs/cards/download-icon.svg" alt="Download" width="31" height="34">
                                </i>
                            </button>
                            <button class="action-btn" onclick="showRecordDetailsModal(${recordId})" title="Information">
                                <i class="fas fa-info">
                                    <img src="/svgs/cards/info-icon.svg" alt="Information" class="info-icon" width="31" height="33">
                                </i>
                            </button>
                            <button class="action-btn" onclick="ViewPdf(${recordId})" title="Read">
                                <img src="/svgs/cards/book-icon.svg" alt="Book" width="32" height="34">
                            </button>
                            <button class="action-btn" onclick="handleAction('chat')" id="card-chat-icon" title="Chat">
                                <i class="fas fa-comments">
                                    <img src="/svgs/cards/chat-icon.svg" alt="Chat" width="32" height="34">
                                </i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- History badges section outside and below the card -->
                <div class="mt-3 mb-5" style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e9ecef; flex-shrink: 0; width: 300px; max-width: 300px; min-width: 300px; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);">
                    <h6 class="text-muted mb-3 text-center" style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-list-check me-2"></i>${trans['history-action-status'] || 'Action Status'}
                    </h6>
                    <div class="row g-2">
                        ${actionBadgesHTML}
                    </div>
                </div>
            </div>
        `;
    });

    historyHTML += '</div>';
    historyCardsContent.innerHTML = historyHTML;
}

function showMainRecords() {
    const historyContainer = document.getElementById('history-container');
    if (historyContainer) {
        historyContainer.remove();
    }
    
    const recordsContainer = document.querySelector('.row.justify-content-center.g-lg-4.g-md-3.g-sm-2.g-1');
    if (recordsContainer) {
        recordsContainer.style.display = '';
        recordsContainer.style.visibility = 'visible';
    }
}

// ==================== TRANSLATION UPDATE FUNCTIONALITY ====================
// Function to update all translatable elements on the history page
// This function is called when language changes to update UI without page reload
function updateHistoryTranslations() {
    // Get current language setting and translation object
    const currentLanguage = localStorage.getItem('websiteLanguage') || 'en';
    const trans = translations && translations[currentLanguage] ? translations[currentLanguage] : {};
    
    // Update main page header title
    const titleSpan = document.querySelector('#history-container .fw-bold');
    if (titleSpan) {
        titleSpan.textContent = trans['history-activity-title'] || 'Your Activity History';
    }
    
    // Update header description/subtitle
    const descP = document.querySelector('#history-container .opacity-75');
    if (descP) {
        descP.innerHTML = `<i class="fas fa-info-circle me-2"></i>${trans['history-track-activity'] || 'Track your recent views and downloads'}`;
    }
    
    // Update view toggle button texts
    const tableBtn = document.getElementById('table-view-btn');
    if (tableBtn) {
        tableBtn.innerHTML = `<i class="fas fa-table me-1"></i>${trans['history-table-btn'] || 'Table'}`;
    }
    
    const cardBtn = document.getElementById('card-view-btn');
    if (cardBtn) {
        cardBtn.innerHTML = `<i class="fas fa-th-large me-1"></i>${trans['history-cards-btn'] || 'Cards'}`;
    }
    
    // Update table column headers if table view is currently visible
    const tableHeaders = document.querySelectorAll('#history-container .history-table thead th');
    if (tableHeaders.length >= 4) {
        tableHeaders[0].innerHTML = `<i class="fas fa-file-alt me-2"></i>${trans['history-record-name'] || 'Record Name'}`;
        tableHeaders[1].innerHTML = `<i class="fas fa-bolt me-2"></i>${trans['history-all-actions'] || 'All Actions'}`;
        tableHeaders[2].innerHTML = `<i class="fas fa-star me-2"></i>${trans['history-last-action'] || 'Last Action'}`;
        tableHeaders[3].innerHTML = `<i class="fas fa-clock me-2"></i>${trans['history-timestamp'] || 'Timestamp'}`;
    }
    
    // Update loading indicators if they exist
    const loadingSpan = document.querySelector('#history-container .visually-hidden');
    if (loadingSpan) {
        loadingSpan.textContent = trans['history-loading'] || 'Loading...';
    }
    
    // Update loading text if visible
    const loadingP = document.querySelector('#history-container .mt-3.text-muted');
    if (loadingP && loadingP.textContent.includes('Loading')) {
        loadingP.innerHTML = `<i class="fas fa-clock me-2"></i>${trans['history-loading-text'] || 'Loading your history...'}`;
    }
}

// ==================== LANGUAGE CHANGE EVENT LISTENER ====================
// Listen for global language change events and update history page accordingly
// This enables real-time translation without requiring page refresh
document.addEventListener('languageChanged', function(event) {
    // Check if history page is currently displayed before applying updates
    // This prevents unnecessary processing when history page is not active
    const historyContainer = document.getElementById('history-container');
    if (historyContainer) {
        // Apply translation updates to all static elements
        updateHistoryTranslations();
        
        // Re-render the current view with new translations
        // This updates dynamic content like action badges and status messages
        const tableContainer = document.getElementById('table-container');
        const cardsContainer = document.getElementById('cards-container');
        
        if (tableContainer && tableContainer.style.display !== 'none') {
            renderTableView(); // Re-render table view with new language
        } else if (cardsContainer && cardsContainer.style.display !== 'none') {
            renderCardView(); // Re-render card view with new language
        }
    }
});
