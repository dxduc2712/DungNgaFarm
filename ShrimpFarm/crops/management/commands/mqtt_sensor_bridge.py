from django.core.management.base import BaseCommand

from crops.models import Pond
from crops.mqtt_client import mqtt_configured, start_mqtt_subscriber


class Command(BaseCommand):
    help = "Subscribe to HiveMQ sensor topic and save readings (default pond 1)."

    def handle(self, *args, **options):
        if not mqtt_configured():
            self.stderr.write(
                "Set MQTT_HOST, MQTT_USER, and MQTT_PASSWORD in ShrimpFarm/.env"
            )
            return

        if not Pond.objects.filter(name="Ao nuôi 1").exists():
            self.stderr.write("Pond 'Ao nuôi 1' not found. Run seed_farm_data.")
            return

        start_mqtt_subscriber(blocking=True, stdout=self.stdout)
