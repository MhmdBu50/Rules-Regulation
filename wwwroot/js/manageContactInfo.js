 function confirmDelete(contactId, contactName, department) {
            document.getElementById('contactName').textContent = contactName;
            document.getElementById('contactDepartment').textContent = department;
            document.getElementById('deleteContactId').value = contactId;
            document.getElementById('deleteForm').action = '@Url.Action("DeleteContactInfo", "Admin")';
            
            var modal = new bootstrap.Modal(document.getElementById('deleteModal'));
            modal.show();
        }

        // Contact Search Functionality
        let searchTimeout;

        function toggleContactClearButton() {
            const input = document.getElementById('contactSearchInput');
            const clearBtn = document.getElementById('contactClearBtn');
            
            if (input && clearBtn) {
                if (input.value.trim() !== '') {
                    clearBtn.style.display = 'block';
                } else {
                    clearBtn.style.display = 'none';
                }
            }
        }

        function clearContactSearch() {
            const input = document.getElementById('contactSearchInput');
            const clearBtn = document.getElementById('contactClearBtn');
            
            // Clear search input
            if (input) {
                input.value = '';
                input.focus();
            }
            
            if (clearBtn) {
                clearBtn.style.display = 'none';
            }
            
            // Reset department filter to "All Departments"
            const departmentOptions = document.querySelectorAll('.contact-department-option');
            departmentOptions.forEach(function(option, index) {
                option.checked = index === 0; // Check only the first option ("All Departments")
            });
            
            // Update department filter display
            updateDepartmentFilter();
            
            filterContacts();
        }

        function filterContacts() {
            const searchInput = document.getElementById('contactSearchInput');
            const tableRows = document.querySelectorAll('tbody tr');
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            
            // Get selected departments from multi-select
            const departmentOptions = document.querySelectorAll('.contact-department-option');
            const selectedDepartments = [];
            let allSelected = false;
            
            departmentOptions.forEach(function(option) {
                if (option.checked) {
                    if (option.value === '') {
                        allSelected = true;
                    } else {
                        selectedDepartments.push(option.value);
                    }
                }
            });
            
            let visibleCount = 0;
            
            tableRows.forEach(function(row) {
                // Get text content from all cells except the actions column
                const cells = row.querySelectorAll('td:not(.action-buttons)');
                let rowText = '';
                
                cells.forEach(function(cell) {
                    rowText += cell.textContent.toLowerCase() + ' ';
                });
                
                // Get department from the first cell (assuming Department is the first column)
                const departmentCell = row.querySelector('td:first-child');
                const rowDepartment = departmentCell ? departmentCell.textContent.trim() : '';
                
                // Check if search term matches any part of the row content
                let searchMatches = true;
                if (searchTerm !== '') {
                    // Support multi-word search
                    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
                    searchMatches = searchWords.every(word => rowText.includes(word));
                }
                
                // Check if department matches the filter
                let departmentMatches = true;
                if (!allSelected && selectedDepartments.length > 0) {
                    departmentMatches = selectedDepartments.includes(rowDepartment);
                }
                
                // Show row only if both search and department filters match
                if (searchMatches && departmentMatches) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });
            
            // Show/hide no results message
            const hasActiveFilters = searchTerm !== '' || (!allSelected && selectedDepartments.length > 0);
            showNoResultsMessage(visibleCount === 0 && hasActiveFilters, searchTerm, selectedDepartments, allSelected);
        }

        function showNoResultsMessage(show, searchTerm = '', selectedDepartments = [], allSelected = true) {
            // Remove existing no results message
            const existingMessage = document.querySelector('.no-results-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            if (show) {
                // Detect current language (check for Arabic)
                const isArabic = document.documentElement.lang === 'ar' || 
                                document.documentElement.dir === 'rtl' ||
                                document.body.classList.contains('rtl') ||
                                document.querySelector('[lang="ar"]') !== null;
                
                let title, message, buttonText;
                
                // Determine the type of filter and create appropriate messages
                const hasSearch = searchTerm !== '';
                const hasDepartmentFilter = !allSelected && selectedDepartments.length > 0;
                
                if (hasSearch && hasDepartmentFilter) {
                    // Both search and department filter active
                    title = isArabic ? "لم يتم العثور على نتائج" : "No results found";
                    const deptText = selectedDepartments.length === 1 ? 
                        (isArabic ? `قسم "${selectedDepartments[0]}"` : `"${selectedDepartments[0]}" department`) :
                        (isArabic ? `الأقسام المحددة` : `selected departments`);
                    message = isArabic ? 
                        `لا توجد معلومات اتصال تطابق البحث "${searchTerm}" في ${deptText}. حاول تعديل مصطلحات البحث أو تغيير الأقسام.` : 
                        `No contact information match "${searchTerm}" in ${deptText}. Try adjusting your search terms or changing the departments.`;
                } else if (hasSearch) {
                    // Only search active
                    title = isArabic ? "لم يتم العثور على نتائج" : "No results found";
                    message = isArabic ? 
                        `لا توجد معلومات اتصال تطابق البحث "${searchTerm}". حاول تعديل مصطلحات البحث.` : 
                        `No contact information match "${searchTerm}". Try adjusting your search terms.`;
                } else if (hasDepartmentFilter) {
                    // Only department filter active
                    title = isArabic ? "لا توجد معلومات اتصال" : "No contact information found";
                    const deptText = selectedDepartments.length === 1 ? 
                        (isArabic ? `قسم "${selectedDepartments[0]}"` : `"${selectedDepartments[0]}" department`) :
                        (isArabic ? `الأقسام المحددة` : `selected departments`);
                    message = isArabic ? 
                        `لا توجد معلومات اتصال في ${deptText}. حاول تحديد أقسام أخرى.` : 
                        `No contact information found in ${deptText}. Try selecting different departments.`;
                }
                
                buttonText = isArabic ? "مسح المرشحات" : "Clear Filters";
                
                const buttonHtml = `
                    <button class="btn btn-secondary" onclick="clearContactSearch()">
                        <i class="fas fa-times me-2"></i>${buttonText}
                    </button>
                `;
                
                // Create and insert the no results message
                const table = document.querySelector('table');
                if (table) {
                    const noResultsDiv = document.createElement('div');
                    noResultsDiv.className = 'no-results-message';
                    noResultsDiv.innerHTML = `
                        <div class="alert alert-info mb-0 text-center" style="background-color: #d1ecf1; border-color: #bee5eb; color: #0c5460;">
                            <h5 class="alert-heading mb-3" style="color: #0c5460; font-weight: 600;">${title}</h5>
                            <p class="mb-3" style="color: #0c5460;">${message}</p>
                            <div>
                                ${buttonHtml}
                            </div>
                        </div>
                    `;
                    table.parentNode.insertBefore(noResultsDiv, table.nextSibling);
                }
            }
        }

        // Initialize search functionality when page loads
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('contactSearchInput');
            
            if (searchInput) {
                // Set initial placeholder based on current language
                const isArabic = document.documentElement.lang === 'ar' || 
                                document.documentElement.dir === 'rtl' ||
                                document.body.classList.contains('rtl') ||
                                document.querySelector('[lang="ar"]') !== null;
                
                searchInput.placeholder = isArabic ? 
                    "البحث في جهات الاتصال بالاسم أو القسم أو البريد الإلكتروني..." : 
                    "Search contacts by name, department, email...";
                
                // Add input event listener with debounced search
                searchInput.addEventListener('input', function() {
                    toggleContactClearButton();
                    
                    // Clear previous timeout and set new one
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        filterContacts();
                    }, 300); // Wait 300ms after user stops typing
                });
                
                // Add keypress event for Enter key
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        clearTimeout(searchTimeout);
                        filterContacts();
                    }
                });
                
                // Focus handling
                searchInput.addEventListener('focus', function() {
                    this.style.pointerEvents = 'auto';
                });
            }
            
            // Add click event to search button
            const searchButton = document.querySelector('.search-and-filter-buttons');
            if (searchButton && searchInput) {
                searchButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    searchInput.focus();
                });
            }
            
            // Add department filter functionality
            const departmentButton = document.getElementById('contactDepartmentMultiSelectButton');
            const departmentContent = document.getElementById('contactDepartmentDropdownContent');
            const departmentOptions = document.querySelectorAll('.contact-department-option');
            
            if (departmentButton && departmentContent) {
                // Initialize the dropdown
                updateDepartmentFilter();
                
                // Toggle dropdown
                departmentButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const isVisible = departmentContent.style.display === 'block';
                    departmentContent.style.display = isVisible ? 'none' : 'block';
                });
                
                // Close dropdown when clicking outside
                document.addEventListener('click', function(e) {
                    if (!departmentButton.contains(e.target) && !departmentContent.contains(e.target)) {
                        departmentContent.style.display = 'none';
                    }
                });
                
                // Handle department option changes
                departmentOptions.forEach(function(option) {
                    option.addEventListener('change', function() {
                        // Handle "All Departments" logic
                        if (option.value === '') {
                            if (option.checked) {
                                // If "All Departments" is checked, uncheck all others
                                departmentOptions.forEach(function(opt) {
                                    if (opt.value !== '') {
                                        opt.checked = false;
                                    }
                                });
                            }
                        } else {
                            // If any specific department is checked, uncheck "All Departments"
                            if (option.checked) {
                                departmentOptions[0].checked = false;
                            }
                            
                            // If no departments are selected, check "All Departments"
                            const hasSelected = Array.from(departmentOptions).slice(1).some(opt => opt.checked);
                            if (!hasSelected) {
                                departmentOptions[0].checked = true;
                            }
                        }
                        
                        updateDepartmentFilter();
                        filterContacts();
                    });
                });
            }
        });
        
        function updateDepartmentFilter() {
            const departmentOptions = document.querySelectorAll('.contact-department-option');
            const selectedDepartments = [];
            const button = document.getElementById('contactDepartmentMultiSelectButton');
            
            departmentOptions.forEach(function(option) {
                if (option.checked && option.value !== '') {
                    selectedDepartments.push(option.value);
                }
            });
            
            // Get translated texts
            const allDepartmentsElement = document.getElementById('contact-all-departments');
            const allDepartmentsText = allDepartmentsElement ? allDepartmentsElement.textContent : 'All Departments';
            
            // Update button text
            if (selectedDepartments.length === 0 || departmentOptions[0].checked) {
                button.innerHTML = `<span>${allDepartmentsText}</span> <span class="caret">▼</span>`;
            } else if (selectedDepartments.length === 1) {
                button.innerHTML = `<span>${selectedDepartments[0]}</span> <span class="caret">▼</span>`;
            } else {
                // For multiple departments, show count with translated "Departments" text
                const isArabic = document.documentElement.lang === 'ar' || 
                                document.documentElement.dir === 'rtl' ||
                                document.body.classList.contains('rtl') ||
                                document.querySelector('[lang="ar"]') !== null;
                const departmentsText = isArabic ? 'أقسام' : 'Departments';
                button.innerHTML = `<span>${selectedDepartments.length} ${departmentsText}</span> <span class="caret">▼</span>`;
            }
            
            // Update hidden field
            const hiddenField = document.getElementById('contactDepartmentFilter');
            if (hiddenField) {
                hiddenField.value = selectedDepartments.join(',');
            }
        }