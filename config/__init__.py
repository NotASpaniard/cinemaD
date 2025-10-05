"""
Compatibility shims loaded early when Django imports config package.

This file provides a fallback 'cgi' module in sys.modules when running
in environments where the stdlib 'cgi' might be missing or shadowed.
It is intentionally minimal and only created when the real module is
not importable.
"""
import sys
import types

try:
	import cgi as _cgi  # try real module
except Exception:
	# create a very small shim module exposing minimal attributes that
	# the app or third-party libs might reference (FieldStorage mostly).
	_cgi = types.ModuleType('cgi')

	class FieldStorageShim:
		def __init__(self, *args, **kwargs):
			self.value = None
		def getvalue(self, *args, **kwargs):
			return self.value

	_cgi.FieldStorage = FieldStorageShim
	# add minimal escape utilities
	def escape(s, quote=True):
		return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
	_cgi.escape = escape

	sys.modules['cgi'] = _cgi

