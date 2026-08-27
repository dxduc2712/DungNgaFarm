#include <WiFi.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <MQTTPubSubClient.h>

// --- WiFi ---
const char* wifi_name = "Duyen_Cute";
const char* pass = "ducdinhX@123";

// --- HiveMQ Cloud (MQTT over WebSocket TLS, port 8884) ---
const char* mqtt_host = "06a79f0e02dd47a79baef7b9fcabdb10.s1.eu.hivemq.cloud";
const uint16_t mqtt_port = 8884;
const char* mqtt_path = "/mqtt";
const char* mqtt_user = "dxduc";
const char* mqtt_password = "Password1!";
const char* mqtt_client_id = "esp32-shrimp-001";
const int POND_ID = 1;  // device pond 1 → Ao nuôi 1 (Django may use a different pk)

// --- Pins ---
#define RED_LED 19
#define BLUE_LED 22
#define DHT_PIN 4
#define DHT_TYPE DHT11

// --- MQTT topics ---
const char* TOPIC_TEMP = "shrimpfarm/sensor/temperature";
const char* TOPIC_LED_RED = "shrimpfarm/led/red";
const char* TOPIC_LED_BLUE = "shrimpfarm/led/blue";

// Placeholder values until pH / salinity sensors are connected (shrimp-pond safe range).
const float DEFAULT_PH = 7.8;
const float DEFAULT_SALINITY_PPT = 15.0;

// LetsEncrypt ISRG Root X1 — https://letsencrypt.org/certs/isrgrootx1.pem
static const char* root_ca PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
)EOF";

DHT dht(DHT_PIN, DHT_TYPE);
WebSocketsClient client;
MQTTPubSubClient mqtt;

unsigned long lastPublishMs = 0;
const unsigned long PUBLISH_INTERVAL = 5000;

void setLed(int pin, bool on) {
  digitalWrite(pin, on ? HIGH : LOW);
}

void handleLedCommand(const String& payload, int pin) {
  if (payload.equalsIgnoreCase("ON")) {
    setLed(pin, true);
  } else if (payload.equalsIgnoreCase("OFF")) {
    setLed(pin, false);
  }
}

void connectMqtt() {
  if (mqtt.isConnected()) {
    return;
  }

  Serial.print("MQTT connecting...");
  if (mqtt.connect(mqtt_client_id, mqtt_user, mqtt_password)) {
    Serial.println(" OK");
    // #region agent log
    Serial.println("[dbg] H1/H2 mqtt.connect success isConnected=1");
    // #endregion

    mqtt.subscribe(TOPIC_LED_RED, [](const String& payload, const size_t size) {
      handleLedCommand(payload, RED_LED);
    });

    mqtt.subscribe(TOPIC_LED_BLUE, [](const String& payload, const size_t size) {
      handleLedCommand(payload, BLUE_LED);
    });

    setLed(BLUE_LED, true);
    setLed(RED_LED, false);
  } else {
    Serial.println(" FAILED");
    // #region agent log
    Serial.print("[dbg] H2 mqtt.connect failed last_error=");
    Serial.println((int)mqtt.getLastError());
    // #endregion
    setLed(RED_LED, true);
    setLed(BLUE_LED, false);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RED_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  setLed(RED_LED, false);
  setLed(BLUE_LED, false);

  dht.begin();

  Serial.print("WiFi connecting...");
  WiFi.begin(wifi_name, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" OK");

  // HiveMQ Cloud WSS: path /mqtt, subprotocol mqtt, TLS via CA
  client.beginSslWithCA(mqtt_host, mqtt_port, mqtt_path, root_ca, "mqtt");
  client.setReconnectInterval(5000);
  // #region agent log
  Serial.println("[dbg] H3 beginSslWithCA host=hivemq path=/mqtt proto=mqtt");
  // #endregion

  mqtt.begin(client);
  connectMqtt();
}

void loop() {
  mqtt.update();

  if (!mqtt.isConnected()) {
    connectMqtt();
  }

  unsigned long now = millis();
  if (now - lastPublishMs < PUBLISH_INTERVAL) {
    return;
  }
  lastPublishMs = now;

  float tempC = dht.readTemperature();
  if (isnan(tempC)) {
    Serial.println("DHT11 read failed");
    setLed(RED_LED, true);
    setLed(BLUE_LED, false);
    return;
  }

  Serial.print("Temp: ");
  Serial.print(tempC);
  Serial.println(" C");

  StaticJsonDocument<256> doc;
  doc["pond"] = POND_ID;
  doc["temperature_c"] = tempC;
  doc["ph"] = DEFAULT_PH;
  doc["salinity_ppt"] = DEFAULT_SALINITY_PPT;
  doc["source"] = "iot";
  doc["device"] = mqtt_client_id;

  char payload[256];
  serializeJson(doc, payload);
  mqtt.publish(TOPIC_TEMP, payload);

  // Shrimp safe range from Django app: 26-32 C
  if (tempC < 26.0 || tempC > 32.0) {
    setLed(RED_LED, true);
    setLed(BLUE_LED, false);
  } else {
    setLed(RED_LED, false);
    setLed(BLUE_LED, true);
  }
}
