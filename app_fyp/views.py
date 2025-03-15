from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.utils import timezone
from django.http import JsonResponse
from .models import Internship, InternshipApplication
from user_auth.models import UserProfile
from .forms import ProfileForm


@login_required
def update_application_status(request, application_id):
    if not request.user.is_staff:  # Restrict to admins
        messages.error(request, "You do not have permission to perform this action.")
        return redirect('app_fyp:profile')

    application = get_object_or_404(InternshipApplication, id=application_id)

    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(InternshipApplication.APPLICATION_STATUS_CHOICES).keys():
            application.status = new_status
            application.save()
            messages.success(request, f"Status updated to '{new_status.title()}' for {application.internship.title}.")
        else:
            messages.error(request, "Invalid status selected.")
        return redirect('app_fyp:profile')

    context = {
        'application': application,
        'status_choices': InternshipApplication.APPLICATION_STATUS_CHOICES,  # Use APPLICATION_STATUS_CHOICES
    }
    return render(request, 'update_application_status.html', context)
@login_required
def profile_view(request):
    try:
        profile = request.user.profile  # Access via 'profile' related_name
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user, email=request.user.email)

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            context = {
                'form': form,
                'email': request.user.email,
                'applications': InternshipApplication.objects.filter(user_id=request.user.id).select_related('internship'),
            }
            return render(request, 'profile.html', context)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = ProfileForm(instance=profile)

    context = {
        'form': form,
        'email': request.user.email,
        'applications': InternshipApplication.objects.filter(user_id=request.user.id).select_related('internship'),
    }
    return render(request, 'profile.html', context)

def index(request):
    total_opportunities = Internship.objects.count()
    paid_count = Internship.objects.filter(internship_type='paid').count()
    unpaid_count = Internship.objects.filter(internship_type='unpaid').count()
    remote_count = Internship.objects.filter(internship_type='remote').count()
    partner_companies = Internship.objects.values('company').distinct().count()

    context = {
        'total_opportunities': total_opportunities,
        'paid_count': paid_count,
        'unpaid_count': unpaid_count,
        'remote_count': remote_count,
        'partner_companies': partner_companies,
        'user': request.user,
    }
    return render(request, 'index.html', context)

def internships(request):
    query = request.GET.get('q', '')
    type_filter = request.GET.get('type', '')
    duration_filter = request.GET.get('duration', '')
    location_filter = request.GET.get('location', '')

    internships = Internship.objects.all()

    if query:
        internships = internships.filter(
            Q(title__icontains=query) |
            Q(company__icontains=query) |
            Q(location__icontains=query)
        )
    if type_filter:
        internships = internships.filter(internship_type=type_filter)
    if duration_filter:
        internships = internships.filter(duration=duration_filter)
    if location_filter:
        internships = internships.filter(location__icontains=location_filter)

    paid_count = Internship.objects.filter(internship_type='paid').count()
    unpaid_count = Internship.objects.filter(internship_type='unpaid').count()
    remote_count = Internship.objects.filter(internship_type='remote').count()

    applied_internships = set()
    if request.user.is_authenticated:
        applied_internships = set(
            InternshipApplication.objects.filter(user_id=request.user.id)
            .values_list('internship_id', flat=True)
        )

    context = {
        'internships': internships,
        'query': query,
        'paid_count': paid_count,
        'unpaid_count': unpaid_count,
        'remote_count': remote_count,
        'applied_internships': applied_internships,
        'user': request.user,
    }
    return render(request, 'internships.html', context)

@login_required
def apply_internship(request, internship_id):
    internship = get_object_or_404(Internship, id=internship_id)
    user = request.user

    try:
        application_exists = InternshipApplication.objects.filter(
            user_id=user.id,
            internship=internship
        ).exists()
        if application_exists:
            messages.warning(request, "You have already applied for this internship.")
            return redirect('internships.html')
    except Exception as e:
        print(f"Error checking application: {e}")
        messages.error(request, "An error occurred while checking your application.")
        return redirect('internships.html')

    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        messages.error(request, "Please complete your profile before applying.")
        return redirect('user_auth:signup')

    if request.method == 'POST':
        full_name = request.POST.get('full_name', profile.full_name).strip()
        email = request.POST.get('email', profile.email).strip()
        skills = request.POST.get('skills', profile.skills).strip()
        resume = request.FILES.get('resume', profile.resume)
        linkedin = request.POST.get('linkedin', profile.linkedin).strip()
        projects = request.POST.get('projects', profile.projects).strip()

        if not all([full_name, email, skills]):
            messages.error(request, "Full name, email, and skills are required.")
            return render(request, 'apply_internship.html', {'internship': internship, 'profile': profile})

        profile.full_name = full_name
        profile.email = email
        profile.skills = skills
        if resume and resume != profile.resume:
            profile.resume = resume
        profile.linkedin = linkedin
        profile.projects = projects
        profile.updated_at = timezone.now()
        profile.save()

        try:
            InternshipApplication.objects.create(
                user_id=user.id,
                internship=internship,
                full_name=full_name,
                email=email,
                skills=skills,
                resume=profile.resume,
                linkedin=linkedin,
                projects=projects,
            )
            return render(request, 'application_success.html', {
                'internship': internship,
                'message': f"Application submitted for {internship.title}!"
            })
        except Exception as e:
            print(f"Error creating application: {e}")
            messages.error(request, "Failed to submit application. Please try again.")
            return redirect('internships.html')

    return render(request, 'apply_internship.html', {'internship': internship, 'profile': profile})

def about(request):
    return render(request, 'about.html', {'user': request.user})

def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')
        if name and email and message:
            messages.success(request, 'Your message has been sent successfully!')
            return redirect('contact.html')
        else:
            messages.error(request, 'Please fill out all fields.')
    return render(request, 'contact.html', {'user': request.user})

def internship_details(request, internship_id):
    if request.headers.get('X-Requested-With') != 'XMLHttpRequest':
        return JsonResponse({'error': 'Invalid request'}, status=400)

    internship = get_object_or_404(Internship, id=internship_id)
    data = {
        'title': internship.title,
        'company': internship.company,
        'location': internship.location,
        'duration': internship.duration,
        'stack': internship.stack,
        'description': internship.description,
        'stipend': internship.stipend if internship.stipend else None,
    }
    return JsonResponse(data)