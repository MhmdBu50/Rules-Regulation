        // CSRF token for all AJAX requests
        const token = $('input[name="__RequestVerificationToken"]').val();
        
        // Loading overlay functions
        function showLoading() {
            $('.loading-overlay').css('display', 'flex');
        }
        
        function hideLoading() {
            $('.loading-overlay').hide();
        }
        
        // Show success/error messages
        function showMessage(message, isSuccess = true) {
            const alertClass = isSuccess ? 'alert-success' : 'alert-danger';
            const alertHtml = `
                <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            $('.message-container').html(alertHtml);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                $('.alert').alert('close');
            }, 5000);
        }
        
        // Confirmation modal
        function showConfirmationModal(title, message, onConfirm) {
            const modalHtml = `
                <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="confirmationModalLabel">${title}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                ${message}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="confirmAction">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove existing modal if any
            $('#confirmationModal').remove();
            
            // Add modal to body
            $('body').append(modalHtml);
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            modal.show();
            
            // Handle confirmation
            $('#confirmAction').on('click', function() {
                modal.hide();
                onConfirm();
            });
        }
        
        // Promote user to editor
        function promoteUser(userId, userName) {
            showConfirmationModal(
                'Promote to Editor',
                `Are you sure you want to promote <strong>${userName}</strong> to Editor role?<br><br>This will give them administrative access to most system features.`,
                function() {
                    showLoading();
                    
                    $.ajax({
                        url: '@Url.Action("PromoteToEditor", "Admin")',
                        type: 'POST',
                        data: {
                            userId: userId,
                            __RequestVerificationToken: token
                        },
                        success: function(response) {
                            hideLoading();
                            if (response.success) {
                                showMessage(response.message, true);
                                // Reload page after 2 seconds
                                setTimeout(() => {
                                    location.reload();
                                }, 2000);
                            } else {
                                showMessage(response.message, false);
                            }
                        },
                        error: function() {
                            hideLoading();
                            showMessage('An error occurred while promoting the user.', false);
                        }
                    });
                }
            );
        }
        
        // Demote editor to user
        function demoteUser(userId, userName) {
            showConfirmationModal(
                'Demote to User',
                `Are you sure you want to demote editor <strong>${userName}</strong> to regular User role?<br><br>This will remove their editorial privileges.`,
                function() {
                    showLoading();
                    
                    $.ajax({
                        url: '@Url.Action("DemoteToUser", "Admin")',
                        type: 'POST',
                        data: {
                            userId: userId,
                            __RequestVerificationToken: token
                        },
                        success: function(response) {
                            hideLoading();
                            if (response.success) {
                                showMessage(response.message, true);
                                // Reload page after 2 seconds
                                setTimeout(() => {
                                    location.reload();
                                }, 2000);
                            } else {
                                showMessage(response.message, false);
                            }
                        },
                        error: function() {
                            hideLoading();
                            showMessage('An error occurred while demoting the user.', false);
                        }
                    });
                }
            );
        }
        
        // Auto-submit search form on input
        $(document).ready(function() {
            let searchTimeout;
            $('#searchInput').on('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    $('#searchForm').submit();
                }, 500);
            });
        });