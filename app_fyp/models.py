from django.utils import timezone
from django.db import models

class Internship(models.Model):
    INTERNSHIP_TYPE_CHOICES = [
        ('paid', 'Paid'),
        ('unpaid', 'Unpaid'),
        ('remote', 'Remote'),
    ]

    title = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    stack = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    duration = models.CharField(max_length=50)
    stipend = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField()
    internship_type = models.CharField(max_length=20, choices=INTERNSHIP_TYPE_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'internships'
        indexes = [
            models.Index(fields=['title', 'company']),
        ]

    def __str__(self):
        return f"{self.title} - {self.company}"

class InternshipApplication(models.Model):
    APPLICATION_STATUS_CHOICES = [
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    ]

    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()  # Replace ForeignKey with a plain integer
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, related_name='applications')
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    skills = models.TextField()
    resume = models.FileField(upload_to='applications/resumes/', null=True, blank=True)
    linkedin = models.URLField(null=True, blank=True)
    projects = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS_CHOICES, default='SUBMITTED')
    applied_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'internship_applications'
        unique_together = ('user_id', 'internship')
        indexes = [
            models.Index(fields=['user_id', 'status']),
        ]

    def __str__(self):
        return f"Application for {self.internship.title} by user {self.user_id}"