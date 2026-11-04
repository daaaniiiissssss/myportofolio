from django.utils.html import strip_tags
from rest_framework import serializers

from main.models import Education


class EducationSerializer(serializers.ModelSerializer):
    star_count = serializers.SerializerMethodField()
    is_starred = serializers.SerializerMethodField()
    starred_by_names = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = [
            "id", "school", "degree", "description",
            "started_at", "ended_at",
            "star_count", "is_starred", "starred_by_names",
        ]
        read_only_fields = ["id"]

    def validate_school(self, value):
        value = strip_tags(value).strip()
        if not value:
            raise serializers.ValidationError(
                "School name cannot be empty."
            )
        return value

    def validate_degree(self, value):
        value = strip_tags(value).strip()
        if not value:
            raise serializers.ValidationError("Degree cannot be empty.")
        return value

    def validate_description(self, value):
        value = strip_tags(value).strip()
        if not value:
            raise serializers.ValidationError(
                "Description cannot be empty."
            )
        return value

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

    def get_star_count(self, obj):
        return obj.starred_by.count()

    def get_is_starred(self, obj):
        request = self.context.get("request")
        if request is None or not request.user.is_authenticated:
            return False
        return request.user in obj.starred_by.all()

    def get_starred_by_names(self, obj):
        return ", ".join(user.username for user in obj.starred_by.all())