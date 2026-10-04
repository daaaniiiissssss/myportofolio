from django import forms
from main.models import Education
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags


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

    def clean_school(self):
        school = strip_tags(
            self.cleaned_data["school"]
        ).strip()

        if not school:
            raise ValidationError(
                "Nama sekolah tidak boleh hanya berisi tag HTML."
            )

        return school

    def clean_degree(self):
        return strip_tags(
            self.cleaned_data["degree"]
        ).strip()

    def clean_description(self):
        return strip_tags(
            self.cleaned_data["description"]
        ).strip()