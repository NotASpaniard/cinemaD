// Payment management JavaScript

class PaymentManager {
    constructor(options = {}) {
        this.options = {
            formId: options.formId || 'paymentForm',
            totalPriceElement: options.totalPriceElement || '#totalPrice',
            paymentMethodSelect: options.paymentMethodSelect || '#paymentMethod',
            submitButton: options.submitButton || '#submitPayment',
            onSuccess: options.onSuccess || null,
            onError: options.onError || null
        };

        this.init();
    }

    init() {
        this.form = document.getElementById(this.options.formId);
        if (!this.form) return;

        this.totalPriceElement = document.querySelector(this.options.totalPriceElement);
        this.paymentMethodSelect = document.querySelector(this.options.paymentMethodSelect);
        this.submitButton = document.querySelector(this.options.submitButton);

        this.setupEventListeners();
        this.updatePaymentDetails();
    }

    setupEventListeners() {
        if (this.paymentMethodSelect) {
            this.paymentMethodSelect.addEventListener('change', () => this.updatePaymentDetails());
        }

        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    updatePaymentDetails() {
        if (!this.paymentMethodSelect || !this.totalPriceElement) return;

        const paymentMethod = this.paymentMethodSelect.value;
        const totalPrice = parseFloat(this.totalPriceElement.dataset.totalPrice) || 0;

        // Update payment method specific details
        const paymentDetails = this.getPaymentMethodDetails(paymentMethod, totalPrice);
        this.updatePaymentMethodUI(paymentDetails);
    }

    getPaymentMethodDetails(method, amount) {
        switch (method) {
            case 'cash':
                return {
                    title: 'Thanh Toán Tiền Mặt',
                    description: 'Vui lòng chuẩn bị đủ số tiền khi đến rạp',
                    amount: amount
                };
            case 'bank':
                return {
                    title: 'Chuyển Khoản Ngân Hàng',
                    description: 'Vui lòng chuyển khoản theo thông tin sau:',
                    bankInfo: {
                        accountName: 'RẠP CHIẾU PHIM',
                        accountNumber: '123456789',
                        bankName: 'VIETCOMBANK',
                        branch: 'Hà Nội',
                        amount: amount,
                        content: 'Đặt vé xem phim'
                    }
                };
            case 'momo':
                return {
                    title: 'Thanh Toán Qua MoMo',
                    description: 'Quét mã QR để thanh toán',
                    amount: amount
                };
            case 'zalo':
                return {
                    title: 'Thanh Toán Qua ZaloPay',
                    description: 'Quét mã QR để thanh toán',
                    amount: amount
                };
            default:
                return null;
        }
    }

    updatePaymentMethodUI(details) {
        if (!details) return;

        const paymentDetailsContainer = document.getElementById('paymentDetails');
        if (!paymentDetailsContainer) return;

        let html = `
            <h5>${details.title}</h5>
            <p>${details.description}</p>
        `;

        if (details.bankInfo) {
            html += `
                <div class="bank-info">
                    <p><strong>Tên tài khoản:</strong> ${details.bankInfo.accountName}</p>
                    <p><strong>Số tài khoản:</strong> ${details.bankInfo.accountNumber}</p>
                    <p><strong>Ngân hàng:</strong> ${details.bankInfo.bankName}</p>
                    <p><strong>Chi nhánh:</strong> ${details.bankInfo.branch}</p>
                    <p><strong>Số tiền:</strong> ${this.formatCurrency(details.bankInfo.amount)}</p>
                    <p><strong>Nội dung:</strong> ${details.bankInfo.content}</p>
                </div>
            `;
        }

        paymentDetailsContainer.innerHTML = html;

        // Enable/disable submit button based on payment method selection
        if (this.submitButton) {
            this.submitButton.disabled = !this.paymentMethodSelect.value;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    async handleSubmit(event) {
        event.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        if (this.submitButton) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...';
        }

        try {
            const formData = new FormData(this.form);
            const response = await this.submitPayment(formData);

            if (response.success) {
                if (this.options.onSuccess) {
                    this.options.onSuccess(response);
                }
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            if (this.options.onError) {
                this.options.onError(error);
            }
            this.showError(error.message);
        } finally {
            if (this.submitButton) {
                this.submitButton.disabled = false;
                this.submitButton.innerHTML = 'Xác Nhận Thanh Toán';
            }
        }
    }

    validateForm() {
        if (!this.paymentMethodSelect || !this.paymentMethodSelect.value) {
            this.showError('Vui lòng chọn phương thức thanh toán');
            return false;
        }

        return true;
    }

    async submitPayment(formData) {
        const response = await fetch(this.form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });

        return await response.json();
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

// Initialize payment manager when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const paymentManager = new PaymentManager({
        formId: 'paymentForm',
        totalPriceElement: '#totalPrice',
        paymentMethodSelect: '#paymentMethod',
        submitButton: '#submitPayment',
        onSuccess: function(response) {
            window.location.href = response.redirectUrl;
        },
        onError: function(error) {
            console.error('Payment error:', error);
        }
    });
});

// Export for use in other files
window.PaymentManager = PaymentManager;