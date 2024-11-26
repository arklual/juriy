import psycopg2
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

def parse_cat_page(url, cat_name, all_items):
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
        if cards:
            for card in cards:
                try:
                    name = card.find('a', {'class': 'product-card__link'}).get("aria-label")
                    url = card.find('a', {'class': 'product-card__link'}).get("href")
                    price = card.find('ins', {'class': 'price__lower-price'}).text
                    image = card.find("img", {'class': 'j-thumbnail'}).src
                    real_price = ''
                    for i in price:
                        if i.isdigit():
                            real_price += i
                    in_items = False
                    item_index = 0
                    idx_counter = 0
                    for i in all_items:
                        if i[3] == url:  # Assuming url is the 4th column in the items table
                            in_items = True
                        else:
                            idx_counter += 1
                    if not in_items:
                        result.append({
                            'category': cat_name,
                            'name': name,
                            'url': url,
                            'last_price': 0,
                            'price': int(real_price),
                            'img_src': image
                        })
                    else:
                        all_items[idx_counter][4] = all_items[idx_counter][5]  # last_price = price
                        all_items[idx_counter][5] = int(real_price)  # price = new price
                        if all_items[idx_counter][4] > all_items[idx_counter][5]:
                            # дернуть апишку
                            pass
                except:
                    pass
        return result

    except Exception as e:
        print(e)
        return None

WB_BASE_LINK = 'https://www.wildberries.ru'
def main_scraper():
    create_table()
    cats = read_json('subcategories.json')
    all_items = read_items()
    for cat in cats:
        cnt = 0
        while True:
            category_name = cat.replace("/catalog/dom/")
            items = parse_cat_page(WB_BASE_LINK + cat + '?sort=popular&page={cnt}', category_name, all_items)
            if len(items) == 0:
                break
            write_items(items)
            cnt += 1

main_scraper()