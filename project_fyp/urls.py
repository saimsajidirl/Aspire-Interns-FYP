from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app_fyp.urls', namespace='app_fyp')),
    path('auth/', include('user_auth.urls', namespace='user_auth')),
    path('internship-posting/', include('internship_posting.urls')),
    path('chat/', include('chat_aspire.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)