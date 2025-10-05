from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from apps.movies.models import Showtime
from .models import Booking, Seat, BookingSeat
from .forms import BookingForm

@login_required
def create_booking(request, showtime_id):
    showtime = get_object_or_404(Showtime, id=showtime_id, is_active=True)
    
    if request.method == 'POST':
        form = BookingForm(request.POST)
        if form.is_valid():
            booking = form.save(commit=False)
            booking.user = request.user
            booking.showtime = showtime
            booking.save()
            return redirect('bookings:select_seats', showtime_id=showtime_id)
    else:
        form = BookingForm()
    
    context = {
        'showtime': showtime,
        'form': form,
    }
    return render(request, 'bookings/create_booking.html', context)

@login_required
def select_seats(request, showtime_id):
    showtime = get_object_or_404(Showtime, id=showtime_id, is_active=True)
    seats = Seat.objects.filter(theater=showtime.theater)
    booked_seats = list(BookingSeat.objects.filter(
        booking__showtime=showtime,
        booking__status__in=['pending', 'confirmed']
    ).values_list('seat_id', flat=True))
    
    if request.method == 'POST':
        selected_seats = request.POST.getlist('seats')
        if not selected_seats:
            messages.error(request, 'Vui lòng chọn ít nhất một ghế')
            return redirect('bookings:select_seats', showtime_id=showtime_id)
        
        booking = Booking.objects.create(
            user=request.user,
            showtime=showtime,
            total_amount=len(selected_seats) * showtime.price
        )
        
        for seat_id in selected_seats:
            seat = Seat.objects.get(id=seat_id)
            BookingSeat.objects.create(
                booking=booking,
                seat=seat,
                price=showtime.price
            )
        
        return redirect('bookings:payment', booking_id=booking.id)
    
    context = {
        'showtime': showtime,
        'seats': seats,
        'booked_seats': booked_seats,
    }
    return render(request, 'bookings/select_seats.html', context)

@login_required
def payment(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id, user=request.user)
    
    if request.method == 'POST':
        # Xử lý thanh toán (có thể tích hợp với cổng thanh toán thực tế)
        booking.payment_status = True
        booking.status = 'confirmed'
        booking.save()
        messages.success(request, 'Đặt vé thành công!')
        return redirect('bookings:booking_confirmation', booking_id=booking.id)
    
    return render(request, 'bookings/payment.html', {'booking': booking})

@login_required
def booking_confirmation(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id, user=request.user)
    return render(request, 'bookings/booking_confirmation.html', {'booking': booking})

@login_required
def booking_history(request):
    bookings = Booking.objects.filter(user=request.user).order_by('-booking_date')
    return render(request, 'bookings/booking_history.html', {'bookings': bookings})

@login_required
def cancel_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id, user=request.user)
    
    if booking.status in ['pending', 'confirmed']:
        booking.status = 'cancelled'
        booking.save()
        messages.success(request, 'Đã hủy đặt vé thành công')
    else:
        messages.error(request, 'Không thể hủy đặt vé này')
    
    return redirect('bookings:booking_history') 