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
        print("JSON file not found.")
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

class CreateC1ard(BaseModel):
    target_url: str
    category: str
    shutdown_time: str


def parse_cat_page(url, cat_name, all_items):
    try:
        service = Service(ChromeDriverManager().install())
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        driver = webdriver.Chrome(service=service, options=options)
        driver.get(url)
        
        for _ in range(30):
            ActionChains(driver).send_keys(Keys.SPACE).perform()
            time.sleep(0.5)

        time.sleep(3)
        response = driver.page_source
        driver.close()

        soup = BS(response, 'html.parser')
        cards = soup.find_all("div", {"class": "product-card__wrapper"})

        result = []
        for card in cards:
            try:
                name = card.find('a', {'class': 'product-card__link'}).get("aria-label")
                url = card.find('a', {'class': 'product-card__link'}).get("href")
                price = card.find('ins', {'class': 'price__lower-price'}).text
                image = card.find("img", {'class': 'j-thumbnail'})['src']

                real_price = ''.join(filter(str.isdigit, price))
                result.append({
                    'category': cat_name,
                    'name': name,
                    'url': url,
                    'last_price': 0,
                    'price': int(real_price),
                    'img_src': image
                })

                response = requests.post(
                    'http://localhost:8080/api/create_card',
                    json={
                        'name': name,
                        'price': real_price,
                        'img': image,
                        'target_url': url,
                        'category': cat_name,
                        'shutdown_time': '01-01-2100'
                    },
                    headers={"Content-Type": "application/json"}
                )
                print(response.status_code, response.json())
            except Exception as e:
                logging.critical(f"Error parsing card: {e}")

        return result
    except Exception as e:
        logging.critical(f"Error in parse_cat_page: {e}")
        return None



WB_BASE_LINK = 'https://www.wildberries.ru'


def main_scraper():
    create_table()
    cats = read_json('subcategories.json')
    all_items = read_items()

    for cat in cats['subcats']:
        url_suffix = cat['url']
        category_name = cat['name']
        cnt = 1
        while True:
            full_url = WB_BASE_LINK + url_suffix + f'?sort=popular&page={cnt}'
            print(f"Scraping {full_url} for category {category_name}")
            items = parse_cat_page(full_url, category_name, all_items)
            if not items:
                break
            write_items(items)
            cnt += 1


#main_scraper()
