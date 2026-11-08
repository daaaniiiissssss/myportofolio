from django.utils.html import strip_tags
from rest_framework import serializers

from main.models import Education, Experience


def clean_text(value, label):
    """Strip HTML tags and reject values that become empty (like Tugas 5)."""
    value = strip_tags(value).strip()
    if not value:
        raise serializers.ValidationError(f"{label} cannot be empty.")
    return value


class StarredModelSerializer(serializers.ModelSerializer):
    """
    Read-only star fields shared by every model that has `starred_by`.
    Only usernames are exposed, never email or password data.
    """

    star_count = serializers.SerializerMethodField()
    is_starred = serializers.SerializerMethodField()
    starred_by_names = serializers.SerializerMethodField()

    def get_star_count(self, obj):
        return obj.starred_by.count()

    def get_is_starred(self, obj):
        request = self.context.get("request")
        if request is None or not request.user.is_authenticated:
            return False
        return request.user in obj.starred_by.all()

    def get_starred_by_names(self, obj):
        return ", ".join(user.username for user in obj.starred_by.all())


class EducationSerializer(StarredModelSerializer):
    class Meta:
        model = Education
        fields = [
            "id", "school", "degree", "description",
            "started_at", "ended_at",
            "star_count", "is_starred", "starred_by_names",
        ]
        read_only_fields = ["id"]

    def validate_school(self, value):
        return clean_text(value, "School name")

    def validate_degree(self, value):
        return clean_text(value, "Degree")

    def validate_description(self, value):
        return clean_text(value, "Description")

    def validate(self, attrs):
        # Works for create, PUT, and PATCH (falls back to the saved value).
        started_at = attrs.get(
            "started_at", getattr(self.instance, "started_at", None)
        )
        ended_at = attrs.get(
            "ended_at", getattr(self.instance, "ended_at", None)
        )
        if started_at and ended_at and ended_at < started_at:
            raise serializers.ValidationError(
                {"ended_at": "End date cannot be before the start date."}
            )
        return attrs


class ExperienceSerializer(StarredModelSerializer):
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )
    is_ongoing = serializers.BooleanField(read_only=True)

    class Meta:
        model = Experience
        fields = [
            "id", "title", "description", "category", "category_display",
            "thumbnail", "started_at", "ended_at", "is_ongoing",
            "star_count", "is_starred", "starred_by_names",
        ]
        # started_at is auto_now_add, so clients can never set it.
        read_only_fields = ["id", "started_at"]

    def validate_title(self, value):
        return clean_text(value, "Title")

    def validate_description(self, value):
        return clean_text(value, "Description")