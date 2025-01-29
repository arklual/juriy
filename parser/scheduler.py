import logging

from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime
from pytz import timezone
from main import main_scraper

def scheduled_job():
    print(f"Scraper started at {datetime.now()}")
    logging.info('scheduler starting work')
    main_scraper()
    scheduler.add_job(scheduled_job, replace_existing=True)  # Перезапускаем после завершения

if __name__ == "__main__":
    moscow_tz = timezone("Europe/Moscow")
    scheduler = BlockingScheduler(timezone=moscow_tz)
    scheduler.add_job(scheduled_job)  # Первый запуск

    print("Scheduler started. Waiting for the next job...")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("Scheduler stopped.")
