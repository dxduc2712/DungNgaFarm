from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("crops", "0003_sensorreading"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="crop",
            options={"ordering": ["-start_date", "id"]},
        ),
        migrations.AlterModelOptions(
            name="farm",
            options={"ordering": ["name", "id"]},
        ),
        migrations.AlterModelOptions(
            name="feed",
            options={"ordering": ["name", "id"]},
        ),
        migrations.AlterModelOptions(
            name="feedingrecord",
            options={"ordering": ["-feeding_time", "-id"]},
        ),
        migrations.AlterModelOptions(
            name="inventoryitem",
            options={"ordering": ["id"]},
        ),
        migrations.AlterModelOptions(
            name="pond",
            options={"ordering": ["name", "id"]},
        ),
        migrations.AlterModelOptions(
            name="sensoralert",
            options={"ordering": ["-created_at", "-id"]},
        ),
        migrations.AlterModelOptions(
            name="sensorreading",
            options={"ordering": ["-recorded_at", "-id"]},
        ),
        migrations.AlterModelOptions(
            name="waterexchange",
            options={"ordering": ["-exchange_time", "-id"]},
        ),
        migrations.AlterModelOptions(
            name="watertreatment",
            options={"ordering": ["-treatment_time", "-id"]},
        ),
    ]
