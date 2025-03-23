# chat_aspire/views.py
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from app_fyp.models import Internship
from chat_aspire.models import Message

@login_required
def chat_room(request, internship_id):
    """
    Renders the real-time chat room for a specific internship.
    """
    internship = get_object_or_404(Internship, id=internship_id)
    messages = Message.objects.filter(internship=internship).order_by('timestamp')
    context = {
        'internship': internship,
        'messages': messages,
    }
    return render(request, 'chat_room.html', context)