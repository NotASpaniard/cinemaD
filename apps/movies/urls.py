from django.urls import path
from . import views

app_name = 'movies'

urlpatterns = [
    path('', views.movie_list, name='movie_list'),
    path('<slug:slug>/', views.movie_detail, name='movie_detail'),
    path('genre/<slug:slug>/', views.genre_movies, name='genre_movies'),
    path('now-showing/', views.now_showing, name='now_showing'),
    path('coming-soon/', views.coming_soon, name='coming_soon'),
    path('search/', views.movie_search, name='movie_search'),
] 