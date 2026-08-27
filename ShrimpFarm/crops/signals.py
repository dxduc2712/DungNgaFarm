from decimal import Decimal

from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from .models import FeedingRecord, InventoryItem, Feed


def _get_inventory_for_feed(feed):
    return InventoryItem.objects.filter(feed=feed).order_by("id").first()


def _deduct_inventory(feed, quantity_kg):
    item = _get_inventory_for_feed(feed)
    if not item:
        return
    deduct = int(Decimal(quantity_kg).quantize(Decimal("1")))
    item.quantity = max(0, item.quantity - deduct)
    item.save(update_fields=["quantity"])


def _restore_inventory(feed, quantity_kg):
    item = _get_inventory_for_feed(feed)
    if not item:
        return
    restore = int(Decimal(quantity_kg).quantize(Decimal("1")))
    item.quantity = item.quantity + restore
    item.save(update_fields=["quantity"])


@receiver(pre_save, sender=FeedingRecord)
def store_old_feeding_record(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = FeedingRecord.objects.get(pk=instance.pk)
            instance._old_quantity_kg = old.quantity_kg
            instance._old_feed_id = old.feed_id
        except FeedingRecord.DoesNotExist:
            instance._old_quantity_kg = None
            instance._old_feed_id = None
    else:
        instance._old_quantity_kg = None
        instance._old_feed_id = None


@receiver(post_save, sender=FeedingRecord)
def adjust_inventory_on_feeding_save(sender, instance, created, **kwargs):
    if created:
        _deduct_inventory(instance.feed, instance.quantity_kg)
        return

    old_qty = getattr(instance, "_old_quantity_kg", None)
    old_feed_id = getattr(instance, "_old_feed_id", None)
    if old_qty is None:
        return

    if old_feed_id and old_feed_id != instance.feed_id:
        old_feed = Feed.objects.get(pk=old_feed_id)
        _restore_inventory(old_feed, old_qty)
        _deduct_inventory(instance.feed, instance.quantity_kg)
    else:
        delta = Decimal(instance.quantity_kg) - Decimal(old_qty)
        if delta > 0:
            _deduct_inventory(instance.feed, delta)
        elif delta < 0:
            _restore_inventory(instance.feed, abs(delta))


@receiver(post_delete, sender=FeedingRecord)
def adjust_inventory_on_feeding_delete(sender, instance, **kwargs):
    _restore_inventory(instance.feed, instance.quantity_kg)
