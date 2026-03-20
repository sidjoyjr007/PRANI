import os
from celery import Celery
from celery.schedules import crontab
from config.settings import settings

# For now, we use Redis as both broker and backend. It's configured in settings.
celery_app = Celery(
    "prani_agents",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["engine.tasks"]
)

# Optional configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
)

# Configure Celery Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    'check-scheduled-deployments-frequent': {
        'task': 'engine.tasks.check_scheduled_deployments',
        'schedule': 10.0, # Run every 10 seconds for sub-minute granularity
    },
}
