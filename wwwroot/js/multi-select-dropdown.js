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

    // Detect current language (check for Arabic)
    const isArabic = document.documentElement.lang === 'ar' ||
        document.documentElement.dir === 'rtl' ||
        document.body.classList.contains('rtl') ||
        document.querySelector('[lang="ar"]') !== null;

    // Department translations
    const departmentTranslations = {
        'Reg and Admission': 'التسجيل والقبول',
        'CCSIT': 'كلية علوم الحاسب وتقنية المعلومات',
        'Communication and tech': 'الاتصالات والتقنية',
        'Hospital': 'المستشفى',
        'Library': 'المكتبة',
        'Students Affairs': 'شؤون الطلاب',
        'Preparetory': 'السنة التحضيرية',
        'Academic Affairs': 'الشؤون الأكاديمية',
        '': 'جميع الأقسام',
    };

    // Get translated texts
    const allDepartmentsText = isArabic ? 'جميع الأقسام' : 'All Departments';
    const selectDepartmentsText = isArabic ? 'اختر الأقسام' : 'Select Departments';
    const departmentsText = isArabic ? 'أقسام' : 'Departments';
    const multipleDepartmentsText = isArabic ? 'عدة أقسام' : 'Multiple Departments';

    // Check for "All Departments" option
    const allDepartmentsSelected = Array.from(options).some(option => option.value === '');

    // Update hidden input value and button label
    if (allDepartmentsSelected) {
        hiddenInput.value = '';
        button.innerHTML = `<span id="all-departments-label">${allDepartmentsText}</span> <span class="caret">▼</span>`;
    } else if (options.length === 0) {
        hiddenInput.value = '';
        button.innerHTML = `<span id="select-departments-label">${selectDepartmentsText}</span> <span class="caret">▼</span>`;
    } else {
        // Collect selected values
        const selectedValues = Array.from(options).map(option => option.value);
        hiddenInput.value = selectedValues.join(',');

        // Update button text
        if (options.length === 1) {
            // Get the label text for the selected department
            const label = options[0].closest('label');
            let departmentText = options[0].value;
            if (isArabic && departmentTranslations[departmentText]) {
                departmentText = departmentTranslations[departmentText];
            } else if (label) {
                // Try to get the visible text (should be Arabic or English as rendered)
                const span = label.querySelector('span');
                if (span) departmentText = span.textContent.trim();
            }
            button.innerHTML = `<span>${departmentText}</span> <span class="caret">▼</span>`;
        } else {
            // Show all selected in Arabic if Arabic, else show count
            if (isArabic) {
                // List all selected in Arabic
                const selectedArabic = selectedValues.map(val => departmentTranslations[val] || val).join('، ');
                button.innerHTML = `<span>${selectedArabic}</span> <span class="caret">▼</span>`;
            } else {
                button.innerHTML = `<span>${options.length} ${departmentsText}</span> <span class="caret">▼</span>`;
            }
        }
    }

    // Trigger change event on hidden input for filters to apply
    const event = new Event('change');
    hiddenInput.dispatchEvent(event);
}
