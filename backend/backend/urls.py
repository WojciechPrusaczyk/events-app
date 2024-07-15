"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from eventful import views
from rest_framework import routers


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.index, name="index"),
    path("register/", views.index, name="register"),
    path("login/", views.index, name="login"),
    #
    path("api/register/", views.register, name="api_register"),
    path("api/login/", views.login, name="api_login"),
    path("api/user/", views.user, name="api_user"),
    path("api/logout/", views.logout, name="api_logout"),
    path("api/create_event/", views.create_event, name="api_create_event"),
]
