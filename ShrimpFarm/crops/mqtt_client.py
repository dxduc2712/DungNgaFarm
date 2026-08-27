import json
import logging
import os
import socket
import ssl
import sys
import threading
import time

from django.conf import settings
from django.db import close_old_connections
from django.utils import timezone

from crops.models import Pond, SensorReading
from crops.sensor_alerts import create_sensor_alerts_for_reading

logger = logging.getLogger(__name__)

_started = False


def resolve_pond(pond_id, default_pond_id):
    pond = Pond.objects.filter(pk=pond_id).first()
    if pond:
        return pond
    # Device "pond": 1 means first grow pond (Ao nuôi 1), not always Django pk=1
    if pond_id == 1:
        pond = Pond.objects.filter(name="Ao nuôi 1").first()
        if pond:
            return pond
        pond = Pond.objects.filter(pond_type=Pond.PondType.GROW).order_by("id").first()
        if pond:
            return pond
    pond = Pond.objects.filter(pk=default_pond_id).first()
    if not pond:
        raise Pond.DoesNotExist(f"Pond id={pond_id}")
    return pond


def save_mqtt_payload(payload, default_pond_id):
    pond_id = payload.get("pond", default_pond_id)
    pond = resolve_pond(pond_id, default_pond_id)
    reading = SensorReading.objects.create(
        pond=pond,
        ph=payload.get("ph", 7.8),
        salinity_ppt=payload.get("salinity_ppt", 15.0),
        temperature_c=payload["temperature_c"],
        recorded_at=timezone.now(),
        source=SensorReading.Source.IOT,
    )
    create_sensor_alerts_for_reading(reading)
    return reading


def mqtt_configured():
    return bool(settings.MQTT_HOST and settings.MQTT_USER and settings.MQTT_PASSWORD)


def start_mqtt_subscriber(blocking=False, stdout=None):
    """Subscribe to HiveMQ. blocking=True for manage.py; False starts paho's loop thread."""
    import paho.mqtt.client as mqtt

    if not mqtt_configured():
        raise RuntimeError("Set MQTT_HOST, MQTT_USER, and MQTT_PASSWORD in .env")

    host = settings.MQTT_HOST
    port = settings.MQTT_PORT
    topic = settings.MQTT_TOPIC
    default_pond_id = settings.MQTT_DEFAULT_POND_ID

    def log(message):
        print(message, flush=True)
        if stdout:
            stdout.write(message)
        logger.info(message)

    def log_err(message):
        print(message, flush=True)
        if stdout:
            stdout.write(message)
        logger.error(message)

    def on_connect(client, userdata, flags, reason_code, properties):
        if reason_code.is_failure:
            log_err(f"MQTT connect failed: {reason_code}")
            return
        client.subscribe(topic)
        log(f"Subscribed to {topic}")

    def on_disconnect(client, userdata, flags, reason_code, properties):
        log_err(f"MQTT disconnected: {reason_code}")

    def on_message(client, userdata, msg):
        close_old_connections()
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            log_err(f"Bad MQTT payload: {exc}")
            return

        try:
            reading = save_mqtt_payload(payload, default_pond_id)
        except Pond.DoesNotExist:
            log_err(f"Unknown pond id={payload.get('pond', default_pond_id)}")
            return
        except (KeyError, TypeError, ValueError) as exc:
            log_err(f"Invalid reading: {exc} payload={payload}")
            return

        log(
            f"Saved {reading.pond.name}: {reading.temperature_c}°C "
            f"pH={reading.ph} S={reading.salinity_ppt}"
        )

    client = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2,
        client_id=settings.MQTT_CLIENT_ID,
    )
    client.username_pw_set(settings.MQTT_USER, settings.MQTT_PASSWORD)
    client.tls_set(cert_reqs=ssl.CERT_REQUIRED)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message
    client.reconnect_delay_set(min_delay=1, max_delay=30)
    client.connect_async(host, port, keepalive=60)

    log(f"MQTT bridge → {host}:{port} topic={topic} default pond={default_pond_id}")

    if blocking:
        while True:
            try:
                # retry_first_connection: Render DNS is often not ready at boot
                client.loop_forever(retry_first_connection=True)
            except (OSError, socket.gaierror, TimeoutError) as exc:
                log_err(
                    f"MQTT connection error ({host}:{port}): {exc}; retry in 5s"
                )
                time.sleep(5)
        return client

    client.loop_start()
    return client


_SKIP_MQTT_COMMANDS = {
    "migrate",
    "makemigrations",
    "collectstatic",
    "createsuperuser",
    "shell",
    "test",
    "mqtt_sensor_bridge",
    "seed_farm_data",
}


def _should_start_mqtt_in_process():
    argv = sys.argv
    if any(command in argv for command in _SKIP_MQTT_COMMANDS):
        return False
    # Django runserver parent process (reloader) must not open a second MQTT client.
    if "runserver" in argv and os.environ.get("RUN_MAIN") != "true":
        return False
    return True


def start_mqtt_subscriber_in_process():
    """Start once from AppConfig.ready() (runserver child or gunicorn)."""
    global _started
    if _started:
        return
    if not mqtt_configured():
        print("MQTT not configured; pond IoT readings will not be saved", flush=True)
        logger.warning("MQTT not configured; pond IoT readings will not be saved")
        return
    if not _should_start_mqtt_in_process():
        return

    def _run():
        while True:
            try:
                start_mqtt_subscriber(blocking=True)
            except Exception as exc:
                print(f"MQTT thread crashed: {exc}; retry in 10s", flush=True)
                logger.exception("MQTT thread crashed")
                time.sleep(10)

    _started = True
    thread = threading.Thread(
        target=_run,
        name="mqtt-sensor-bridge",
        daemon=True,
    )
    thread.start()
    print("MQTT sensor subscriber thread started", flush=True)
    logger.info("MQTT sensor subscriber thread started")
