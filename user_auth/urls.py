from django.urls import path
from . import views

app_name = 'user_auth'

urlpatterns = [
    path('signup/', views.SignupView.as_view(), name='signup'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('get_profile/', views.GetProfileView.as_view(), name='get_profile'),
    path('media/resumes/<str:user_id>/', views.serve_resume, name='serve_resume'),
]