# chat_aspire/urls.py
from django.urls import path
from . import views

app_name = 'chat_aspire'

urlpatterns = [
    path('chat/<int:internship_id>/', views.chat_room, name='chat_room'),
]