from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Events

class StaticViewSitemap(Sitemap):
    priority = 0.5
    changefreq = 'daily'

    def items(self):
        return [
            "index",
            "register",
            "login",
            "forgotPassword",
            "events_list",
            "join_event",
            "app",
        ]

    def location(self, item):
        # Zwróć URL dla każdego widoku
        return reverse(item)

class EventSitemap(Sitemap):
    priority = 0.8
    changefreq = 'weekly'

    def items(self):
        return Events.objects.all()

    def location(self, obj):
        return reverse("event_page", args=[obj.token])