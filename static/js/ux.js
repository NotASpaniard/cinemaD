// UX helpers: animate seat clicks and show a selection summary
document.addEventListener('DOMContentLoaded', function() {
    // Create selection summary box
    let summary = document.createElement('div');
    summary.className = 'selection-summary fade-in-up';
    summary.innerHTML = `
    <h6>Ghế đã chọn</h6>
    <div class="seats muted">Chưa có ghế nào</div>
    <div class="mt-2 text-end">
      <button class="btn btn-sm btn-primary" id="clearSelection">Xóa</button>
    </div>
  `;
    document.body.appendChild(summary);

    const seatsListEl = summary.querySelector('.seats');
    const clearBtn = document.getElementById('clearSelection');

    // Helper to update seats display
    function updateSummary(selectedSeats) {
        if (!selectedSeats || selectedSeats.length === 0) {
            seatsListEl.textContent = 'Chưa có ghế nào';
        } else {
            seatsListEl.textContent = selectedSeats.join(', ');
        }
        // tiny pulse
        summary.animate(
            [{ transform: 'scale(0.98)', opacity: 0.9 }, { transform: 'scale(1)', opacity: 1 }], { duration: 220, easing: 'ease-out' }
        );
    }

    // If SeatManager is present, patch its notifySelectionChange to update the summary
    if (window.SeatManager) {
        const OriginalSeatManager = window.SeatManager;
        // wrap constructor to attach hook
        window.SeatManager = function(options) {
            const instance = new OriginalSeatManager(options);
            const origNotify = instance.notifySelectionChange.bind(instance);
            instance.notifySelectionChange = function() {
                origNotify();
                try {
                    const selected = instance.getSelectedSeats();
                    updateSummary(selected);
                } catch (e) {
                    console.error('UX: failed to update summary', e);
                }
            };
            return instance;
        };
        // copy prototype
        window.SeatManager.prototype = OriginalSeatManager.prototype;
    }

    // Clear selection button behavior
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            // Try to find a SeatManager instance on the page
            if (window.seatManagerInstance && typeof window.seatManagerInstance.clearSelection === 'function') {
                window.seatManagerInstance.clearSelection();
            } else {
                // fallback: uncheck all inputs
                document.querySelectorAll('input[name="seats"]:checked').forEach(c => c.checked = false);
                updateSummary([]);
            }
        });
    }

    // Also try to listen for checkbox changes (for templates using inputs)
    document.addEventListener('change', function(e) {
        if (e.target && e.target.name === 'seats') {
            const checked = Array.from(document.querySelectorAll('input[name="seats"]:checked')).map(i => i.value);
            updateSummary(checked);
        }
    }, true);

    // Expose an API for other scripts
    window.UX = { updateSummary };
});