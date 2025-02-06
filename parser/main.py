import datetime
from multiprocessing.pool import ThreadPool
import psycopg2
from pydantic import BaseModel
import requests
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup as BS
import time
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
import json
import logging
import pandas as pd
import re
import urllib.parse
from threading import Lock

# Константы
DELTA = 0.3
WB_BASE_LINK = 'https://www.wildberries.ru/catalog/0/search.aspx'

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Глобальные переменные для драйвера и блокировки
driver_lock = Lock()
driver_instance = None

def get_driver():
  """Инициализация WebDriver с блокировкой."""
  global driver_instance
  with driver_lock:
    if driver_instance is None:
      options = webdriver.FirefoxOptions()
      options.add_argument('--headless')
      options.add_argument('--disable-gpu')
      driver_instance = webdriver.Firefox(options=options, service=webdriver.FirefoxService(executable_path="/usr/local/bin/geckodriver"))
      logger.info("WebDriver initialized.")
  return driver_instance

def close_driver():
  """Закрытие WebDriver с блокировкой."""
  global driver_instance
  with driver_lock:
    if driver_instance is not None:
      driver_instance.quit()
      driver_instance = None
      logger.info("WebDriver closed.")

def create_table():
  """Создание таблицы в базе данных."""
  conn = get_db_connection()
  cur = conn.cursor()
  cur.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            category VARCHAR(255),
            name VARCHAR(255),
            url TEXT UNIQUE,
            last_price INTEGER,
            price INTEGER,
            img_src TEXT,
            status VARCHAR(50) DEFAULT 'not added'
        )
    """)
  conn.commit()
  cur.close()
  conn.close()

def get_db_connection():
  """Установка соединения с базой данных."""
  conn = psycopg2.connect(
    dbname='postgres',
    user='postgres',
    password='postgres',
    host='pgdb',
    port='5432'
  )
  return conn

def read_items():
  """Чтение всех товаров из базы данных."""
  conn = get_db_connection()
  cur = conn.cursor()
  cur.execute("SELECT * FROM items")
  items = cur.fetchall()
  cur.close()
  conn.close()
  return items

def write_items(items):
  """Запись товаров в базу данных."""
  conn = get_db_connection()
  cur = conn.cursor()
  for item in items:
    cur.execute("""
            INSERT INTO items (category, name, url, last_price, price, img_src)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (url) DO UPDATE SET
                last_price = EXCLUDED.last_price,
                price = EXCLUDED.price,
                img_src = EXCLUDED.img_src
        """, (item['category'], item['name'], item['url'], item['last_price'], item['price'], item['img_src']))
  conn.commit()
  cur.close()
  conn.close()

def parse_cat_page(url, cat_name, all_items, cat_real_name):
  """Парсинг страницы категории."""
  try:
    driver = get_driver()
    driver.get(url)

    # Прокрутка для загрузки всех элементов
    for _ in range(30):
      ActionChains(driver).send_keys(Keys.SPACE).perform()
      time.sleep(0.5)

    time.sleep(3)
    response = driver.page_source
    soup = BS(response, 'html.parser')
    cards = soup.find_all("div", {"class": "product-card__wrapper"})
    result = []

    existing_items = {item[3]: item for item in all_items if len(item) >= 4}

    if cards:
      for card in cards:
        try:
          name = card.find('a', {'class': 'product-card__link'}).get("aria-label")
          url = card.find('a', {'class': 'product-card__link'}).get("href")
          price_element = card.find('ins', {'class': 'price__lower-price'})
          if not price_element:
            continue
          price = price_element.text
          image = card.find("img", {'class': 'j-thumbnail'})['src']

          real_price = int(''.join(filter(str.isdigit, price)))
          if not real_price:
            continue

          if url in existing_items:
            db_item = existing_items[url]
            last_price = db_item[4] if len(db_item) > 4 else 0
            last_price_db = db_item[5] if len(db_item) > 5 else 0

            if (int(last_price_db) > int(last_price) * (1 - DELTA) > int(real_price)) or (int(last_price_db) * (1 - DELTA) > int(last_price) > int(real_price)):
              response = requests.post(
                'http://backend:8080/api/create_card',
                json={'name': name, 'price': str(real_price), 'img': image, 'target_url': url, 'category': cat_real_name, 'shutdown_time': (datetime.date.today() + datetime.timedelta(days=3)).strftime("%d-%m-%Y")},
                headers={"Content-Type": "application/json"}
              )
              time.sleep(1)
              logger.warning(f"Response status: {response.status_code}")

          result.append({
            'category': cat_name,
            'name': name,
            'url': url,
            'last_price': last_price if url in existing_items else 0,
            'price': real_price,
            'img_src': image
          })

        except Exception as e:
          logger.error(f"Error processing card: {e}")
          continue

    return result

  except Exception as e:
    logger.critical(f"General error: {e}", exc_info=True)
    return []

def process_word(args):
  """Обработка одного слова."""
  s, cnt, all_items = args
  pages = 1
  start_page = (cnt - 1) * pages + 1
  end_page = cnt * pages
  logger.warning(f"Processing {s} (page: {start_page}-{end_page})")
  encoded_s = urllib.parse.quote(s)
  parsed_items = []
  for i in range(start_page, end_page + 1):
    items = parse_cat_page(WB_BASE_LINK + f'?search={encoded_s}&sort=popular&page={i}', s, all_items, s)
    if items:
      logger.warning(f'page: {i} length: {len(items)}')
      parsed_items.extend(items)
    else:
      logger.error(f"No items found or error occurred for {s} on page {i}")

  write_items(parsed_items)

def main_scraper():
  """Основная функция парсера."""
  create_table()
  all_items = read_items()

  try:
    # Инициализация драйвера
    get_driver()

    df = pd.read_excel("table.xlsx", header=None)
    words = "".join(df[0].astype(str).to_list()).split(',')

    tasks = [(s, cnt, all_items) for s in words for cnt in range(1, 3)]

    # Использование ThreadPool
    with ThreadPool(processes=2) as pool:  # Увеличьте количество потоков, если нужно
      pool.map(process_word, tasks)

  finally:
    close_driver()  # Гарантированное закрытие драйвера

if __name__ == "__main__":
  main_scraper()