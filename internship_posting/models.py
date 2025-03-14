from django.db import models
from django.utils import timezone
from app_fyp.models import Internship

class InternshipPosting(models.Model):
    internship = models.OneToOneField(Internship, on_delete=models.CASCADE, related_name='posting')
    posted_by_id = models.BigIntegerField()
    posted_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'internship_postings'
        indexes = [
            models.Index(fields=['posted_at']),
        ]

    def __str__(self):
        return f"{self.internship.title} posted by user {self.posted_by_id}"