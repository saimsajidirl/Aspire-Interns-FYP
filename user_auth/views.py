from django.shortcuts import render, HttpResponseRedirect, redirect
from django.contrib import messages
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from user_auth.models import User, UserProfile
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import random
from django.core.mail import send_mail
from django.conf import settings
import base64
from io import BytesIO
from django.core.files.base import ContentFile

def serve_resume(request, user_id):
    """Serve a resume file from the filesystem."""
    try:
        profile = UserProfile.objects.get(user_id=user_id)
        if profile.resume:
            with profile.resume.open('rb') as resume_file:
                return HttpResponse(resume_file.read(), content_type=profile.resume.file.content_type)
        return HttpResponse("File not found", status=404)
    except UserProfile.DoesNotExist:
        return HttpResponse("File not found", status=404)

class SignupView(APIView):
    permission_classes = []

    def get(self, request):
        return render(request, 'signup.html')

    def post(self, request):
        full_name = request.POST.get('full_name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        skills = request.POST.get('skills')
        resume = request.FILES.get('resume')
        linkedin = request.POST.get('linkedin', '')
        projects = request.POST.get('projects', '')

        # Validation
        if not all([full_name, email, password, confirm_password, skills]):
            messages.error(request, 'Please fill out all required fields.')
            return HttpResponseRedirect(request.path)

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return HttpResponseRedirect(request.path)

        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists.')
            return HttpResponseRedirect(request.path)

        # Generate OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])  # 6-digit OTP

        # Store signup data in session
        signup_data = {
            'full_name': full_name,
            'email': email,
            'password': password,
            'skills': skills,
            'linkedin': linkedin,
            'projects': projects,
            'otp': otp,
        }
        if resume:
            signup_data['resume_name'] = resume.name
            signup_data['resume_content'] = base64.b64encode(resume.read()).decode('utf-8')  # Convert bytes to base64 string

        request.session['signup_data'] = signup_data

        # Send OTP email
        try:
            send_mail(
                subject='Your OTP for Aspire Interns Signup',
                message=f'Your OTP is: {otp}\nPlease enter this code to complete your registration.',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
            messages.success(request, 'OTP sent to your email. Please verify.')
            return redirect('user_auth:verify_otp')
        except Exception as e:
            messages.error(request, f'Failed to send OTP: {str(e)}')
            return HttpResponseRedirect(request.path)

class VerifyOTPView(APIView):
    permission_classes = []

    def get(self, request):
        if 'signup_data' not in request.session:
            messages.error(request, 'Signup session expired. Please start over.')
            return redirect('user_auth:signup')
        return render(request, 'verify_otp.html')

    def post(self, request):
        entered_otp = request.POST.get('otp', '').strip()
        signup_data = request.session.get('signup_data')

        if not signup_data:
            messages.error(request, 'Signup session expired. Please start over.')
            return redirect('user_auth:signup')

        if entered_otp != signup_data['otp']:
            messages.error(request, 'Invalid OTP. Please try again.')
            return HttpResponseRedirect(request.path)

        # Create user and profile
        try:
            user = User(username=signup_data['email'], email=signup_data['email'])
            user.set_password(signup_data['password'])
            user.save()

            profile = UserProfile(
                user=user,
                full_name=signup_data['full_name'],
                email=signup_data['email'],
                skills=signup_data['skills'],
                linkedin=signup_data['linkedin'],
                projects=signup_data['projects'],
            )
            if 'resume_name' in signup_data:
                resume_content = base64.b64decode(signup_data['resume_content'])  # Decode base64 back to bytes
                profile.resume.save(signup_data['resume_name'], ContentFile(resume_content))

            profile.save()

            # Clean up session
            del request.session['signup_data']

            # Log in the user
            login(request, user)
            refresh = RefreshToken.for_user(user)
            request.session['access_token'] = str(refresh.access_token)
            request.session['refresh_token'] = str(refresh)
            messages.success(request, 'Account created and verified successfully!')
            return redirect('app_fyp:index')
        except Exception as e:
            messages.error(request, f'Error completing signup: {str(e)}')
            return HttpResponseRedirect(request.path)

class LoginView(APIView):
    def get(self, request):
        return render(request, 'login.html')

    def post(self, request):
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            refresh = RefreshToken.for_user(user)
            request.session['access_token'] = str(refresh.access_token)
            request.session['refresh_token'] = str(refresh)
            messages.success(request, 'Login successful!')
            return redirect('app_fyp:index')
        messages.error(request, 'Invalid email or password.')
        return redirect('user_auth:login')

class LogoutView(APIView):
    def post(self, request):
        request.session.flush()
        messages.success(request, 'You have been logged out successfully.')
        return redirect('user_auth:login')

class GetProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            resume_url = profile.resume.url if profile.resume else ''
            return Response({
                'full_name': profile.full_name,
                'email': profile.email,
                'skills': profile.skills,
                'resume': resume_url,
                'linkedin': profile.linkedin,
            })
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)