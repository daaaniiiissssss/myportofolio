from django import forms
from main.models import Education


class EducationForm(forms.ModelForm):
    class Meta:
        model = Education
        fields = [
            "school",
            "degree",
            "description",
            "started_at",
            "ended_at",
        ]

        labels = {
            "school": "Nama Sekolah/Universitas",
            "degree": "Program Pendidikan",
            "description": "Deskripsi",
            "started_at": "Tanggal Mulai",
            "ended_at": "Tanggal Selesai",
        }

        widgets = {
            "school": forms.TextInput(
                attrs={
                    "placeholder": "Isi nama sekolah/universitasmu",
                    "maxlength": 255,
                }
            ),
            "degree": forms.TextInput(
                attrs={
                    "placeholder": "Isi program pendidikanmu",
                    "maxlength": 255,
                }
            ),
            "description": forms.Textarea(
                attrs={
                    "placeholder": "Ceritakan pendidikanmu",
                    "rows": 3,
                }
            ),
            "started_at": forms.DateInput(
                attrs={
                    "type": "date",
                }
            ),
            "ended_at": forms.DateInput(
                attrs={
                    "type": "date",
                }
            ),
        }