/**
 * Activity Log JavaScript - Complete Rewrite
 * Handles modal interactions and data visualization for the Activity Log page
 */

console.log('Activity Log JavaScript loaded successfully');

// Helper function to get current language
function getCurrentLanguage() {
    // Check body lang attribute first
    const bodyLang = document.body.getAttribute('lang');
    if (bodyLang === 'ar') return 'ar';
    if (bodyLang === 'en') return 'en';
    
    // Check body dir attribute
    const bodyDir = document.body.getAttribute('dir');
    if (bodyDir === 'rtl') return 'ar';
    if (bodyDir === 'ltr') return 'en';
    
    // Check body class
    if (document.body.classList.contains('rtl')) return 'ar';
    
    // Fallback to localStorage or default
    return localStorage.getItem("websiteLanguage") || "en";
}

// Helper function to get translated text
function getTranslatedText(key) {
    const currentLang = getCurrentLanguage();
    
    // Access the global translations object from languageSwitcher.js
    if (typeof window.translations !== 'undefined' && 
        window.translations[currentLang] && 
        window.translations[currentLang][key]) {
        return window.translations[currentLang][key];
    }
    
    // Fallback: check if translations object is available in another way
    if (typeof translations !== 'undefined' && 
        translations[currentLang] && 
        translations[currentLang][key]) {
        return translations[currentLang][key];
    }
    
    // Return the key if no translation found (for debugging)
    return key;
}

// Helper function to translate action types
function getTranslatedActionType(actionType) {
    if (!actionType) return '';
    
    const actionKey = `activityLog-action-${actionType.toLowerCase()}`;
    const translated = getTranslatedText(actionKey);
    
    // If no specific translation found, return the original uppercased
    if (translated === actionKey) {
        return safeString(actionType).toUpperCase();
    }
    
    return translated;
}

// Helper function to translate entity types
function getTranslatedEntityType(entityType) {
    if (!entityType) return '';
    
    const entityKey = `activityLog-entity-${entityType.toLowerCase()}`;
    const translated = getTranslatedText(entityKey);
    
    // If no specific translation found, return the original
    if (translated === entityKey) {
        return safeString(entityType);
    }
    
    return translated;
}

// Helper function to translate user roles
function getTranslatedUserRole(userRole) {
    if (!userRole) return '';
    
    const roleKey = `activityLog-role-${userRole.toLowerCase()}`;
    const translated = getTranslatedText(roleKey);
    
    // If no specific translation found, return the original uppercased
    if (translated === roleKey) {
        return safeString(userRole).toUpperCase();
    }
    
    return translated;
}

// Main function to view activity details
function viewDetails(logId) {
    console.log('=== ViewDetails Function Called ===');
    console.log('Raw LogId received:', logId);
    console.log('LogId type:', typeof logId);
    
    // Convert to number and validate
    const numericLogId = parseInt(logId);
    console.log('Numeric LogId:', numericLogId);
    
    // Strict validation
    if (!logId || isNaN(numericLogId) || numericLogId <= 0) {
        console.error('Invalid LogId:', logId);
        showError(`Invalid Log ID: "${logId}". Please refresh the page and try again.`);
        return;
    }
    
    console.log('*** LogId validation passed ***');
    console.log('*** If this fails, the issue is DATA SYNC between list and detail queries ***');
    console.log('*** REAL TEST: Try LogId 48, 49, 50, 51, or 52 - these should work! ***');
    console.log('LogId validation passed, proceeding with:', numericLogId);
    
    // Get modal elements
    const modalElement = document.getElementById('activityDetailsModal');
    const contentElement = document.getElementById('activityDetailsContent');
    
    if (!modalElement || !contentElement) {
        console.error('Modal elements not found!');
        showError('Modal elements not found. Please refresh the page.');
        return;
    }
    
    console.log('Modal elements found successfully');
    
    // Initialize Bootstrap modal
    let modal;
    try {
        // Get existing modal instance or create new one
        modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        console.log('Bootstrap modal initialized');
    } catch (error) {
        console.error('Failed to initialize Bootstrap modal:', error);
        showError('Failed to initialize modal. Please refresh the page.');
        return;
    }
    
    // Show loading state
    showLoadingState(contentElement);
    
    // Show modal
    try {
        modal.show();
        console.log('Modal displayed successfully');
    } catch (error) {
        console.error('Failed to show modal:', error);
        showError('Failed to show modal. Please refresh the page.');
        return;
    }
    
    // Fetch data from server
    fetchActivityDetails(numericLogId, contentElement);
}

// Show loading state in modal
function showLoadingState(contentElement) {
    console.log('Showing loading state...');
    contentElement.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">${getTranslatedText('loading')}</span>
            </div>
            <h5 class="text-muted">${getTranslatedText('loading-activity-details')}</h5>
            <p class="text-muted small">${getTranslatedText('please-wait-fetching')}</p>
        </div>
    `;
}

// Fetch activity details from server
async function fetchActivityDetails(logId, contentElement) {
    console.log('=== Fetching Activity Details ===');
    console.log('Fetching details for LogId:', logId);
    
    // Use query-string form to avoid any route-parameter binding issues
    const url = `/Admin/GetActivityLogDetails?logId=${encodeURIComponent(logId)}`;
    console.log('Request URL:', url);
    console.log('*** STANDARDIZED: Using GetActivityLogDetails endpoint ***');
    
    // Get CSRF token
    const tokenElement = document.querySelector('input[name="__RequestVerificationToken"]');
    const token = tokenElement ? tokenElement.value : '';
    console.log('CSRF token found:', token ? 'Yes' : 'No');
    
    // Prepare request options
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    
    // Add token if available
    if (token) {
        requestOptions.headers['RequestVerificationToken'] = token;
    }
    
    console.log('Request options:', requestOptions);
    
    try {
        console.log('Sending request...');
        const response = await fetch(url, requestOptions);
        console.log('Response received:', response);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        // Handle different response statuses
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                console.log('Error response data:', errorData);
                
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
                
                if (errorData.availableLogIds) {
                    errorMessage += `\n\nAvailable Log IDs: ${errorData.availableLogIds.join(', ')}`;
                }
                
                if (errorData.message) {
                    errorMessage += `\n${errorData.message}`;
                }
            } catch (parseError) {
                console.warn('Could not parse error response:', parseError);
            }
            
            throw new Error(errorMessage);
        }
        
        console.log('Parsing JSON response...');
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data && typeof data === 'object') {
            console.log('Valid data received, rendering modal content...');
            renderModalContent(data, contentElement);
        } else {
            console.error('Invalid data format received:', data);
            throw new Error('Invalid response format received from server');
        }
        
    } catch (error) {
        console.error('=== Fetch Error ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        showErrorInModal(error.message, logId, contentElement);
    }
}

// Render modal content with activity details
function renderModalContent(data, contentElement) {
    console.log('=== Rendering Modal Content ===');
    console.log('Data to render:', data);
    console.log('Entity Name (English):', data.entityName);
    console.log('Entity Name (Arabic - camelCase):', data.entityNameAr);
    console.log('Entity Name (Arabic - PascalCase):', data.EntityNameAr);
    console.log('Details (English):', data.details);
    console.log('Details (Arabic - camelCase):', data.detailsAr);
    console.log('Details (Arabic - PascalCase):', data.DetailsAr);
    console.log('User Name (English):', data.userName);
    console.log('User Name (Arabic - camelCase):', data.userNameAr);
    console.log('User Name (Arabic - PascalCase):', data.UserNameAr);
    console.log('Current Language:', getCurrentLanguage());
    
    try {
        const html = buildModalHTML(data);
        contentElement.innerHTML = html;
        console.log('Modal content rendered successfully');
    } catch (error) {
        console.error('Error rendering modal content:', error);
        showErrorInModal('Failed to render activity details', data.logId || 'Unknown', contentElement);
    }
}

// Build the modal HTML content
function buildModalHTML(data) {
    console.log('Building modal HTML...');
    
    // Format timestamp safely
    let formattedTimestamp = 'Unknown';
    try {
        if (data.actionTimestamp) {
            const date = new Date(data.actionTimestamp);
            formattedTimestamp = date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
        }
    } catch (dateError) {
        console.warn('Error formatting timestamp:', dateError);
        formattedTimestamp = data.actionTimestamp || 'Unknown';
    }
    
    // Build HTML sections
    const activitySection = buildActivitySection(data, formattedTimestamp);
    const userSection = buildUserSection(data);
    const entitySection = buildEntitySection(data);
    const changesSection = buildChangesSection(data);
    
    return `
        <div class="container-fluid">
            <div class="row mb-4">
                ${activitySection}
                ${userSection}
            </div>
            ${entitySection}
            ${changesSection}
        </div>
    `;
}

// Build activity information section
function buildActivitySection(data, formattedTimestamp) {
    return `
        <div class="col-md-6">
            <h6 class="text-primary mb-3 fw-bold">
                <i class="bi bi-activity me-2"></i>${getTranslatedText('activity-information')}
            </h6>
            <div class="card border-0 shadow-sm">
                <div class="card-body bg-light">
                    <div class="mb-3">
                        <label class="form-label fw-bold text-secondary">${getTranslatedText('log-id')}</label>
                        <div class="form-control-plaintext fw-semibold">${safeString(data.logId || data.LogId)}</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold text-secondary">${getTranslatedText('timestamp')}</label>
                        <div class="form-control-plaintext">${formattedTimestamp}</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold text-secondary">${getTranslatedText('action-type')}</label>
                        <div class="form-control-plaintext">
                            <span class="badge fs-6 ${getActionBadgeClass(data.actionType || data.ActionType)}">${getTranslatedActionType(data.actionType || data.ActionType)}</span>
                        </div>
                    </div>
                    <div class="mb-0">
                        <label class="form-label fw-bold text-secondary">${getTranslatedText('entity-type')}</label>
                        <div class="form-control-plaintext">
                            <span class="badge fs-6 ${getEntityBadgeClass(data.entityType || data.EntityType)}">${getTranslatedEntityType(data.entityType || data.EntityType)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Build user information section
function buildUserSection(data) {
    const isArabic = getCurrentLanguage() === 'ar';
    
    // Pull Arabic user name from database if available (check both camelCase and PascalCase)
    const userNameAr = data.userNameAr || data.UserNameAr;
    const displayUserName = isArabic && userNameAr 
        ? userNameAr 
        : (data.userName || data.UserName || 'N/A');
    
    console.log('=== User Section Debug ===');
    console.log('isArabic:', isArabic);
    console.log('userNameAr (camelCase):', data.userNameAr);
    console.log('UserNameAr (PascalCase):', data.UserNameAr);
    console.log('Selected userNameAr:', userNameAr);
    console.log('Final displayUserName:', displayUserName);
    
    return `
        <div class="col-md-6">
            <h6 class="text-primary mb-3 fw-bold">
                <i class="bi bi-person-circle me-2"></i>${getTranslatedText('user-information')}
            </h6>
            <div class="card border-0 shadow-sm">
                <div class="card-body bg-light">
                    <div class="mb-3">
                        <label class="form-label fw-bold text-secondary">${getTranslatedText('user-id')}</label>
                        <div class="form-control-plaintext fw-semibold">${safeString(data.userId || data.UserId)}</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold text-secondary">${getTranslatedText('user-name')}</label>
                        <div class="form-control-plaintext">${displayUserName}</div>
                    </div>
                    <div class="mb-0">
                        <label class="form-label fw-bold text-secondary">${getTranslatedText('user-role')}</label>
                        <div class="form-control-plaintext">
                            <span class="badge fs-6 ${getRoleBadgeClass(data.userRole || data.UserRole)}">${getTranslatedUserRole(data.userRole || data.UserRole)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Build entity information section
function buildEntitySection(data) {
    const isArabic = getCurrentLanguage() === 'ar';
    
    // Pull Arabic names from database if available (check both camelCase and PascalCase)
    const entityNameAr = data.entityNameAr || data.EntityNameAr;
    const displayEntityName = isArabic && entityNameAr 
        ? entityNameAr 
        : (data.entityName || data.EntityName || 'N/A');
    
    // Pull Arabic details from database if available (check both camelCase and PascalCase)
    const detailsAr = data.detailsAr || data.DetailsAr;
    const displayDetails = isArabic && detailsAr 
        ? detailsAr 
        : (data.details || data.Details || null);
    
    console.log('=== Entity Section Debug ===');
    console.log('isArabic:', isArabic);
    console.log('entityNameAr (camelCase):', data.entityNameAr);
    console.log('EntityNameAr (PascalCase):', data.EntityNameAr);
    console.log('Selected entityNameAr:', entityNameAr);
    console.log('Final displayEntityName:', displayEntityName);
    console.log('detailsAr (camelCase):', data.detailsAr);
    console.log('DetailsAr (PascalCase):', data.DetailsAr);
    console.log('Selected detailsAr:', detailsAr);
    console.log('Final displayDetails:', displayDetails);
    
    const detailsSection = displayDetails ? `
        <div class="mb-0">
            <label class="form-label fw-bold text-secondary">${getTranslatedText('details')}</label>
            <div class="form-control-plaintext">${safeString(displayDetails)}</div>
        </div>
    ` : '';
    
    return `
        <div class="row mb-4">
            <div class="col-12">
                <h6 class="text-primary mb-3 fw-bold">
                    <i class="bi bi-database me-2"></i>${getTranslatedText('entity-information')}
                </h6>
                <div class="card border-0 shadow-sm">
                    <div class="card-body bg-light">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label fw-bold text-secondary">${getTranslatedText('entity-id')}</label>
                                    <div class="form-control-plaintext fw-semibold">${safeString(data.entityId || data.EntityId) || 'N/A'}</div>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label class="form-label fw-bold text-secondary">${getTranslatedText('entity-name')}</label>
                                    <div class="form-control-plaintext">${displayEntityName}</div>
                                </div>
                            </div>
                        </div>
                        ${detailsSection}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Build data changes section
function buildChangesSection(data) {
    return `
        <div class="row mb-0">
            <div class="col-12">
                <h6 class="text-primary mb-3 fw-bold">
                    <i class="bi bi-code-square me-2"></i>${getTranslatedText('data-changes')}
                </h6>
                ${data.actionType === 'Edit' ? `
                <div class="mb-3">
                    <div class="d-flex align-items-center gap-3 text-sm">
                        <span class="d-flex align-items-center">
                            <span class="highlight-legend-modified me-1"></span>
                            ${getTranslatedText('modified-fields')}
                        </span>
                        <span class="d-flex align-items-center">
                            <span class="highlight-legend-added me-1"></span>
                            ${getTranslatedText('new-added-fields')}
                        </span>
                        <span class="d-flex align-items-center">
                            <span class="highlight-legend-removed me-1"></span>
                            ${getTranslatedText('removed-fields')}
                        </span>
                    </div>
                </div>
                ` : ''}
                ${getDataChangesContent(data.actionType, data.beforeData, data.afterData)}
            </div>
        </div>
    `;
}

// Generate data changes content
function getDataChangesContent(actionType, beforeData, afterData) {
    console.log('Generating changes content for action:', actionType);
    console.log('Before data available:', !!beforeData);
    console.log('After data available:', !!afterData);
    
    if (actionType === 'Add' && afterData) {
        return `
            <div class="card border-success">
                <div class="card-header bg-success bg-opacity-10 border-success">
                    <h6 class="card-title mb-0 text-success">
                        <i class="bi bi-plus-circle me-2"></i>${getTranslatedText('added-data')}
                    </h6>
                </div>
                <div class="card-body">
                    <pre class="json-content bg-light p-3 rounded">${formatJsonData(afterData)}</pre>
                </div>
            </div>
        `;
    }
    
    if (actionType === 'Delete' && beforeData) {
        return `
            <div class="card border-danger">
                <div class="card-header bg-danger bg-opacity-10 border-danger">
                    <h6 class="card-title mb-0 text-danger">
                        <i class="bi bi-trash me-2"></i>${getTranslatedText('deleted-data')}
                    </h6>
                </div>
                <div class="card-body">
                    <pre class="json-content bg-light p-3 rounded">${formatJsonData(beforeData)}</pre>
                </div>
            </div>
        `;
    }
    
    if (actionType === 'Edit' && (beforeData || afterData)) {
        const beforeColumn = beforeData ? `
            <div class="col-md-6 mb-3">
                <div class="card border-warning">
                    <div class="card-header bg-warning bg-opacity-10 border-warning">
                        <h6 class="card-title mb-0 text-warning">
                            <i class="bi bi-arrow-left-circle me-2"></i>${getTranslatedText('before-changes')}
                            <small class="text-muted ms-2">${getTranslatedText('original-values-highlighted')}</small>
                        </h6>
                    </div>
                    <div class="card-body">
                        <pre class="json-content bg-light p-3 rounded">${highlightBeforeChanges(beforeData, afterData)}</pre>
                    </div>
                </div>
            </div>
        ` : '';
        
        const afterColumn = afterData ? `
            <div class="col-md-6 mb-3">
                <div class="card border-info">
                    <div class="card-header bg-info bg-opacity-10 border-info">
                        <h6 class="card-title mb-0 text-info">
                            <i class="bi bi-arrow-right-circle me-2"></i>${getTranslatedText('after-changes')}
                            <small class="text-muted ms-2">${getTranslatedText('new-values-highlighted')}</small>
                        </h6>
                    </div>
                    <div class="card-body">
                        <pre class="json-content bg-light p-3 rounded">${highlightAfterChanges(beforeData, afterData)}</pre>
                    </div>
                </div>
            </div>
        ` : '';
        
        return `<div class="row">${beforeColumn}${afterColumn}</div>`;
    }
    
    return `
        <div class="card border-secondary">
            <div class="card-body text-center text-muted py-4">
                <i class="bi bi-info-circle fs-4 mb-2"></i>
                <p class="mb-0">${getTranslatedText('no-detailed-change-info')}</p>
            </div>
        </div>
    `;
}

// Format JSON data safely
function formatJsonData(jsonString) {
    if (!jsonString) return getTranslatedText('no-data-available');
    
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        console.warn('Error parsing JSON:', error);
        return escapeHtml(String(jsonString));
    }
}

// Highlight changes in JSON data for "After" column
// Highlight changes in the "Before" column (show what was changed/removed)
function highlightBeforeChanges(beforeJson, afterJson) {
    if (!beforeJson || !afterJson) {
        return formatJsonData(beforeJson);
    }
    
    try {
        const beforeObj = JSON.parse(beforeJson);
        const afterObj = JSON.parse(afterJson);
        
        return formatJsonWithBeforeHighlights(beforeObj, afterObj);
    } catch (error) {
        console.warn('Error comparing JSON objects:', error);
        return formatJsonData(beforeJson);
    }
}

// Highlight changes in the "After" column (show what was modified/added)
function highlightAfterChanges(beforeJson, afterJson) {
    if (!beforeJson || !afterJson) {
        return formatJsonData(afterJson || beforeJson);
    }
    
    try {
        const beforeObj = JSON.parse(beforeJson);
        const afterObj = JSON.parse(afterJson);
        
        return formatJsonWithAfterHighlights(afterObj, beforeObj);
    } catch (error) {
        console.warn('Error comparing JSON objects:', error);
        return formatJsonData(afterJson || beforeJson);
    }
}

// Format JSON with highlighted differences for "Before" column
function formatJsonWithBeforeHighlights(beforeObj, afterObj) {
    const changes = findJsonDifferences(beforeObj, afterObj);
    let jsonString = JSON.stringify(beforeObj, null, 2);
    
    // Sort changes by position (longest keys first to avoid overlap issues)
    const sortedChanges = Object.keys(changes).sort((a, b) => b.length - a.length);
    
    // Apply highlights to fields that were modified or removed
    sortedChanges.forEach(key => {
        const changeType = changes[key];
        let highlightClass = '';
        
        if (changeType === 'modified') {
            highlightClass = 'highlight-modified';
        } else if (changeType === 'removed') {
            highlightClass = 'highlight-removed';
        }
        
        if (highlightClass) {
            // Highlight the original value that will be changed or removed
            const keyRegex = new RegExp(`("${escapeRegex(key)}"\\s*:\\s*[^,\\n}\\]]+)`, 'g');
            jsonString = jsonString.replace(keyRegex, `<span class="${highlightClass}">$1</span>`);
        }
        // Note: We don't highlight "added" fields in before column since they don't exist here
    });
    
    return jsonString;
}

// Format JSON with highlighted differences for "After" column
function formatJsonWithAfterHighlights(afterObj, beforeObj) {
    const changes = findJsonDifferences(beforeObj, afterObj);
    let jsonString = JSON.stringify(afterObj, null, 2);
    
    // Sort changes by position (longest keys first to avoid overlap issues)
    const sortedChanges = Object.keys(changes).sort((a, b) => b.length - a.length);
    
    // Apply highlights
    sortedChanges.forEach(key => {
        const changeType = changes[key];
        let highlightClass = '';
        
        if (changeType === 'modified') {
            highlightClass = 'highlight-modified';
        } else if (changeType === 'added') {
            highlightClass = 'highlight-added';
        }
        
        if (highlightClass) {
            // Find and highlight the key-value pair
            const keyRegex = new RegExp(`("${escapeRegex(key)}"\\s*:\\s*[^,\\n}\\]]+)`, 'g');
            jsonString = jsonString.replace(keyRegex, `<span class="${highlightClass}">$1</span>`);
        }
    });
    
    return jsonString;
}

// Find differences between two objects
function findJsonDifferences(beforeObj, afterObj) {
    const differences = {};
    
    // Check for modified and added fields
    for (const key in afterObj) {
        if (afterObj.hasOwnProperty(key)) {
            if (!beforeObj.hasOwnProperty(key)) {
                differences[key] = 'added';
            } else if (JSON.stringify(afterObj[key]) !== JSON.stringify(beforeObj[key])) {
                differences[key] = 'modified';
            }
        }
    }
    
    // Check for removed fields (exist in before but not in after)
    for (const key in beforeObj) {
        if (beforeObj.hasOwnProperty(key) && !afterObj.hasOwnProperty(key)) {
            differences[key] = 'removed';
        }
    }
    
    return differences;
}

// Escape string for regex
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Safely escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Safely convert value to string
function safeString(value) {
    if (value === null || value === undefined) return '';
    return String(value);
}

// Get badge class for action type
function getActionBadgeClass(actionType) {
    switch (safeString(actionType).toLowerCase()) {
        case 'add': return 'bg-success text-white px-3 py-2';
        case 'edit': return 'bg-warning text-white px-3 py-2';
        case 'delete': return 'bg-danger text-white px-3 py-2';
        default: return 'bg-secondary text-white px-3 py-2';
    }
}

// Get badge class for entity type
function getEntityBadgeClass(entityType) {
    switch (safeString(entityType).toLowerCase()) {
        case 'record': return 'bg-primary text-white px-3 py-2';
        case 'contact': return 'bg-info text-white px-3 py-2';
        default: return 'bg-secondary text-white px-3 py-2';
    }
}

// Get badge class for user role
function getRoleBadgeClass(userRole) {
    switch (safeString(userRole).toLowerCase()) {
        case 'admin': return 'bg-danger text-white px-3 py-2';
        case 'editor': return 'bg-success text-white px-3 py-2';
        default: return 'bg-secondary text-white px-3 py-2';
    }
}

// Show error in modal
function showErrorInModal(errorMessage, logId, contentElement) {
    console.log('Showing error in modal:', errorMessage);
    contentElement.innerHTML = `
        <div class="alert alert-danger">
            <div class="d-flex align-items-center mb-3">
                <i class="bi bi-exclamation-triangle-fill fs-4 me-3 text-danger"></i>
                <div>
                    <h5 class="alert-heading mb-1">${getTranslatedText('error-loading-activity-details')}</h5>
                    <small class="text-muted">${getTranslatedText('log-id')} ${safeString(logId)}</small>
                </div>
            </div>
            <hr>
            <div class="mb-3">
                <strong>${getTranslatedText('error-details')}</strong>
                <pre class="mt-2 p-3 bg-light border rounded small">${escapeHtml(errorMessage)}</pre>
            </div>
            <div class="mb-0">
                <strong>${getTranslatedText('troubleshooting')}</strong>
                <ul class="mb-0 mt-2">
                    <li>${getTranslatedText('check-log-id-exists')}</li>
                    <li>${getTranslatedText('verify-network-connection')}</li>
                    <li>${getTranslatedText('try-refreshing-page')}</li>
                    <li>${getTranslatedText('contact-admin-if-persists')}</li>
                </ul>
            </div>
        </div>
    `;
}

// Show general error alert
function showError(message) {
    console.error('Showing error alert:', message);
    alert(`❌ Error: ${message}`);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Activity Log Page Initialized ===');
    
    // Check for required dependencies
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap is not loaded!');
        showError('Bootstrap library is not loaded. Please refresh the page.');
        return;
    }
    
    // Initialize tooltips
    try {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        console.log('Tooltips initialized:', tooltipList.length);
    } catch (error) {
        console.warn('Failed to initialize tooltips:', error);
    }
    
    // Test modal elements
    const modal = document.getElementById('activityDetailsModal');
    const content = document.getElementById('activityDetailsContent');
    
    if (!modal) {
        console.error('Modal element not found!');
    } else {
        console.log('Modal element found');
        
        // Add modal event listeners for proper cleanup
        modal.addEventListener('hidden.bs.modal', function () {
            console.log('Modal hidden, cleaning up content...');
            if (content) {
                content.innerHTML = `
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">${getTranslatedText('loading')}</span>
                        </div>
                        <div class="mt-2">${getTranslatedText('loading-activity-details')}</div>
                    </div>
                `;
            }
        });
        
        modal.addEventListener('shown.bs.modal', function () {
            console.log('Modal shown successfully');
        });
    }
    
    if (!content) {
        console.error('Modal content element not found!');
    } else {
        console.log('Modal content element found');
    }
    
    console.log('Activity Log JavaScript initialization complete');
});

// Make viewDetails function globally available
window.viewDetails = viewDetails;
console.log('viewDetails function attached to window object');
