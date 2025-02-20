import datetime
import os
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
DELTA = 0.1

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

def get_items():
  conn = get_db_connection()
  cur = conn.cursor()
  cur.execute("SELECT * FROM middleware_items")
  items = cur.fetchall()
  cur.close()
  conn.close()
  return items

def delete_item(item_id: int) -> None:
  conn = None
  cur = None
  try:
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM middleware_items WHERE id = %s", (item_id,))

    if cur.rowcount > 0:
      logger.info(f"Item with id {item_id} deleted successfully.")
    else:
      logger.warning(f"No item found with id {item_id}.")

    conn.commit()

  except Exception as e:
    logger.error(f"Error deleting item {item_id}: {e}")
    if conn:
      conn.rollback()
  finally:
    if cur:
      cur.close()
    if conn:
      conn.close()

def parse_card(card):
  try:
    driver = get_driver()
    driver.get(card[3])

    for _ in range(30):
      ActionChains(driver).send_keys(Keys.SPACE).perform()
      time.sleep(0.5)

    time.sleep(3)
    response = driver.page_source
    soup = BS(response, 'html.parser')
    downtrend = soup.find("span", {"class": "downtrend"})
    if downtrend is None:
      return
    discount_price = int(''.join(filter(str.isdigit, downtrend.text)))
    if int(discount_price)*(1/DELTA) > int(card[4]):
      logging.warning(f"url: {card[3]}, last_price: {card[4]}, discount_price: {discount_price}")
      response = requests.post(
        'http://backend:8080/api/create_card',
        json={'name': card[2], 'price': str(card[5]), 'img': card[6], 'target_url': card[3], 'category': card[1], 'shutdown_time': (datetime.date.today() + datetime.timedelta(days=100)).strftime("%d-%m-%Y")},
        headers={"Content-Type": "application/json"}
      )
      time.sleep(1)
      logging.warning(f"Response status: {response.status_code}")



  except Exception as e:
    logger.critical(f"General error: {e}", exc_info=True)


def main_scraper():
  """Основная функция парсера."""
  all_items = get_items()

  block_size = len(all_items) // 10
  cnt = int(os.environ.get('CNT', 1))
  start_index = (cnt - 1) * block_size
  end_index = start_index + block_size
  all_items = all_items[start_index:end_index]

  try:
    get_driver()

    for card in all_items:
      parse_card(card)
      delete_item(card[0])

  finally:
    close_driver()

if __name__ == "__main__":
  main_scraper()