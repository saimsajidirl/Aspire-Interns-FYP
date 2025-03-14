from django import forms
from user_auth.models import UserProfile

class ProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['full_name', 'skills', 'education', 'resume', 'linkedin', 'projects']
        widgets = {
            'skills': forms.Textarea(attrs={'rows': 3}),
            'education': forms.Textarea(attrs={'rows': 3}),
            'projects': forms.Textarea(attrs={'rows': 3}),
        }