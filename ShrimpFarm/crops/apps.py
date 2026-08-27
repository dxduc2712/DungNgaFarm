from django.apps import AppConfig


class CropsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "crops"
    verbose_name = "Quản lý hồ tôm"

    def ready(self):
        import crops.signals  # noqa: F401
        from crops.mqtt_client import start_mqtt_subscriber_in_process

        start_mqtt_subscriber_in_process()
