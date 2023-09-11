import os

HOST = os.environ.get('FLASK_RUN_HOST', 'localhost')
DATABASE_URI = os.environ.get('DATABASE_URI')  # default to localhost if not set
DEBUG = os.environ.get('FLASK_DEBUG', 1)
PORT = os.environ.get('FLASK_RUN_PORT', 5000)
