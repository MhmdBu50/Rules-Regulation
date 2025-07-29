// Navigation bar button handlers
function navigateToHome(btn) {
    alter(btn);
    clearFilters();
}

function navigateToStudentGuides(btn) {
    alter(btn);
    document.getElementById('studentsFilter').checked = true;
    document.getElementById('membersFilter').checked = false;
    document.getElementById('enrolledFilter').checked = false;
    document.getElementById('guidelinesFilter').checked = true;
    document.getElementById('regulationsFilter').checked = false;
    document.getElementById('policiesFilter').checked = false;
    applyFilters();
}

function navigateToStudentRules(btn) {
    alter(btn);
    document.getElementById('studentsFilter').checked = true;
    document.getElementById('membersFilter').checked = false;
    document.getElementById('enrolledFilter').checked = false;
    document.getElementById('guidelinesFilter').checked = false;
    document.getElementById('regulationsFilter').checked = true;
    document.getElementById('policiesFilter').checked = true;
    applyFilters();
}

function navigateToEmployeeRules(btn) {
    alter(btn);
    document.getElementById('studentsFilter').checked = false;
    document.getElementById('membersFilter').checked = true;
    document.getElementById('enrolledFilter').checked = false;
    document.getElementById('guidelinesFilter').checked = true;
    document.getElementById('regulationsFilter').checked = true;
    document.getElementById('policiesFilter').checked = true;
    applyFilters();
}

function navigateToAcademicRules(btn) {
    alter(btn);
    document.getElementById('studentsFilter').checked = false;
    document.getElementById('membersFilter').checked = false;
    document.getElementById('enrolledFilter').checked = true;
    document.getElementById('guidelinesFilter').checked = true;
    document.getElementById('regulationsFilter').checked = true;
    document.getElementById('policiesFilter').checked = true;
    applyFilters();
}
/**
 * Home Page Filters JavaScript Module
 * Contains all functionality for filtering records on the home page
 */

// Filter Management Functions
function applyHomePageFilters() {
    // Get filter values
    const department = document.getElementById('departmentFilter').value;
    const sections = getSelectedCheckboxValues(['studentsFilter', 'membersFilter', 'enrolledFilter']);
    const documentTypes = getSelectedCheckboxValues(['regulationsFilter', 'guidelinesFilter', 'policiesFilter']);
    const alphabetical = document.querySelector('input[name="alpha"]:checked')?.value || '';
    const dateSort = document.querySelector('input[name="dateOption"]:checked')?.value || '';
    const fromDate = document.getElementById('fromDate')?.value || '';
    const toDate = document.getElementById('toDate')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value || '';

    // Build query parameters
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (sections.length > 0) params.append('sections', sections.join(','));
    if (documentTypes.length > 0) params.append('documentTypes', documentTypes.join(','));
    if (alphabetical) params.append('alphabetical', alphabetical);
    if (dateSort) params.append('dateSort', dateSort);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (searchTerm) params.append('search', searchTerm);

    // Reload page with filters
    window.location.href = '/Home/homePage?' + params.toString();
}

function getSelectedCheckboxValues(checkboxIds) {
    const values = [];
    checkboxIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked) {
            values.push(checkbox.value);
        }
    });
    return values;
}

function clearAllHomePageFilters() {
    window.location.href = '/Home/homePage';
}

// Filter State Management Functions
function restoreFilterStatesFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Restore department dropdown
    restoreDepartmentFilter(urlParams);
    
    // Restore sections checkboxes
    restoreSectionFilters(urlParams);
    
    // Restore document types checkboxes
    restoreDocumentTypeFilters(urlParams);
    
    // Restore alphabetical radio buttons
    restoreAlphabeticalFilters(urlParams);
    
    // Restore date sort radio buttons
    restoreDateSortFilters(urlParams);
    
    // Restore date range inputs
    restoreDateRangeFilters(urlParams);
}

function restoreDepartmentFilter(urlParams) {
    const department = urlParams.get('department');
    if (department) {
        const departmentSelect = document.getElementById('departmentFilter');
        if (departmentSelect) {
            departmentSelect.value = department;
        }
    }
}

function restoreSectionFilters(urlParams) {
    const sections = urlParams.get('sections');
    if (sections) {
        const sectionList = sections.split(',');
        sectionList.forEach(section => {
            if (section.trim() === 'Students') {
                const element = document.getElementById('studentsFilter');
                if (element) element.checked = true;
            } else if (section.trim() === 'Members') {
                const element = document.getElementById('membersFilter');
                if (element) element.checked = true;
            } else if (section.trim() === 'Enrolled Programs') {
                const element = document.getElementById('enrolledFilter');
                if (element) element.checked = true;
            }
        });
    }
}

function restoreDocumentTypeFilters(urlParams) {
    const documentTypes = urlParams.get('documentTypes');
    if (documentTypes) {
        const typeList = documentTypes.split(',');
        typeList.forEach(type => {
            if (type.trim() === 'Regulation') {
                const element = document.getElementById('regulationsFilter');
                if (element) element.checked = true;
            } else if (type.trim() === 'Guidelines') {
                const element = document.getElementById('guidelinesFilter');
                if (element) element.checked = true;
            } else if (type.trim() === 'Policies') {
                const element = document.getElementById('policiesFilter');
                if (element) element.checked = true;
            }
        });
    }
}

function restoreAlphabeticalFilters(urlParams) {
    const alphabetical = urlParams.get('alphabetical');
    if (alphabetical) {
        if (alphabetical === 'A-Z') {
            const element = document.getElementById('azFilter');
            if (element) element.checked = true;
        } else if (alphabetical === 'Z-A') {
            const element = document.getElementById('zaFilter');
            if (element) element.checked = true;
        }
    }
}

function restoreDateSortFilters(urlParams) {
    const dateSort = urlParams.get('dateSort');
    if (dateSort) {
        const dateOptions = document.querySelectorAll('input[name="dateOption"]');
        dateOptions.forEach(option => {
            if (option.value === dateSort) {
                option.checked = true;
            }
        });
    }
}

function restoreDateRangeFilters(urlParams) {
    const fromDate = urlParams.get('fromDate');
    const toDate = urlParams.get('toDate');
    
    if (fromDate) {
        const fromDateInput = document.getElementById('fromDate');
        if (fromDateInput) {
            fromDateInput.value = fromDate;
        }
    }
    
    if (toDate) {
        const toDateInput = document.getElementById('toDate');
        if (toDateInput) {
            toDateInput.value = toDate;
        }
    }
}

// Date Range UI Management
function setupDateRangeFieldsToggle() {
    const specifyRangeRadio = document.getElementById('specifyRange');
    const dateRangeFields = document.getElementById('dateRangeFields');
    
    if (specifyRangeRadio && dateRangeFields) {
        document.querySelectorAll('input[name="dateOption"]').forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'range' && this.checked) {
                    dateRangeFields.style.display = 'block';
                } else {
                    dateRangeFields.style.display = 'none';
                }
            });
        });
        
        // Check if range is already selected on page load
        if (specifyRangeRadio.checked) {
            dateRangeFields.style.display = 'block';
        }
    }
}

// Main Initialization Function
function initializeHomePageFunctionality() {
    // Restore filter states from URL parameters
    restoreFilterStatesFromURL();
    
    // Setup date range fields toggle functionality
    setupDateRangeFieldsToggle();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeHomePageFunctionality);

// Legacy function names for backward compatibility (if needed)
// You can remove these if you update all references in the HTML
function applyFilters() {
    applyHomePageFilters();
}

function clearFilters() {
    clearAllHomePageFilters();
}
