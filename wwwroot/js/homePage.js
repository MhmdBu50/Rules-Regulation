

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
                <div class="card shadow-lg border-0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px;">
                    <div class="card-header bg-transparent border-0 text-white py-4">
                        <h3 class="card-title mb-0 text-center">
                            <i class="fas fa-history me-3"></i>
                            <span class="fw-bold">Your Activity History</span>
                        </h3>
                        <p class="card-subtitle mb-0 mt-2 opacity-75 text-center">
                            <i class="fas fa-info-circle me-2"></i>Track your recent views and downloads
                        </p>
                    </div>
                    <div class="card-body p-4" style="background: rgba(255,255,255,0.95); border-radius: 0 0 15px 15px;">
                        <div id="history-content">
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

            const historyContent = document.getElementById('history-content');
            
            if (!data || data.length === 0) {
                historyContent.innerHTML = `
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

            data.forEach(item => {

                let action, actionIcon, badgeClass;
                
                switch(item.action.toLowerCase()) {
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
                        action = item.action;
                        actionIcon = 'fas fa-question-circle';
                        badgeClass = 'bg-secondary text-white';
                }
                
                const timestamp = new Date(item.actionDate).toLocaleString('en-US');
                const recordName = item.recordName || 'Unknown Record';
                
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
                        </td>
                        <td class="timestamp-text">
                            <i class="fas fa-calendar-alt me-2"></i>
                            ${timestamp}
                        </td>
                    </tr>
                `;
            });

            historyHTML += '</tbody></table></div>';
            historyContent.innerHTML = historyHTML;

        })
        .catch(error => {

            const historyContent = document.getElementById('history-content');
            if (historyContent) {
                historyContent.innerHTML = '<div class="alert alert-danger">Error loading history</div>';
            }
        });
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
