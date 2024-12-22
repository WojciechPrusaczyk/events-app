from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Events

class StaticViewSitemap(Sitemap):
    priority = 0.5
    changefreq = 'daily'

    def items(self):
        return ['home', 'about', 'contact']

    def location(self, item):
        # Zwróć URL dla każdego widoku
        return reverse(item)

class EventSitemap(Sitemap):
    priority = 0.8
    changefreq = 'weekly'

    def items(self):
        return Events.objects.all()

    def lastmod(self, obj):
        return obj.updated_at