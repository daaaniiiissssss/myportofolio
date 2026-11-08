from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from main.models import Experience, Education


class MainTest(TestCase):
    def setUp(self):
        self.experience = Experience.objects.create(
            title="Pengalaman Test",
            description="Deskripsi pengalaman untuk testing.",
            category="part-time",
        )

    def test_main_url_is_accessible(self):
        response = self.client.get(reverse("main:show_main"))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "index.html")
        self.assertNotContains(response, self.experience.title)
        self.assertContains(
            response,
            f'href="{reverse("main:show_experience")}"'
        )

    def test_main_url_is_not_found(self):
        response = self.client.get("/url-yang-tidak-ada/")

        self.assertEqual(response.status_code, 404)

    def test_experience_model(self):
        self.assertEqual(
            self.experience.title,
            "Pengalaman Test"
        )
        self.assertEqual(
            self.experience.description,
            "Deskripsi pengalaman untuk testing."
        )
        self.assertEqual(
            self.experience.category,
            "part-time"
        )
        self.assertTrue(self.experience.is_ongoing)

    def test_experience_page_is_accessible(self):
        response = self.client.get(
            reverse("main:show_experience")
        )

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "experience.html")
        # Cards are loaded from the API, so check the hook the script uses.
        self.assertContains(
            response,
            f'data-list-url="{reverse("api:experience-list")}"'
        )
        self.assertContains(
            response,
            f'href="{reverse("main:show_main")}"'
        )

    def test_completed_experience(self):
        self.experience.ended_at = timezone.now()
        self.experience.save()

        self.assertFalse(self.experience.is_ongoing)


class EducationViewTest(TestCase):

    def test_education_url_and_template(self):
        response = self.client.get(
            reverse("main:show_education")
        )

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "education.html")
        # Cards are loaded from the API, so check the hook the script uses.
        self.assertContains(
            response,
            f'data-list-url="{reverse("api:education-list")}"'
        )

    def test_education_data_appears(self):
        education = Education.objects.create(
            school="Universitas Indonesia",
            degree="Sistem Informasi",
            description="Program studi Sistem Informasi di Fakultas Ilmu Komputer.",
            started_at="2025-08-01",
            ended_at=None
        )

        # The page loads its cards from the API, so verify the API data.
        response = self.client.get(
            reverse("api:education-list")
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["school"], education.school)
        self.assertEqual(response.data[0]["degree"], education.degree)
        self.assertEqual(
            response.data[0]["description"],
            education.description
        )

    def test_education_empty_state(self):
        response = self.client.get(
            reverse("api:education-list")
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])