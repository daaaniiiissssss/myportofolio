from django.urls import path
from main.views import (
    show_main,
    show_experience,
    show_education,
    create_education,
    create_education_ajax,
    update_education,
    update_education_ajax,
    delete_education,
    get_education_json,
    register,
    login_user,
    logout_user,
    toggle_star,
    delete_education_ajax,
)

app_name = "main"

urlpatterns = [
    path("", show_main, name="show_main"),
    path("experience/", show_experience, name="show_experience"),
    path("education/", show_education, name="show_education"),
    path(
        "education/add/",
        create_education,
        name="create_education"
    ),
    path(
        "education/<int:id>/edit/",
        update_education,
        name="update_education"
    ),
    path(
        "education/<int:id>/delete/",
        delete_education,
        name="delete_education"
    ),

    path(
    "api/education/",
    get_education_json,
    name="get_education_json"
    ),

    path(
    "register/", 
    register, 
    name="register"
    ),

    path(
    "login/", 
    login_user, 
    name="login"
    ),

    path(
    "logout/", 
    logout_user, 
    name="logout"
    ),

    path(
    "education/<int:id>/star/",
    toggle_star,
    name="toggle_star"
    ),

    path(
    "education/add-ajax/",
    create_education_ajax,
    name="create_education_ajax"
    ),

    path(
    "education/<int:id>/edit-ajax/",
    update_education_ajax,
    name="update_education_ajax"
    ),

    path(
    "education/<int:id>/delete-ajax/",
    delete_education_ajax,
    name="delete_education_ajax"
    ),
]