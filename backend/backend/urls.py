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
import os

from django.contrib import admin
from django.urls import path, include
from eventfull import views
from eventfull import api
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from django.views.generic import TemplateView
from django.views.static import serve

handler403 = "eventfull.views.error_403"
handler404 = "eventfull.views.error_404"
handler500 = "eventfull.views.error_500"

urlpatterns = [
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
    path("edit-segments/<int:id>", views.editSegments, name="editSegments"),
    path("join/<str:code>", views.showEvent, name="show_event"),
    path("event/<str:eventToken>", views.eventPage, name="event_page"),

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
    path("api/delete-event/", api.deleteEvent, name="api_delete_event"),
    path("api/get-segments/", api.getSegments, name="api_get_segments"),
    path("api/create-segment/", api.createSegment, name="api_create_segment"),
    path("api/edit-segment/", api.editSegment, name="api_edit_segment"),
    path("api/delete-segment/", api.deleteSegment, name="api_delete_segment"),
    path("api/send-event-request/", api.sendEventRequest, name="api_send_event_request"),
    path("api/accept-user", api.acceptUser, name="api_join_event"),
    path("api/get-notifications", api.getNotifications, name="api_get_notifications"),
    path("api/leaveEvent/", api.leaveEvent, name="api_leave_event"),
    path("api/get-events-by-keywords/", api.getEventsByKeywords, name="api_get_events_by_keyword"),

                  # TODO: punkt api acceptUser, na wejściu podaję listę, LUB  jednego użytkownika do zaakceptowania do eventu
    # TODO: dodawać do get-events do każdego eventu flagę, czy dany użytkownik jest juś dodany do danego eventu
    re_path(r'^favicon\.ico$', serve, {'path': 'favicon.ico', 'document_root': os.path.join(settings.BASE_DIR, '../frontend/build')}),
    re_path(r'^logo192\.png$', serve, {'path': 'logo192.png', 'document_root': os.path.join(settings.BASE_DIR, '../frontend/build')}),
    re_path(r'^logo512\.png$', serve, {'path': 'logo512.png', 'document_root': os.path.join(settings.BASE_DIR, '../frontend/build')}),
    re_path(r'^manifest\.json$', serve, {'path': 'manifest.json', 'document_root': os.path.join(settings.BASE_DIR, '../frontend/build')}),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)