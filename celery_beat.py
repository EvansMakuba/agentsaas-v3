from celery import Celery
from celery.schedules import crontab

# We re-use the same Celery app instance defined in celery_app.py
from celery_app import celery

# This is where we define all our scheduled tasks.
celery.conf.beat_schedule = {
    'run-campaign-orchestrator-every-5-minutes': {
        'task': 'tasks.campaign_orchestrator',
        'schedule': crontab(minute='*/5'),
    },
    # --- FUTURE ADDITIONS ---
    # 'sync-executor-karma-every-hour': {
    #     'task': 'tasks.sync_all_executor_karma', # A new task we would create
    #     'schedule': crontab(minute='0'), # Runs at the start of every hour
    # },
    # 'analyze-engagement-velocity-every-30-minutes': {
    #     'task': 'tasks.analyze_engagement_velocity', # Another new task
    #     'schedule': crontab(minute='*/30'),
    # },
}

celery.conf.timezone = 'UTC'