from django.contrib import messages
from django.shortcuts import redirect, render, get_object_or_404
from django.core import serializers
from django.http import HttpResponse

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
    response = get_education_json(request)

    education_data = serializers.deserialize(
        "json",
        response.content
    )

    education_list = []

    for item in education_data:
        education_list.append(item.object)

    context = {
        "name": "Nauval Adiva Daneshwara",
        "education_list": education_list,
    }

    return render(
        request,
        "education.html",
        context
    )

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

def update_education(request, id):
    education = get_object_or_404(Education, id=id)

    if request.method == "POST":
        form = EducationForm(request.POST, instance=education)

        if form.is_valid():
            form.save()
            return redirect("main:show_education")

    else:
        form = EducationForm(instance=education)

    context = {
        "name": "Nauval Adiva Daneshwara",
        "form": form,
        "education": education,
    }

    return render(request, "education_form.html", context)

def delete_education(request, id):
    education = get_object_or_404(Education, id=id)

    if request.method == "POST":
        education.delete()

        messages.success(
            request,
            "Pendidikan berhasil dihapus!"
        )

    return redirect("main:show_education")

def get_education_json(request):
    education_list = Education.objects.all()

    data = serializers.serialize(
        "json",
        education_list
    )

    return HttpResponse(
        data,
        content_type="application/json"
    )