from django.urls import path
from . import views

app_name = 'app_fyp'

urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('internships/', views.internships, name='internships'),
    path('apply/<int:internship_id>/', views.apply_internship, name='apply_internship'),
    path('internship/<int:internship_id>/details/', views.internship_details, name='internship_details'),
    path('profile/', views.profile_view, name='profile'),
]
