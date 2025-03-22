from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from .models import Movie, Genre, Showtime
from django.db.models import Q

def movie_list(request):
    movies = Movie.objects.filter(is_active=True).order_by('-release_date')
    genres = Genre.objects.all()
    return render(request, 'movies/movie_list.html', {
        'movies': movies,
        'genres': genres
    })

def movie_detail(request, slug):
    movie = get_object_or_404(Movie, slug=slug, is_active=True)
    showtimes = Showtime.objects.filter(
        movie=movie,
        start_time__gte=timezone.now(),
        is_active=True
    ).order_by('start_time')
    return render(request, 'movies/movie_detail.html', {
        'movie': movie,
        'showtimes': showtimes
    })

def genre_movies(request, slug):
    genre = get_object_or_404(Genre, slug=slug)
    movies = Movie.objects.filter(genres=genre, is_active=True)
    return render(request, 'movies/genre_movies.html', {
        'genre': genre,
        'movies': movies
    })

def now_showing(request):
    movies = Movie.objects.filter(
        showtime__start_time__gte=timezone.now(),
        showtime__is_active=True,
        is_active=True
    ).distinct()
    return render(request, 'movies/now_showing.html', {'movies': movies})

def coming_soon(request):
    movies = Movie.objects.filter(
        release_date__gt=timezone.now().date(),
        is_active=True
    ).order_by('release_date')
    return render(request, 'movies/coming_soon.html', {'movies': movies})

def movie_search(request):
    query = request.GET.get('q', '')
    if query:
        movies = Movie.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query),
            is_active=True
        )
    else:
        movies = Movie.objects.none()
    return render(request, 'movies/search_results.html', {
        'movies': movies,
        'query': query
    }) 