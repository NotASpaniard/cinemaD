// Main JavaScript file

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});

// Form validation
function validateForm(formId) {
    var form = document.getElementById(formId);
    if (!form) return true;

    var isValid = true;
    var requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Seat selection
function updateSeatSelection() {
    var checkboxes = document.querySelectorAll('input[name="seats"]');
    var submitBtn = document.getElementById('submit-btn');
    var numTickets = parseInt(document.querySelector('input[name="num_tickets"]').value);

    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            var checkedBoxes = document.querySelectorAll('input[name="seats"]:checked');
            if (checkedBoxes.length > numTickets) {
                this.checked = false;
            }
            submitBtn.disabled = checkedBoxes.length !== numTickets;
        });
    });
}

// Movie search
function searchMovies() {
    var searchInput = document.getElementById('movieSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        var searchTerm = this.value.toLowerCase();
        var movieCards = document.querySelectorAll('.movie-card');

        movieCards.forEach(function(card) {
            var title = card.querySelector('.card-title').textContent.toLowerCase();
            var description = card.querySelector('.card-text').textContent.toLowerCase();

            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Booking process
function updateBookingStep(step) {
    var steps = document.querySelectorAll('.booking-step');
    steps.forEach(function(s) {
        s.classList.remove('active');
    });
    document.querySelector('.booking-step:nth-child(' + step + ')').classList.add('active');
}

// Image preview
function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Date picker initialization
function initializeDatePicker() {
    var datePickers = document.querySelectorAll('.datepicker');
    datePickers.forEach(function(picker) {
        new Datepicker(picker, {
            format: 'dd/mm/yyyy',
            autohide: true
        });
    });
}

// Time picker initialization
function initializeTimePicker() {
    var timePickers = document.querySelectorAll('.timepicker');
    timePickers.forEach(function(picker) {
        new Timepicker(picker, {
            format: 'HH:mm',
            autohide: true
        });
    });
}

// Modal handling
function showModal(modalId) {
    var modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

function hideModal(modalId) {
    var modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
        modal.hide();
    }
}

// AJAX form submission
function submitFormAjax(formId, successCallback, errorCallback) {
    var form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(form);

        fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (successCallback) successCallback(data);
                } else {
                    if (errorCallback) errorCallback(data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (errorCallback) errorCallback({ error: 'An error occurred' });
            });
    });
}

// Toast notifications
function showToast(message, type = 'success') {
    var toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-' + type + ' border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.body.appendChild(toast);
    var bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Password strength meter
function checkPasswordStrength(password) {
    var strength = 0;

    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;

    return strength;
}

// Update password strength indicator
function updatePasswordStrength(input) {
    var strength = checkPasswordStrength(input.value);
    var indicator = document.getElementById('passwordStrength');
    if (!indicator) return;

    var strengthText = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
    var strengthClass = ['danger', 'warning', 'info', 'primary', 'success'];

    indicator.textContent = strengthText[strength - 1];
    indicator.className = 'badge bg-' + strengthClass[strength - 1];
}

// Initialize all components
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips and popovers
    initializeTooltips();

    // Initialize form validation
    var forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form.id)) {
                e.preventDefault();
                showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'danger');
            }
        });
    });

    // Initialize seat selection
    if (document.querySelector('input[name="seats"]')) {
        updateSeatSelection();
    }

    // Initialize movie search
    if (document.getElementById('movieSearch')) {
        searchMovies();
    }

    // Initialize date and time pickers
    initializeDatePicker();
    initializeTimePicker();

    // Initialize password strength meter
    var passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this);
        });
    }
});