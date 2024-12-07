from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime
from main import main_scraper

def scheduled_job():
    print(f"Scraper started at {datetime.now()}")
    main_scraper()

if __name__ == "__main__":
    scheduler = BlockingScheduler()
    scheduler.add_job(scheduled_job, 'cron', hour='6,18')  # Запуск в 6:00 и 18:00
    print("Scheduler started. Waiting for the next job...")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("Scheduler stopped.")
