from django.contrib import messages
from django.shortcuts import redirect, render, get_object_or_404
from django.core import serializers
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from django.views.decorators.http import require_POST

from main.forms import EducationForm
from main.models import Experience, Education

import datetime


def show_main(request):
    last_login = request.COOKIES.get(
        "last_login",
        "Belum ada sesi login / Cookie tidak ditemukan"
    )

    context = {
        'name': 'Nauval Adiva Daneshwara',
        'npm': '2506623074',
        'study_program': 'Sistem Informasi',
        'bio': 'just a footballer that happens to choose CS major',
        'last_login': last_login,
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
    is_editor = request.user.groups.filter(name="Editor").exists()

    context = {
        "name": "Nauval Adiva Daneshwara",
        "is_editor": is_editor,
        "is_authenticated": request.user.is_authenticated,
        "is_superuser": request.user.is_superuser,
    }

    return render(request, "education.html", context)

@require_POST
def create_education_ajax(request):
    if not request.user.is_superuser:
        return JsonResponse(
            {
                "message": "Hanya pemilik portofolio yang dapat menambahkan pendidikan."
            },
            status=403,
        )

    form = EducationForm(request.POST)

    if form.is_valid():
        education = form.save()

        return JsonResponse(
            {
                "message": "Pendidikan berhasil ditambahkan.",
                "id": str(education.id),
            },
            status=201,
        )

    return JsonResponse(
        {
            "errors": form.errors.get_json_data()
        },
        status=400,
    )

@require_POST
def update_education_ajax(request, id):
    is_editor = request.user.groups.filter(
        name="Editor"
    ).exists()

    if not request.user.is_superuser and not is_editor:
        return JsonResponse(
            {
                "message": "Kamu tidak memiliki izin untuk mengedit pendidikan."
            },
            status=403,
        )

    education = get_object_or_404(Education, id=id)

    form = EducationForm(
        request.POST,
        instance=education
    )

    if form.is_valid():
        form.save()

        return JsonResponse(
            {
                "message": "Pendidikan berhasil diperbarui.",
                "id": str(education.id),
            },
            status=200,
        )

    return JsonResponse(
        {
            "errors": form.errors.get_json_data()
        },
        status=400,
    )

@login_required(login_url="/login/")
def create_education(request):
    if not request.user.is_superuser:
        raise PermissionDenied

    form = EducationForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Pendidikan baru berhasil ditambahkan!")
        return redirect("main:show_education")

    context = {
        "name": "Nauval Adiva Daneshwara",
        "form": form,
    }
    return render(request, "education_form.html", context)

@login_required(login_url="/login/")
def update_education(request, id):
    is_editor = request.user.groups.filter(name="Editor").exists()

    if not request.user.is_superuser and not is_editor:
        raise PermissionDenied

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

@login_required(login_url="/login/")
def delete_education(request, id):
    if not request.user.is_superuser:
        raise PermissionDenied

    education = get_object_or_404(Education, id=id)

    if request.method == "POST":
        education.delete()
        messages.success(request, "Pendidikan berhasil dihapus!")

    return redirect("main:show_education")

def get_education_json(request):
    search = request.GET.get("search", "").strip()

    education_list = Education.objects.all()

    if search:
        education_list = education_list.filter(
            Q(school__icontains=search)
            | Q(degree__icontains=search)
            | Q(description__icontains=search)
        )

    data = []

    for education in education_list:
        data.append({
            "id": str(education.id),
            "school": education.school,
            "degree": education.degree,
            "description": education.description,
            "started_at": education.started_at.isoformat(),
            "ended_at": (
                education.ended_at.isoformat()
                if education.ended_at
                else None
            ),
            "star_count": education.starred_by.count(),
            "is_starred": (
                education.starred_by.filter(
                    id=request.user.id
                ).exists()
                if request.user.is_authenticated
                else False
            ),
        })

    return JsonResponse(data, safe=False)

def register(request):
    form = UserCreationForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Akun berhasil dibuat. Silakan login.")
        return redirect("main:login")

    context = {
        "name": "Nauval Adiva Daneshwara",
        "form": form,
    }

    return render(request, "register.html", context)

def login_user(request):
    form = AuthenticationForm(request, data=request.POST or None)

    if request.method == "POST" and form.is_valid():
        user = form.get_user()
        login(request, user)

        response = redirect("main:show_main")
        response.set_cookie(
            "last_login",
            datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        return response

    context = {
        "name": "Nauval Adiva Daneshwara",
        "form": form,
    }

    return render(request, "login.html", context)

def logout_user(request):
    logout(request)

    response = redirect("main:show_main")
    response.delete_cookie("last_login")

    return response

@login_required(login_url="/login/")
def toggle_star(request, id):
    education = get_object_or_404(Education, id=id)

    if request.method != "POST":
        raise PermissionDenied

    if education.starred_by.filter(id=request.user.id).exists():
        education.starred_by.remove(request.user)
        is_starred = False
    else:
        education.starred_by.add(request.user)
        is_starred = True

    return JsonResponse({
        "is_starred": is_starred,
        "star_count": education.starred_by.count(),
    })

@require_POST
def delete_education_ajax(request, id):
    if not request.user.is_superuser:
        return JsonResponse(
            {
                "message": "Hanya pemilik portofolio yang dapat menghapus pendidikan."
            },
            status=403,
        )

    education = get_object_or_404(Education, id=id)

    education.delete()

    return JsonResponse(
        {
            "message": "Pendidikan berhasil dihapus.",
            "id": str(id),
        },
        status=200,
    )