class DatabaseRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'user_auth':
            return 'user_auth'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'user_auth':
            return 'user_auth'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        db1 = self.db_for_read(obj1.__class__)
        db2 = self.db_for_read(obj2.__class__)
        return db1 == db2 if db1 and db2 else None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'user_auth':
            return db == 'user_auth'
        return db == 'default'
