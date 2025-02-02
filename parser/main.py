import datetime
from multiprocessing import Pool
import psycopg2
from pydantic import BaseModel
import requests
from psycopg2 import sql
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup as BS
from selenium.webdriver.common.by import By
import time
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import json
import logging
import pandas as pd
import re
import urllib.parse
import os
from multiprocessing.pool import ThreadPool

DELTA = 0.3

def create_table():
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


def read_json(file_path):
  try:
    with open(file_path, 'r') as f:
      return json.load(f)
  except FileNotFoundError:
    return {}
  except json.JSONDecodeError as e:
    print(f"Error reading JSON file: {e}")
    return {}


# Database connection
def get_db_connection():
  conn = psycopg2.connect(
    dbname='postgres',
    user='postgres',
    password='postgres',
    host='pgdb',
    port='5432'
  )
  return conn


def read_items():
  conn = get_db_connection()
  cur = conn.cursor()
  cur.execute("SELECT * FROM items")
  items = cur.fetchall()
  cur.close()
  conn.close()
  return items


def write_items(items):
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

class CreateCard(BaseModel):
  target_url: str
  category: str
  shutdown_time: str


def parse_cat_page(url, cat_name, all_items, cat_real_name):
  try:
    service = Service(ChromeDriverManager().install())
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(url)
    for x in range(30):
      actions = ActionChains(driver)
      actions.send_keys(Keys.SPACE)
      actions.perform()
      time.sleep(.5)
    time.sleep(3)
    response = driver.page_source
    driver.close()

    soup = BS(response, 'html.parser')
    cards = soup.find_all("div", {"class": "product-card__wrapper"})
    result = []

    # Создаем словарь существующих товаров для быстрого поиска по URL
    existing_items = {}
    for item in all_items:
      # Проверяем, что кортеж содержит минимум 4 элемента
      if len(item) >= 4:
        url_from_db = item[3]  # URL находится на 4-й позиции
        existing_items[url_from_db] = item
      else:
        logging.error(f"Invalid item structure: {item}")

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

          # Очищаем цену от лишних символов
          real_price = ''.join(filter(str.isdigit, price))
          if not real_price:
            continue
          real_price = int(real_price)

          # Проверяем, есть ли товар в базе
          if url in existing_items:
            # Получаем данные из базы
            db_item = existing_items[url]
            last_price = 0
            last_price_db = 0
            if len(db_item) > 5:  # Проверяем, что кортеж содержит хотя бы 6 элементов
                last_price = db_item[5]  # Текущая цена в базе (price)
                last_price_db = db_item[4]
            else:
              logging.error(f"Invalid tuple length: {db_item}")
              continue

            # Если текущая цена в базе больше новой цены
            if (int(last_price_db) > int(last_price)*(1-DELTA) > int(real_price)) or (int(last_price_db)*(1-DELTA) > int(last_price) > int(real_price)):
              # Отправляем запрос на добавление
              response = requests.post(
                'http://backend:8080/api/create_card',
                json={'name': name, 'price': str(real_price), 'img': image, 'target_url': url, 'category': cat_real_name, 'shutdown_time': (datetime.date.today() + datetime.timedelta(days=3)).strftime("%d-%m-%Y")},
                headers={"Content-Type": "application/json"}
              )

              time.sleep(1)
              logging.warning(f"Response status: {response.status_code}")

            # Добавляем в результат для обновления БД
            result.append({
              'category': cat_name,
              'name': name,
              'url': url,
              'last_price': last_price,
              'price': real_price,
              'img_src': image
            })
          else:
            # Новый товар, добавляем в базу с last_price=0
            result.append({
              'category': cat_name,
              'name': name,
              'url': url,
              'last_price': 0,
              'price': real_price,
              'img_src': image
            })
            # Если нужно отправлять новые товары сразу, раскомментируйте:
            # response = requests.post(...)

        except Exception as e:
          logging.critical(f"Error processing card: {e}")
          continue

    return result

  except Exception as e:
    logging.critical(f"General error: {e}", exc_info=True)
    return []  # Возвращаем пустой список вместо None


WB_BASE_LINK = 'https://www.wildberries.ru/catalog/0/search.aspx'

def process_word(args):
  s, cnt, all_items = args
  pages = 1
  start_page = (cnt - 1) * pages + 1
  end_page = cnt * pages
  logging.warning(f"Processing {s} (page: {start_page}-{end_page})")
  encoded_s = urllib.parse.quote(s)
  parsed_items = []
  for i in range(start_page, end_page+1):
    items = parse_cat_page(WB_BASE_LINK + f'?search={encoded_s}&sort=popular&page={i}', s, all_items, s)
    if items:
      logging.warning(f'page: {i} length: {len(items)}')
      parsed_items.extend(items)
    else:
      logging.error(f"No items found or error occurred for {s} on page {i}")

  write_items(parsed_items)

def main_scraper():
  create_table()
  # cats = read_json('subcategories.json')
  all_items = read_items()
  #print(all_items)
  # for cat in cats:
  #     cnt = 1
  #     while cnt < 2:
  #         category_name = cat['url']
  #         category_real_name = cat['name']
  #         logging.warning(category_name)
  #         items = parse_cat_page(WB_BASE_LINK + category_name + f'?sort=popular&page={cnt}', category_name, all_items, category_real_name)
  #         #print(len(items))
  #         logging.warning(len(items))
  #         if len(items) == 0:
  #             break
  #         write_items(items)
  #         cnt += 1

  df = pd.read_excel("table.xlsx", header=None)
  df = df[0].astype(str)

  words = df.apply(lambda x: " ".join(re.findall(r"\b[а-яА-Яa-zA-Z]+\b", x))).tolist()

  tasks = [(s, cnt, all_items) for s in words for cnt in range(1, 3)]

  # Запускаем 10 процессов
  with Pool(processes=1) as pool:
    pool.map(process_word, tasks)

#main_scraper()