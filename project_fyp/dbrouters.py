# project_fyp/dbrouters.py
class DatabaseRouter:
    """
    A router to control database operations for models in different apps.
    - 'user_auth' app models and auth-related apps go to 'user_auth' database
    - 'app_fyp' app models go to 'default' (internships_list)
    """

    def db_for_read(self, model, **hints):
        if model._meta.app_label in ['user_auth', 'auth', 'admin', 'contenttypes', 'sessions']:
            return 'user_auth'
        elif model._meta.app_label == 'app_fyp':
            return 'default'
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label in ['user_auth', 'auth', 'admin', 'contenttypes', 'sessions']:
            return 'user_auth'
        elif model._meta.app_label == 'app_fyp':
            return 'default'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        db1 = self.db_for_read(obj1.__class__)
        db2 = self.db_for_read(obj2.__class__)
        if db1 and db2:
            return db1 == db2
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in ['user_auth', 'auth', 'admin', 'contenttypes', 'sessions']:
            return db == 'user_auth'
        elif app_label == 'app_fyp':
            return db == 'default'
        return False  # Prevent migrations for unhandled apps