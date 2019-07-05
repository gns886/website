from django.urls import path

from . import views

app_name = 'login'
urlpatterns = [
    path('', views.IndexView, name='index'),
    path('add/', views.AddView, name='add'),
    path('deal/', views.DealView, name='deal'),
    path('<int:data_id>/detail/', views.DetailView, name='vote'),
]