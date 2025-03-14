from django.urls import path
from . import views

app_name = 'internship_posting'

urlpatterns = [
    path('post/', views.post_internship, name='post_internship'),
]