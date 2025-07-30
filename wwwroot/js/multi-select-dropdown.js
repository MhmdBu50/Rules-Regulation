/**
 * Multi-select Dropdown functionality for filters
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize multi-select department dropdown
    initMultiSelectDropdown();
});

// Initialize the multi-select dropdown
function initMultiSelectDropdown() {
    // Get elements
    const button = document.getElementById('departmentMultiSelectButton');
    const dropdown = button.closest('.multi-select-dropdown');
    const options = document.querySelectorAll('.department-option');
    const hiddenInput = document.getElementById('departmentFilter');
    
    // Add event listener to toggle dropdown
    button.addEventListener('click', function() {
        dropdown.classList.toggle('active');
    });
    
    // Handle clicks outside to close dropdown
    document.addEventListener('click', function(event) {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Special handling for "All Departments" option
    const allDepartmentsOption = document.querySelector('.department-option[value=""]');
    if (allDepartmentsOption) {
        allDepartmentsOption.addEventListener('change', function() {
            if (this.checked) {
                // If "All Departments" is checked, uncheck all other options
                options.forEach(option => {
                    if (option !== this) {
                        option.checked = false;
                    }
                });
            }
            updateSelectedDepartments();
        });
    }
    
    // Add event listeners to each option
    options.forEach(option => {
        if (option !== allDepartmentsOption) {
            option.addEventListener('change', function() {
                if (this.checked) {
                    // If any specific department is checked, uncheck "All Departments"
                    if (allDepartmentsOption) {
                        allDepartmentsOption.checked = false;
                    }
                }
                updateSelectedDepartments();
            });
        }
    });
    
    // Initial update of selected departments
    updateSelectedDepartments();
}

// Update the selected departments and hidden input value
function updateSelectedDepartments() {
    const options = document.querySelectorAll('.department-option:checked');
    const hiddenInput = document.getElementById('departmentFilter');
    const button = document.getElementById('departmentMultiSelectButton');
    
    // Check for "All Departments" option
    const allDepartmentsSelected = Array.from(options).some(option => option.value === '');
    
    // Update hidden input value
    if (allDepartmentsSelected) {
        hiddenInput.value = '';
        button.innerHTML = 'All Departments <span class="caret">▼</span>';
    } else if (options.length === 0) {
        hiddenInput.value = '';
        button.innerHTML = 'Select Departments <span class="caret">▼</span>';
    } else {
        // Collect selected values
        const selectedValues = Array.from(options).map(option => option.value);
        hiddenInput.value = selectedValues.join(',');
        
        // Update button text
        if (options.length === 1) {
            // Get just the department name without extra whitespace from the label
            const departmentText = options[0].value;
            button.innerHTML = departmentText + ' <span class="caret">▼</span>';
        } else {
            button.innerHTML = options.length + ' Depts <span class="caret">▼</span>';
        }
    }
    
    // Trigger change event on hidden input for filters to apply
    const event = new Event('change');
    hiddenInput.dispatchEvent(event);
}
