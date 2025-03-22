// User management JavaScript

class UserManager {
    constructor(options = {}) {
        this.options = {
            formId: options.formId || 'userForm',
            profileFormId: options.profileFormId || 'profileForm',
            passwordFormId: options.passwordFormId || 'passwordForm',
            avatarInput: options.avatarInput || '#avatarInput',
            avatarPreview: options.avatarPreview || '#avatarPreview',
            onProfileUpdate: options.onProfileUpdate || null,
            onPasswordChange: options.onPasswordChange || null
        };

        this.init();
    }

    init() {
        this.form = document.getElementById(this.options.formId);
        this.profileForm = document.getElementById(this.options.profileFormId);
        this.passwordForm = document.getElementById(this.options.passwordFormId);
        this.avatarInput = document.querySelector(this.options.avatarInput);
        this.avatarPreview = document.querySelector(this.options.avatarPreview);

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.avatarInput && this.avatarPreview) {
            this.avatarInput.addEventListener('change', (e) => this.handleAvatarChange(e));
        }

        if (this.profileForm) {
            this.profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        if (this.passwordForm) {
            this.passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }
    }

    handleAvatarChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!this.validateImageFile(file)) {
            this.showError('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.avatarPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        return validTypes.includes(file.type) && file.size <= maxSize;
    }

    async handleProfileUpdate(event) {
        event.preventDefault();

        if (!this.validateProfileForm()) {
            return;
        }

        const submitButton = this.profileForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang cập nhật...';
        }

        try {
            const formData = new FormData(this.profileForm);
            const response = await this.updateProfile(formData);

            if (response.success) {
                this.showSuccess('Cập nhật thông tin thành công');
                if (this.options.onProfileUpdate) {
                    this.options.onProfileUpdate(response);
                }
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Cập Nhật';
            }
        }
    }

    async handlePasswordChange(event) {
        event.preventDefault();

        if (!this.validatePasswordForm()) {
            return;
        }

        const submitButton = this.passwordForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang cập nhật...';
        }

        try {
            const formData = new FormData(this.passwordForm);
            const response = await this.changePassword(formData);

            if (response.success) {
                this.showSuccess('Đổi mật khẩu thành công');
                this.passwordForm.reset();
                if (this.options.onPasswordChange) {
                    this.options.onPasswordChange(response);
                }
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Đổi Mật Khẩu';
            }
        }
    }

    validateProfileForm() {
        if (!this.profileForm) return true;

        const requiredFields = this.profileForm.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            this.showError('Vui lòng điền đầy đủ thông tin bắt buộc');
        }

        return isValid;
    }

    validatePasswordForm() {
        if (!this.passwordForm) return true;

        const currentPassword = this.passwordForm.querySelector('#current_password');
        const newPassword = this.passwordForm.querySelector('#new_password');
        const confirmPassword = this.passwordForm.querySelector('#confirm_password');

        if (!currentPassword || !newPassword || !confirmPassword) {
            return true;
        }

        let isValid = true;

        if (!currentPassword.value.trim()) {
            currentPassword.classList.add('is-invalid');
            isValid = false;
        } else {
            currentPassword.classList.remove('is-invalid');
        }

        if (!newPassword.value.trim()) {
            newPassword.classList.add('is-invalid');
            isValid = false;
        } else {
            newPassword.classList.remove('is-invalid');
        }

        if (newPassword.value !== confirmPassword.value) {
            confirmPassword.classList.add('is-invalid');
            isValid = false;
        } else {
            confirmPassword.classList.remove('is-invalid');
        }

        if (!isValid) {
            this.showError('Vui lòng kiểm tra lại thông tin mật khẩu');
        }

        return isValid;
    }

    async updateProfile(formData) {
        const response = await fetch('/api/users/profile/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });

        return await response.json();
    }

    async changePassword(formData) {
        const response = await fetch('/api/users/password/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });

        return await response.json();
    }

    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0';
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
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0';
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
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
}

// Initialize user manager when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const userManager = new UserManager({
        formId: 'userForm',
        profileFormId: 'profileForm',
        passwordFormId: 'passwordForm',
        avatarInput: '#avatarInput',
        avatarPreview: '#avatarPreview',
        onProfileUpdate: function(response) {
            // Update user info in navbar if needed
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement && response.user) {
                userNameElement.textContent = response.user.full_name;
            }
        }
    });
});

// Export for use in other files
window.UserManager = UserManager;