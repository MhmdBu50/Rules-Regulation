 function confirmCancel() {
    if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
    document.querySelector('form').reset();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const nameField = document.getElementById('responsibleName');
    const mobileInput = document.getElementById('mobileNumber');
    const telInput = document.getElementById('telephoneNumber');

    nameField.addEventListener('input', function () {
    const arabicPattern = /^[\u0600-\u06FF\s]*$/;
    const error = document.getElementById('nameError');
    if (!arabicPattern.test(this.value)) {
      error.textContent = "Name must be in Arabic.";
    } else {
      error.textContent = "";
    }
    });

    mobileInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
    });

    telInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
    });

    document.querySelector('form').addEventListener('submit', function (e) {
    const nameError = document.getElementById('nameError').textContent;
    if (nameError) {
      e.preventDefault();
    }
    });
  });