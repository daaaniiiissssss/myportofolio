from django.shortcuts import render
from main.models import Experience


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