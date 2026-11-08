from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from main.models import Education, Experience
from main.permissions import IsPortfolioOwnerOrEditorOrReadOnly
from main.serializers import EducationSerializer, ExperienceSerializer


# ---------- shared helpers ----------

def _create(request, serializer_class):
    serializer = serializer_class(
        data=request.data, context={"request": request}
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


def _read_update_delete(request, instance, serializer_class):
    if request.method in ("GET", "HEAD"):
        serializer = serializer_class(instance, context={"request": request})
        return Response(serializer.data)

    if request.method == "DELETE":
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = serializer_class(
        instance,
        data=request.data,
        partial=request.method == "PATCH",
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


def _toggle_star(request, model, serializer_class, pk):
    # The starring account always comes from request.user.
    obj = get_object_or_404(model, pk=pk)

    if obj.starred_by.filter(pk=request.user.pk).exists():
        obj.starred_by.remove(request.user)
    else:
        obj.starred_by.add(request.user)

    return Response(serializer_class(obj, context={"request": request}).data)


# ---------- Education (Tutorial 07) ----------

@api_view(["GET", "HEAD", "POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsPortfolioOwnerOrEditorOrReadOnly])
def education_list(request):
    if request.method == "POST":
        return _create(request, EducationSerializer)

    queryset = Education.objects.prefetch_related(
        "starred_by"
    ).order_by("-started_at", "id")

    search = request.query_params.get("search", "").strip()
    if search:
        queryset = queryset.filter(
            Q(school__icontains=search)
            | Q(degree__icontains=search)
            | Q(description__icontains=search)
        )

    serializer = EducationSerializer(
        queryset, many=True, context={"request": request},
    )
    return Response(serializer.data)


@api_view(["GET", "HEAD", "PUT", "PATCH", "DELETE"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsPortfolioOwnerOrEditorOrReadOnly])
def education_detail(request, education_id):
    education = get_object_or_404(
        Education.objects.prefetch_related("starred_by"), pk=education_id,
    )
    return _read_update_delete(request, education, EducationSerializer)


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def education_star(request, education_id):
    return _toggle_star(request, Education, EducationSerializer, education_id)


# ---------- Experience (Tugas 6) ----------

@api_view(["GET", "HEAD", "POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsPortfolioOwnerOrEditorOrReadOnly])
def experience_list(request):
    if request.method == "POST":
        return _create(request, ExperienceSerializer)

    queryset = Experience.objects.prefetch_related(
        "starred_by"
    ).order_by("-started_at", "id")

    search = request.query_params.get("search", "").strip()
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search)
            | Q(description__icontains=search)
            | Q(category__icontains=search)
        )

    serializer = ExperienceSerializer(
        queryset, many=True, context={"request": request},
    )
    return Response(serializer.data)


@api_view(["GET", "HEAD", "PUT", "PATCH", "DELETE"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsPortfolioOwnerOrEditorOrReadOnly])
def experience_detail(request, experience_id):
    experience = get_object_or_404(
        Experience.objects.prefetch_related("starred_by"), pk=experience_id,
    )
    return _read_update_delete(request, experience, ExperienceSerializer)


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def experience_star(request, experience_id):
    return _toggle_star(
        request, Experience, ExperienceSerializer, experience_id
    )