from django.contrib import messages
from django.shortcuts import redirect, render

from main.forms import EducationForm
from main.models import Experience, Education


def show_main(request):
    context = {
        'name': 'Nauval Adiva Daneshwara',
        'npm': '2506623074',
        'study_program': 'Sistem Informasi',
        'bio': 'just a footballer that happens to choose CS major',
    }

    return render(request, 'index.html', context)


def show_experience(request):
    experience_list = Experience.objects.all()

    context = {
        'name': 'Nauval Adiva Daneshwara',
        'experience_list': experience_list,
    }

    return render(request, 'experience.html', context)

def show_education(request):
    education_list = Education.objects.all()
    context = {
        'name': 'Nauval Adiva Daneshwara',
        'education_list': education_list,
    }
    return render(request, 'education.html', context)

def create_education(request):
    form = EducationForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(
            request,
            "Pendidikan baru berhasil ditambahkan!"
        )
        return redirect("main:show_education")

    context = {
        "name": "Nauval Adiva Daneshwara",
        "form": form,
    }

    return render(request, "education_form.html", context)