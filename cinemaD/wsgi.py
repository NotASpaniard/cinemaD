import os
from importlib import import_module

# Make sure config settings are available
os.environ.setdefault('DJANGO_SETTINGS_MODULE', os.getenv('DJANGO_SETTINGS_MODULE', 'config.settings'))

# Delegate to config.wsgi
config_wsgi = import_module('config.wsgi')
application = getattr(config_wsgi, 'application', None)
