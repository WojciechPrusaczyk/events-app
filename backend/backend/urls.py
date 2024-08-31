"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import ForgotPassword
    2. Add a URL to urlpatterns:  path('', ForgotPassword.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from eventful import views
from rest_framework import routers


urlpatterns = [
    path('admin/clearcache/', include('clearcache.urls')),
    path("admin/", admin.site.urls),
    path("", views.index, name="index"),
    path("register/", views.index, name="register"),
    path("login/", views.index, name="login"),
    path("forgot_password/", views.index, name="forgot_password"),

    path("reset_password/<str:token>", views.view_reset_password, name="reset_password"),
    path("account_verification/<str:token>", views.view_account_verification, name="account_verification"),
    path("edit-event/<int:id>", views.editEvent, name="editEvent"),

    path("api/", views.viewAPI, name="view_api"),
    path("api/register/", views.register, name="api_register"),
    path("api/login/", views.login, name="api_login"),
    path("api/user/", views.user, name="api_user"),
    path("api/checkUsername/", views.checkUsername, name="api_check_user"),
    path("api/logout/", views.logout, name="api_logout"),
    path("api/logoutUsername/", views.logoutUsername, name="api_logout_username"),
    path("api/forgot_password/", views.forgot_password, name="api_forgot_password"),
    path("api/reset_password/", views.reset_password, name="api_reset_password"),
    path("api/create-event/", views.createEvent, name="api_create_event"),
    path("api/get-event/", views.getEvent, name="api_get_event"),
    path("api/edit-event/", views.editEventApi, name="api_edit_event"),
    path("api/search-users/", views.searchUsers, name="api_edit_event")
]

