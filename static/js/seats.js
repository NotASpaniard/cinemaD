// Seat management JavaScript

class SeatManager {
    constructor(options = {}) {
        this.options = {
            container: options.container || '.seat-map',
            seatClass: options.seatClass || '.seat',
            selectedClass: options.selectedClass || 'selected',
            bookedClass: options.bookedClass || 'booked',
            maxSeats: options.maxSeats || 1,
            onSelectionChange: options.onSelectionChange || null
        };

        this.selectedSeats = new Set();
        this.bookedSeats = new Set();
        this.init();
    }

    init() {
        this.container = document.querySelector(this.options.container);
        if (!this.container) return;

        this.seats = this.container.querySelectorAll(this.options.seatClass);
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        this.seats.forEach(seat => {
            seat.addEventListener('click', (e) => this.handleSeatClick(e));
        });
    }

    handleSeatClick(event) {
        const seat = event.currentTarget;
        const seatId = seat.dataset.seatId;

        if (this.isSeatBooked(seatId)) {
            return;
        }

        if (this.isSeatSelected(seatId)) {
            this.deselectSeat(seatId);
        } else if (this.canSelectMoreSeats()) {
            this.selectSeat(seatId);
        }

        this.updateUI();
        this.notifySelectionChange();
    }

    isSeatBooked(seatId) {
        return this.bookedSeats.has(seatId);
    }

    isSeatSelected(seatId) {
        return this.selectedSeats.has(seatId);
    }

    canSelectMoreSeats() {
        return this.selectedSeats.size < this.options.maxSeats;
    }

    selectSeat(seatId) {
        this.selectedSeats.add(seatId);
    }

    deselectSeat(seatId) {
        this.selectedSeats.delete(seatId);
    }

    setBookedSeats(seats) {
        this.bookedSeats = new Set(seats);
        this.updateUI();
    }

    updateUI() {
        this.seats.forEach(seat => {
            const seatId = seat.dataset.seatId;

            // Reset classes
            seat.classList.remove(this.options.selectedClass, this.options.bookedClass);

            // Add appropriate class
            if (this.isSeatBooked(seatId)) {
                seat.classList.add(this.options.bookedClass);
                seat.setAttribute('disabled', 'disabled');
            } else if (this.isSeatSelected(seatId)) {
                seat.classList.add(this.options.selectedClass);
            } else {
                seat.removeAttribute('disabled');
            }
        });
    }

    notifySelectionChange() {
        if (this.options.onSelectionChange) {
            this.options.onSelectionChange({
                selectedSeats: Array.from(this.selectedSeats),
                totalSelected: this.selectedSeats.size,
                canSelectMore: this.canSelectMoreSeats()
            });
        }
    }

    getSelectedSeats() {
        return Array.from(this.selectedSeats);
    }

    clearSelection() {
        this.selectedSeats.clear();
        this.updateUI();
        this.notifySelectionChange();
    }
}

// Initialize seat manager when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const seatManager = new SeatManager({
        container: '.seat-map',
        seatClass: '.seat',
        selectedClass: 'selected',
        bookedClass: 'booked',
        maxSeats: parseInt(document.querySelector('input[name="num_tickets"]').value) || 1,
        onSelectionChange: function(data) {
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.disabled = data.totalSelected !== data.maxSeats;
            }
        }
    });

    // Set booked seats if available: prefer json_script (#bookedSeats)
    let bookedSeats = [];
    try {
        const script = document.getElementById('bookedSeats');
        if (script) {
            bookedSeats = JSON.parse(script.textContent || '[]');
        } else {
            const bookedSeatsData = document.querySelector('input[name="booked_seats"]');
            if (bookedSeatsData) bookedSeats = JSON.parse(bookedSeatsData.value || '[]');
        }
    } catch (e) {
        console.error('Error parsing booked seats:', e);
    }
    seatManager.setBookedSeats(bookedSeats);

    // expose instance globally for other UX scripts
    window.seatManagerInstance = seatManager;
});

// Export for use in other files
window.SeatManager = SeatManager;