from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from app_fyp.models import Internship
from .models import InternshipPosting

@login_required
def post_internship(request):

    if request.method == 'POST':
        title = request.POST.get('title')
        company = request.POST.get('company')
        stack = request.POST.get('stack')
        location = request.POST.get('location')
        duration = request.POST.get('duration')
        stipend = request.POST.get('stipend', None)
        description = request.POST.get('description')
        internship_type = request.POST.get('internship_type')

        if not all([title, company, stack, location, description, internship_type]):
            messages.error(request, "All required fields must be filled.")
            return render(request, 'post_internship.html', {
                'title': title,
                'company': company,
                'stack': stack,
                'location': location,
                'duration': duration,
                'stipend': stipend,
                'description': description,
                'internship_type': internship_type,
            })

        try:
            # Create the Internship instance
            internship = Internship.objects.create(
                title=title,
                company=company,
                stack=stack,
                location=location,
                duration=duration,
                stipend=stipend,
                description=description,
                internship_type=internship_type,
                created_at=timezone.now(),
            )

            InternshipPosting.objects.create(
                internship=internship,
                posted_by_id=request.user.id,
                posted_at=timezone.now(),
            )
            messages.success(request, f"Internship '{internship.title}' posted successfully!")
            return redirect('app_fyp:internships')
        except Exception as e:
            print(f"Error posting internship: {e}")
            messages.error(request, "Failed to post internship. Please try again.")
            return render(request, 'post_internship.html', {
                'title': title,
                'company': company,
                'stack': stack,
                'location': location,
                'duration': duration,
                'stipend': stipend,
                'description': description,
                'internship_type': internship_type,
            })

    return render(request, 'post_internship.html', {})