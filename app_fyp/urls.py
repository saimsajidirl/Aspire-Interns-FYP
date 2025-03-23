from django.urls import path
from . import views

app_name = 'app_fyp'

urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('internships/', views.internships, name='internships'),
    path('apply/<int:internship_id>/', views.apply_internship, name='apply_internship'),
    path('internships/<int:internship_id>/', views.internship_detail, name='internship_detail'),  # Updated URL pattern
    path('profile/', views.profile_view, name='profile'),
    path('application/<int:application_id>/update-status/', views.update_application_status, name='update_application_status'),
    path('terms-of-service/', views.TermsOfServiceView.as_view(), name='terms_of_service'),
    path('privacy-policy/', views.PrivacyPolicyView.as_view(), name='privacy_policy'),
]
