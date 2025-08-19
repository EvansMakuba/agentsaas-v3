from celery import Celery
import os

# This is the crucial change. Instead of 'localhost', we use the service
# name 'redis' as defined in our docker-compose.yml file.
# Docker's internal DNS will resolve 'redis' to the correct container's IP address.
celery = Celery(
    'tasks',
    broker=os.environ.get("CELERY_BROKER_URL", "redis://redis:6379/0"),
    backend=os.environ.get("CELERY_RESULT_BACKEND", "redis://redis:6379/0"),
    include=['tasks']
)

# Optional configuration
celery.conf.update(
    result_expires=3600,
)

if __name__ == '__main__':
    celery.start()