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
from eventful import api
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers


urlpatterns = [
    path('admin/clearcache/', include('clearcache.urls')),
    path("admin/", admin.site.urls),
    path("", views.index, name="index"),
    path("register/", views.index, name="register"),
    path("login/", views.index, name="login"),
    path("forgot-password/", views.index, name="forgotPassword"),
    path("events-list/", views.index, name="events_list"),
    path("join/", views.index, name="join_event"),


    path("reset-password/<str:token>", views.viewResetPassword, name="resetPassword"),
    path("account-verification/<str:token>", views.viewAccountVerification, name="accountVerification"),
    path("edit-event/<int:id>", views.editEvent, name="editEvent"),
    path("join/<str:code>", views.showEvent, name="show_event"),


    path("api/", api.viewAPI, name="view_api"),
    path("api/register/", api.register, name="api_register"),
    path("api/login/", api.login, name="api_login"),
    path("api/user/", api.user, name="api_user"),
    path("api/check-username/", api.checkUsername, name="api_check_user"),
    path("api/logout/", api.logout, name="api_logout"),
    path("api/logout-username/", api.logoutUsername, name="api_logout_username"),
    path("api/forgot-password/", api.forgotPassword, name="api_forgot_password"),
    path("api/reset-password/", api.resetPassword, name="api_reset_password"),
    path("api/create-event/", api.createEvent, name="api_create_event"),
    path("api/get-event/", api.getEvent, name="api_get_event"),
    path("api/get-events/", api.getEvents, name="api_get_events"),
    path("api/edit-event/", api.editEventApi, name="api_edit_event"),
    path("api/search-users/", api.searchUsers, name="api_search_users"),
    # path("api/upload-image/", api.uploadImage, name="api_upload_image")
    path("api/delete-event/", api.deleteEvent, name="api_delete_event"),
    path("api/get-segments/", api.getSegments, name="api_get_segments"),

                  # TODO: ścieżka api do usunięcia wydarzenia DONE
    # TODO: ścieżka api pobierająca wszystkie segmenty danego wydarzenia o podanym id DONE

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

