/**
 * Activity Log JavaScript Functions
 * Handles modal interactions and data visualization for the Activity Log page
 */

// View activity details in modal
function viewDetails(logId) {
    // Validate logId before proceeding
    if (!logId || logId === 'undefined' || logId === 'null' || isNaN(logId)) {
        alert('Invalid Log ID provided: ' + logId);
        return;
    }
    
    // Debug: Show the LogId being passed
    console.log('DEBUG: viewDetails called with LogId:', logId, 'Type:', typeof logId);
    
    const modal = new bootstrap.Modal(document.getElementById('activityDetailsModal'));
    const content = document.getElementById('activityDetailsContent');
    
    // Show loading state
    content.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-2">Loading activity details...</div>
        </div>
    `;
    
    modal.show();
    
    // Fetch details from server
    const url = `/Admin/GetActivityLogDetails/${logId}`;
    
    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Activity log entry with ID ${logId} not found in database.`);
            }
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data && typeof data === 'object') {
            // Build the modal content according to specifications
            let html = `
                <div class="container-fluid">
                    <!-- Activity Information (Left) & User Information (Right) Row -->
                    <div class="row mb-4">
                        <!-- Activity Information - Left Column -->
                        <div class="col-md-6">
                            <h6 class="text-primary mb-3 fw-bold">
                                <span class="bi bi-activity me-2"></span>Activity Information
                            </h6>
                            <div class="card border-0 shadow-sm">
                                <div class="card-body bg-light">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-secondary">Log ID:</label>
                                        <div class="form-control-plaintext fw-semibold">${data.logId}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-secondary">Timestamp:</label>
                                        <div class="form-control-plaintext">${new Date(data.actionTimestamp).toLocaleString('en-US', { 
                                            year: 'numeric', month: '2-digit', day: '2-digit',
                                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                                            timeZoneName: 'short'
                                        })}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-secondary">Action Type:</label>
                                        <div class="form-control-plaintext">
                                            <span class="badge fs-6 ${getActionBadgeStyle(data.actionType)}">${data.actionType.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div class="mb-0">
                                        <label class="form-label fw-bold text-secondary">Entity Type:</label>
                                        <div class="form-control-plaintext">
                                            <span class="badge fs-6 ${getEntityBadgeStyle(data.entityType)}">${data.entityType}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- User Information - Right Column -->
                        <div class="col-md-6">
                            <h6 class="text-primary mb-3 fw-bold">
                                <span class="bi bi-person-circle me-2"></span>User Information
                            </h6>
                            <div class="card border-0 shadow-sm">
                                <div class="card-body bg-light">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-secondary">User ID:</label>
                                        <div class="form-control-plaintext fw-semibold">${data.userId}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-secondary">User Name:</label>
                                        <div class="form-control-plaintext">${data.userName || 'N/A'}</div>
                                    </div>
                                    <div class="mb-0">
                                        <label class="form-label fw-bold text-secondary">User Role:</label>
                                        <div class="form-control-plaintext">
                                            <span class="badge fs-6 ${getRoleBadgeStyle(data.userRole)}">${data.userRole.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Entity Information - Full Width Row -->
                    <div class="row mb-4">
                        <div class="col-12">
                            <h6 class="text-primary mb-3 fw-bold">
                                <span class="bi bi-database me-2"></span>Entity Information
                            </h6>
                            <div class="card border-0 shadow-sm">
                                <div class="card-body bg-light">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label fw-bold text-secondary">Entity ID:</label>
                                                <div class="form-control-plaintext fw-semibold">${data.entityId || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div class="col-md-8">
                                            <div class="mb-3">
                                                <label class="form-label fw-bold text-secondary">Entity Name:</label>
                                                <div class="form-control-plaintext">${data.entityName || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    ${data.details ? `
                                        <div class="mb-0">
                                            <label class="form-label fw-bold text-secondary">Details:</label>
                                            <div class="form-control-plaintext">${data.details}</div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Data Changes - Full Width Row -->
                    <div class="row mb-0">
                        <div class="col-12">
                            <h6 class="text-primary mb-3 fw-bold">
                                <span class="bi bi-code-square me-2"></span>Data Changes
                            </h6>
                            ${getDataChangesContent(data.actionType, data.beforeData, data.afterData)}
                        </div>
                    </div>
                </div>
            `;
            
            content.innerHTML = html;
        } else {
            content.innerHTML = `
                <div class="alert alert-warning">
                    <span class="bi bi-exclamation-triangle me-2"></span>
                    Activity details not found or could not be loaded.
                </div>
            `;
        }
    })
    .catch(error => {
        content.innerHTML = `
            <div class="alert alert-danger">
                <span class="bi bi-exclamation-triangle me-2"></span>
                Error loading activity details: ${error.message}
                <br><small class="text-muted">LogId: ${logId}</small>
            </div>
        `;
    });
}

// Helper function to generate data changes content based on action type
function getDataChangesContent(actionType, beforeData, afterData) {
    const actionUpper = actionType.toUpperCase();
    
    if (actionType === 'Add' && afterData) {
        return `
            <div class="card border-success">
                <div class="card-header bg-success bg-opacity-10 border-success">
                    <h6 class="card-title mb-0 text-success">
                        <span class="bi bi-plus-circle me-2"></span>Added Data
                    </h6>
                </div>
                <div class="card-body">
                    <pre class="json-content bg-light p-3 rounded">${formatJson(afterData)}</pre>
                </div>
            </div>
        `;
    } else if (actionType === 'Delete' && beforeData) {
        return `
            <div class="card border-danger">
                <div class="card-header bg-danger bg-opacity-10 border-danger">
                    <h6 class="card-title mb-0 text-danger">
                        <span class="bi bi-trash me-2"></span>Deleted Data
                    </h6>
                </div>
                <div class="card-body">
                    <pre class="json-content bg-light p-3 rounded">${formatJson(beforeData)}</pre>
                </div>
            </div>
        `;
    } else if (actionType === 'Edit' && (beforeData || afterData)) {
        return `
            <div class="row">
                ${beforeData ? `
                    <div class="col-md-6 mb-3">
                        <div class="card border-warning">
                            <div class="card-header bg-warning bg-opacity-10 border-warning">
                                <h6 class="card-title mb-0 text-warning">
                                    <span class="bi bi-arrow-left-circle me-2"></span>Before Changes
                                </h6>
                            </div>
                            <div class="card-body">
                                <pre class="json-content bg-light p-3 rounded">${formatJson(beforeData)}</pre>
                            </div>
                        </div>
                    </div>
                ` : ''}
                ${afterData ? `
                    <div class="col-md-6 mb-3">
                        <div class="card border-info">
                            <div class="card-header bg-info bg-opacity-10 border-info">
                                <h6 class="card-title mb-0 text-info">
                                    <span class="bi bi-arrow-right-circle me-2"></span>After Changes
                                </h6>
                            </div>
                            <div class="card-body">
                                <pre class="json-content bg-light p-3 rounded">${formatJson(afterData)}</pre>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        return `
            <div class="card border-secondary">
                <div class="card-body text-center text-muted py-4">
                    <span class="bi bi-info-circle fs-4 mb-2"></span>
                    <p class="mb-0">No detailed change information available for this activity.</p>
                </div>
            </div>
        `;
    }
}

// Helper function to format JSON with proper indentation and syntax highlighting
function formatJson(jsonString) {
    if (!jsonString) return 'No data available';
    
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        // If it's not valid JSON, return as-is with proper escaping
        return jsonString.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

// Helper functions for badge styling
function getActionBadgeStyle(actionType) {
    switch(actionType) {
        case 'Add': return 'bg-success text-white px-3 py-2';
        case 'Edit': return 'bg-warning text-white px-3 py-2';  
        case 'Delete': return 'bg-danger text-white px-3 py-2';
        default: return 'bg-secondary text-white px-3 py-2';
    }
}

function getEntityBadgeStyle(entityType) {
    switch(entityType) {
        case 'Record': return 'bg-primary text-white px-3 py-2';
        case 'Contact': return 'bg-info text-white px-3 py-2';
        default: return 'bg-secondary text-white px-3 py-2';
    }
}

function getRoleBadgeStyle(userRole) {
    switch(userRole) {
        case 'Admin': return 'bg-danger text-white px-3 py-2';
        case 'Editor': return 'bg-success text-white px-3 py-2';
        default: return 'bg-secondary text-white px-3 py-2';
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips if Bootstrap 5 is loaded
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});
