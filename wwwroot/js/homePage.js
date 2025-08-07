

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

// ==================== History Functionality ====================

function navigateToHistory() {

    
    const recordsContainer = document.querySelector('.row.justify-content-center.g-lg-4.g-md-3.g-sm-2.g-1');
    if (recordsContainer) {
        recordsContainer.style.display = 'none';

    }
    
    const existingHistory = document.getElementById('history-container');
    if (existingHistory) {
        existingHistory.remove();

    }
    
    const historyContainer = document.createElement('div');
    historyContainer.id = 'history-container';
    historyContainer.className = 'container-fluid';
    historyContainer.style.marginTop = '40px'; // Position 40px below navigation bar
    
    historyContainer.innerHTML = `
        <div class="row justify-content-center g-lg-4 g-md-3 g-sm-2 g-1" style="margin: 0px 40px;">
            <div class="col-12">
                <!-- Header with title and toggle buttons outside table -->
                <div class="d-flex justify-content-between align-items-center mb-4" style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
                    <div>
                        <h3 class="mb-0">
                            <i class="fas fa-history me-3"></i>
                            <span class="fw-bold">Your Activity History</span>
                        </h3>
                        <p class="mb-0 mt-2 opacity-75">
                            <i class="fas fa-info-circle me-2"></i>Track your recent views and downloads
                        </p>
                    </div>
                    <div class="view-toggle">
                        <div class="btn-group" role="group" aria-label="View toggle">
                            <button type="button" class="btn btn-outline-light btn-sm" id="table-view-btn" onclick="toggleHistoryView('table')">
                                <i class="fas fa-table me-1"></i>Table
                            </button>
                            <button type="button" class="btn btn-outline-light btn-sm" id="card-view-btn" onclick="toggleHistoryView('card')">
                                <i class="fas fa-th-large me-1"></i>Cards
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Table container -->
                <div id="table-container" class="card shadow-lg border-0" style="border-radius: 15px; display: block;">
                    <div class="card-body p-4" style="background: rgba(255,255,255,0.95); border-radius: 15px;">
                        <div id="history-table-content">
                            <div class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-3 text-muted">
                                    <i class="fas fa-clock me-2"></i>Loading your history...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cards container -->
                <div id="cards-container" style="display: none;">
                    <div id="history-cards-content">
                        <!-- Cards will be rendered here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert after the navigation bar and before the main content
    const navigationBar = document.querySelector('.navigation-bar.d-none.d-lg-flex');
    
    if (navigationBar) {
        // Insert the history container right after the navigation bar
        navigationBar.insertAdjacentElement('afterend', historyContainer);

    } else {
        // Fallback: insert before main content
        const containerFluid = document.querySelector('.container-fluid');
        if (containerFluid) {
            containerFluid.parentNode.insertBefore(historyContainer, containerFluid);

        } else {
            document.body.appendChild(historyContainer);

        }
    }
    

    fetch('/History/GetUserHistory')
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Group actions by record and keep latest action for each action type
            const recordActions = {};
            
            if (data && data.length > 0) {
                data.forEach(item => {
                    const recordId = item.recordId;
                    const actionType = item.action.toLowerCase();
                    
                    if (!recordActions[recordId]) {
                        recordActions[recordId] = {
                            recordName: item.recordName,
                            view: null,
                            download: null,
                            show_details: null
                        };
                    }
                    
                    // Keep only the most recent action for each action type
                    if (!recordActions[recordId][actionType] || 
                        new Date(item.actionDate) > new Date(recordActions[recordId][actionType].actionDate)) {
                        recordActions[recordId][actionType] = item;
                    }
                });
            }
            
            // Store globally for view switching
            historyData = recordActions;
            
            // Set default active button state
            const tableBtn = document.getElementById('table-view-btn');
            const cardBtn = document.getElementById('card-view-btn');
            
            if (tableBtn && cardBtn) {
                tableBtn.classList.remove('btn-outline-light');
                tableBtn.classList.add('btn-light');
                cardBtn.classList.remove('btn-light');
                cardBtn.classList.add('btn-outline-light');
            }
            
            // Render default table view
            renderTableView();
        })
        .catch(error => {

            const historyTableContent = document.getElementById('history-table-content');
            if (historyTableContent) {
                historyTableContent.innerHTML = '<div class="alert alert-danger">Error loading history</div>';
            }
        });
}

// Global variable to store history data
let historyData = [];
let currentView = 'table'; // Default view

// Toggle between table and card views
function toggleHistoryView(viewType) {
    currentView = viewType;
    
    // Update button states
    const tableBtn = document.getElementById('table-view-btn');
    const cardBtn = document.getElementById('card-view-btn');
    
    // Get containers
    const tableContainer = document.getElementById('table-container');
    const cardsContainer = document.getElementById('cards-container');
    
    if (viewType === 'table') {
        // Show table, hide cards
        tableContainer.style.display = 'block';
        cardsContainer.style.display = 'none';
        
        // Update button states
        tableBtn.classList.remove('btn-outline-light');
        tableBtn.classList.add('btn-light');
        cardBtn.classList.remove('btn-light');
        cardBtn.classList.add('btn-outline-light');
        
        renderTableView();
    } else {
        // Hide table, show cards
        tableContainer.style.display = 'none';
        cardsContainer.style.display = 'block';
        
        // Update button states
        cardBtn.classList.remove('btn-outline-light');
        cardBtn.classList.add('btn-light');
        tableBtn.classList.remove('btn-light');
        tableBtn.classList.add('btn-outline-light');
        
        renderCardView();
    }
}

// Render table view
function renderTableView() {
    const historyTableContent = document.getElementById('history-table-content');
    
    if (!historyData || Object.keys(historyData).length === 0) {
        historyTableContent.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-history text-muted" style="font-size: 4rem; opacity: 0.3;"></i>
                <h5 class="mt-3 text-muted">No History Yet</h5>
                <p class="text-muted">Start viewing or downloading records to see your activity here!</p>
                <div class="mt-4">
                    <i class="fas fa-eye text-info me-3"></i>
                    <span class="text-muted me-4">View actions</span>
                    <i class="fas fa-download text-success me-3"></i>
                    <span class="text-muted me-4">Download actions</span>
                    <i class="fas fa-info-circle text-warning me-3"></i>
                    <span class="text-muted">Show details actions</span>
                </div>
            </div>
        `;
        return;
    }
    
    let historyHTML = `
        <style>
            .history-table {
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .history-table thead th {
                background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                border: none;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 15px;
            }
            .history-table tbody tr {
                transition: all 0.3s ease;
                background: white;
            }
            .history-table tbody tr:nth-child(even) {
                background: #f8f9fa;
            }
            .history-table tbody tr:nth-child(odd) {
                background: white;
            }
            .history-table tbody tr:hover {
                background: linear-gradient(45deg, #f8f9ff 0%, #e8f4fd 100%) !important;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .history-table tbody td {
                padding: 15px;
                border: none;
                vertical-align: middle;
            }
            .action-badge {
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .record-name {
                font-weight: 600;
                color: #2c3e50;
            }
            .timestamp-text {
                color: #7f8c8d;
                font-size: 0.9em;
            }
        </style>
        <div class="table-responsive">
            <table class="table history-table">
                <thead>
                    <tr>
                        <th><i class="fas fa-file-alt me-2"></i>Record Name</th>
                        <th><i class="fas fa-bolt me-2"></i>Action</th>
                        <th><i class="fas fa-clock me-2"></i>Timestamp</th>
                    </tr>
                </thead>
                <tbody>`;

    // Loop through each record and its actions
    Object.keys(historyData).forEach(recordId => {
        const record = historyData[recordId];
        const recordName = record.recordName || 'Unknown Record';
        
        // Find the most recent action overall for the main display
        let latestAction = null;
        let latestDate = null;
        
        ['view', 'download', 'show_details'].forEach(actionType => {
            if (record[actionType]) {
                const actionDate = new Date(record[actionType].actionDate);
                if (!latestDate || actionDate > latestDate) {
                    latestDate = actionDate;
                    latestAction = record[actionType];
                }
            }
        });
        
        if (latestAction) {
            let action, actionIcon, badgeClass;
            
            switch(latestAction.action.toLowerCase()) {
                case 'download':
                    action = 'Download';
                    actionIcon = 'fas fa-download';
                    badgeClass = 'bg-success text-white';
                    break;
                case 'view':
                    action = 'View';
                    actionIcon = 'fas fa-eye';
                    badgeClass = 'bg-info text-white';
                    break;
                case 'show_details':
                    action = 'Show details';
                    actionIcon = 'fas fa-info-circle';
                    badgeClass = 'bg-warning text-dark';
                    break;
                default:
                    action = latestAction.action;
                    actionIcon = 'fas fa-question-circle';
                    badgeClass = 'bg-secondary text-white';
            }
            
            const timestamp = new Date(latestAction.actionDate).toLocaleString('en-US');
            
            // Count how many action types exist for this record
            const actionCount = ['view', 'download', 'show_details'].filter(type => record[type]).length;
            
            historyHTML += `
                <tr>
                    <td class="record-name">
                        <i class="fas fa-file-pdf text-danger me-2"></i>
                        ${recordName}
                    </td>
                    <td>
                        <span class="action-badge ${badgeClass}">
                            <i class="${actionIcon} me-2"></i>${action}
                        </span>
                        ${actionCount > 1 ? `<small class="text-muted d-block mt-1">${actionCount} action types</small>` : ''}
                    </td>
                    <td class="timestamp-text">
                        <i class="fas fa-calendar-alt me-2"></i>
                        ${timestamp}
                    </td>
                </tr>
            `;
        }
    });

    historyHTML += '</tbody></table></div>';
    historyTableContent.innerHTML = historyHTML;
}

// Render card view
function renderCardView() {
    const historyCardsContent = document.getElementById('history-cards-content');
    
    if (!historyData || Object.keys(historyData).length === 0) {
        historyCardsContent.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-history text-muted" style="font-size: 4rem; opacity: 0.3;"></i>
                <h5 class="mt-3 text-muted">No History Yet</h5>
                <p class="text-muted">Start viewing or downloading records to see your activity here!</p>
                <div class="mt-4">
                    <i class="fas fa-eye text-info me-3"></i>
                    <span class="text-muted me-4">View actions</span>
                    <i class="fas fa-download text-success me-3"></i>
                    <span class="text-muted me-4">Download actions</span>
                    <i class="fas fa-info-circle text-warning me-3"></i>
                    <span class="text-muted">Show details actions</span>
                </div>
            </div>
        `;
        return;
    }
    
    let historyHTML = '<div class="row justify-content-center g-lg-4 g-md-3 g-sm-2 g-1">';

    // Loop through each record and its actions
    Object.keys(historyData).forEach(recordId => {
        const record = historyData[recordId];
        const recordName = record.recordName || 'Unknown Record';
        
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
        
        // Always show these three action types in order
        const actionTypes = [
            { key: 'view', name: 'Viewed', icon: 'fas fa-eye', class: 'text-white', style: 'background-color: #2c3e50;' },
            { key: 'download', name: 'Downloaded', icon: 'fas fa-download', class: 'text-white', style: 'background-color: #2c3e50;' },
            { key: 'show_details', name: 'Show Details', icon: 'fas fa-info-circle', class: 'text-white', style: 'background-color: #2c3e50;' }
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
                        <div class="badge rounded-pill px-3 py-2 mb-2" style="font-size: 0.7rem; font-weight: 600; width: 100%; background-color: #2c3e50 !important; color: white !important;">
                            <i class="${actionType.icon} me-1"></i>${actionType.name}
                        </div>
                        <div class="text-muted" style="font-size: 0.6rem; font-weight: 500;">
                            Not performed
                        </div>
                    </div>
                `;
            }
        });
        
        historyHTML += `
            <div class="col-3 medium-card" style="display: flex; flex-direction: column;">
                <div class="card document-card" data-title="${recordName}" data-department="History" data-section="" data-type="History Record" data-version-date="${latestTimestamp}" style="flex-grow: 1; width: 100%; height: 100%;">
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

                    <div class="info-footer" style="margin-top: auto;">
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
                <div class="history-badges mt-3" style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e9ecef; flex-shrink: 0; width: 100%;">
                    <h6 class="text-muted mb-3 text-center" style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-list-check me-2"></i>Action Status
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
