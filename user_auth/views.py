from django.shortcuts import render, HttpResponseRedirect, redirect
from django.contrib import messages
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from user_auth.models import User
from user_auth.models import UserProfile
from django.contrib.auth import authenticate

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
    permission_classes=[]
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

        if not all([full_name, email, password, confirm_password, skills]):
            messages.error(request, 'Please fill out all required fields.')
            return HttpResponseRedirect(request.path)

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return HttpResponseRedirect(request.path)

        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists.')
            return HttpResponseRedirect(request.path)

        try:
            user = User(username=email, email=email)
            user.set_password(password)
            user.save()
        except Exception as e:
            messages.error(request, f'Error creating user: {str(e)}')
            return HttpResponseRedirect(request.path)

        try:
            profile = UserProfile(
                user=user,
                full_name=full_name,
                email=email,
                skills=skills,
                linkedin=linkedin,
                projects=projects
            )
            if resume:
                profile.resume = resume  # Direct assignment for FileField
            profile.save()
        except Exception as e:
            messages.error(request, f'Error saving profile: {str(e)}')
            user.delete()
            return HttpResponseRedirect(request.path)

        # Set user in request for immediate use
        request.user = user
        refresh = RefreshToken.for_user(user)
        request.session['access_token'] = str(refresh.access_token)
        request.session['refresh_token'] = str(refresh)
        messages.success(request, 'Account created successfully! Please log in.')
        return redirect('user_auth:login')

# user_auth/views.py
class LoginView(APIView):
    def get(self, request):
        return render(request, 'login.html')

    def post(self, request):
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Login successful!'
            }, status=status.HTTP_200_OK)
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
            resume_url = profile.resume.url if profile.resume else ''  # Use Django's FileField URL
            return Response({
                'full_name': profile.full_name,
                'email': profile.email,
                'skills': profile.skills,
                'resume': resume_url,
                'linkedin': profile.linkedin
            })
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)