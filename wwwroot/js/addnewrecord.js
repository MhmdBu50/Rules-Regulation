function confirmCancel() {
      if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
        document.querySelector('form').reset();
      }
    }

    document.addEventListener('DOMContentLoaded', function () {
      const mobileInput = document.getElementById('mobileNumber');
      const telInput = document.getElementById('telephoneNumber');
      const nameField = document.getElementById('responsibleName');

      mobileInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
      });

      telInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
      });

      document.querySelector('form').addEventListener('submit', function (e) {
        let hasError = false;

        const checkboxes = document.querySelectorAll('.section-checkbox');
        const oneChecked = Array.from(checkboxes).some(cb => cb.checked);
        if (!oneChecked) {
          document.getElementById('sectionError').textContent = "Please select at least one section.";
          hasError = true;
        } else {
          document.getElementById('sectionError').textContent = "";
        }

        const arabicPattern = /^[\u0600-\u06FF\s]+$/;
        if (!arabicPattern.test(nameField.value)) {
          document.getElementById('nameError').textContent = "Name must be in Arabic.";
          hasError = true;
        } else {
          document.getElementById('nameError').textContent = "";
        }

        if (hasError) {
          e.preventDefault();
        }
      });
    });