from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from pytz import timezone  # Для работы с часовыми поясами
from main import main_scraper

def scheduled_job():
    print(f"Scraper started at {datetime.now()}")
    main_scraper()

if __name__ == "__main__":
    moscow_tz = timezone("Europe/Moscow")  # Московский часовой пояс (UTC+3)
    scheduler = BlockingScheduler(timezone=moscow_tz)  # Указываем временную зону для планировщика
    
    # Добавляем задачу с учетом временной зоны
    scheduler.add_job(scheduled_job, CronTrigger(hour=18, minute=50, timezone=moscow_tz))
    
    print("Scheduler started. Waiting for the next job...")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("Scheduler stopped.")
