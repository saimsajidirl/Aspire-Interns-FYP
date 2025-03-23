# project_fyp/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat_aspire.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_fyp.settings')  # Ensure this matches your settings file
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(chat_aspire.routing.websocket_urlpatterns)
    ),
})