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

def get_items():
  try:
    response = requests.get("http://idealpick.ru:8080/api/get_cards?start=0&count=1000000&sort=recent", timeout=10)
    response.raise_for_status()
    return response.json()
  except requests.exceptions.RequestException as e:
    logger.error(f"Request failed: {e}")
    return []


def delete_card(id):
  response = requests.delete(
    f'http://idealpick.ru:8080/api/delete_card/{id}',
    headers={"Content-Type": "application/json"}
  )
  time.sleep(1)
  logging.warning(f"Response status: {response.status_code}")

def parse_card(card_id, url, last_price):
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
    downtrend = soup.find("span", {"class": "downtrend"})
    if downtrend is None:
      delete_card(card_id)
      return
    discount_price = int(''.join(filter(str.isdigit, downtrend.text)))
    if int(last_price)*DELTA > int(discount_price):
      logging.warning(f"url: {url}, last_price: {last_price}, discount_price: {discount_price}")
      delete_card(card_id)

  except Exception as e:
    logger.critical(f"General error: {e}", exc_info=True)


def main_scraper():
  """Основная функция парсера."""
  all_items = get_items()

  try:
    get_driver()
    
    for card in all_items:
      parse_card(card['id'], card['url'], card['price'])
      
  finally:
    close_driver()

if __name__ == "__main__":
  main_scraper()