from django.urls import path

from main import api_views

app_name = "api"

urlpatterns = [
    # Education (Tutorial 07)
    path("education/", api_views.education_list, name="education-list"),
    path(
        "education/<int:education_id>/",
        api_views.education_detail,
        name="education-detail",
    ),
    path(
        "education/<int:education_id>/star/",
        api_views.education_star,
        name="education-star",
    ),

    # Experience (Tugas 6)
    path("experiences/", api_views.experience_list, name="experience-list"),
    path(
        "experiences/<uuid:experience_id>/",
        api_views.experience_detail,
        name="experience-detail",
    ),
    path(
        "experiences/<uuid:experience_id>/star/",
        api_views.experience_star,
        name="experience-star",
    ),
]