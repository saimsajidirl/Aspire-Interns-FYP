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
            'resume': forms.FileInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['resume'].widget.clear_checkbox_label = None
        self.fields['resume'].widget.initial_text = ""
        self.fields['resume'].widget.clear_checkbox_name = None