from django.urls import path
from . import views

app_name = 'bookings'

urlpatterns = [
    path('create/<int:showtime_id>/', views.create_booking, name='create_booking'),
    path('select-seats/<int:showtime_id>/', views.select_seats, name='select_seats'),
    path('payment/<int:booking_id>/', views.payment, name='payment'),
    path('confirmation/<int:booking_id>/', views.booking_confirmation, name='booking_confirmation'),
    path('history/', views.booking_history, name='booking_history'),
    path('cancel/<int:booking_id>/', views.cancel_booking, name='cancel_booking'),
] 