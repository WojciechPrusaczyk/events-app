import sys, os

sys.path.append(os.getcwd())

os.environ['DJANGO_SETTINGS_MODULE'] = "backend.settings"  # Nazwa modułu z ustawieniami

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
