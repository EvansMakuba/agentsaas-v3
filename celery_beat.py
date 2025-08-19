from celery import Celery
from celery.schedules import crontab

# We re-use the same Celery app instance defined in celery_app.py
from celery_app import celery

# This is where we define all our scheduled tasks.
celery.conf.beat_schedule = {
    # The name of the schedule entry
    'run-campaign-orchestrator-every-5-minutes': {
        # The name of the task to run (we will create this in tasks.py)
        'task': 'tasks.campaign_orchestrator',
        # The schedule. crontab(minute='*/5') means "run every 5 minutes".
        'schedule': crontab(minute='*/5'),
    },
    # We can add more scheduled tasks here in the future,
    # e.g., for syncing executor karma or analyzing performance.
}

celery.conf.timezone = 'UTC'