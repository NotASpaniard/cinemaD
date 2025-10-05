from importlib import import_module

# Delegate to config.urls if present
try:
    config_urls = import_module('config.urls')
    urlpatterns = getattr(config_urls, 'urlpatterns', [])
except Exception:
    urlpatterns = []
