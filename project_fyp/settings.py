from datetime import timedelta
from pathlib import Path
from django.contrib import messages


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-ojya)yg##)4#h6ba5xwvph+rviha%e5-#u^06pxb_7y3!1*=#f'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

ASGI_APPLICATION = 'project_fyp.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {"hosts": [('127.0.0.1', 6379)]},
    },
}
INSTALLED_APPS = [
    'channels', 
    'chat_aspire.apps.ChatAspireConfig',
    'rest_framework',
    'app_fyp.apps.AppFypConfig',
    'internship_posting.apps.InternshipPostingConfig',
    'user_auth.apps.UserAuthConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'project_fyp.urls'
CSRF_COOKIE_SECURE = False
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

MESSAGE_TAGS = {
    messages.SUCCESS: 'bg-green-500 text-white p-4 rounded',
    messages.ERROR: 'bg-red-500 text-white p-4 rounded',
}

WSGI_APPLICATION = 'project_fyp.wsgi.application'

DATABASE_ROUTERS = ['project_fyp.dbrouters.DatabaseRouter']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'internships_list',
        'USER': 'postgres',
        'PASSWORD': 'Saim123@?',
        'HOST': 'localhost',
        'PORT': '5432',
    },
    'user_auth': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'user_auth',  
        'USER': 'postgres',
        'PASSWORD': 'Saim123@?',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend', 
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = 'user_auth.User'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [

    BASE_DIR / 'app_fyp' / 'static',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # Example for Gmail
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'saimsajidirl@gmail.com'  # Your email
EMAIL_HOST_PASSWORD = 'sausuoqaxgiivkeb '  # App-specific password for Gmail
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER