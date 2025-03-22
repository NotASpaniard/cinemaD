from django.shortcuts import render
from apps.movies.models import Movie, Showtime
from django.utils import timezone

def home(request):
    now_showing = Movie.objects.filter(
        showtime__start_time__gte=timezone.now(),
        showtime__is_active=True
    ).distinct()[:6]
    
    coming_soon = Movie.objects.filter(
        release_date__gt=timezone.now().date()
    ).order_by('release_date')[:6]
    
    context = {
        'now_showing': now_showing,
        'coming_soon': coming_soon,
    }
    return render(request, 'core/home.html', context)

def about(request):
    return render(request, 'core/about.html')

def contact(request):
    if request.method == 'POST':
        # Xử lý form liên hệ
        pass
    return render(request, 'core/contact.html') 