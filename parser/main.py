from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup as BS
from selenium.webdriver.common.by import By
import time
import json
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options



def read_json(file_path):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        print(f"Error reading JSON file: {e}")
        return {}


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
                        if i['url'] == url:
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
                        all_items[idx_counter]['last_price'] = all_items[idx_counter]['price']
                        all_items[idx_counter]['price'] = int(real_price)
                        if all_items[idx_counter]['last_price'] > all_items[idx_counter]['price']:
                            # дернуть апишку
                            pass
                except:
                    pass
        return result

    except Exception as e:
        print(e)
        return None
    
def write_json(data, file_path):
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Error writing JSON file: {e}")



WB_BASE_LINK = 'https://www.wildberries.ru'
def main_scraper():
    cats = read_json('subcategories.json')
    all_items = read_json('items.json')
    for cat in cats:
        cnt = 0
        while True:
            category_name = cat.replace("/catalog/dom/")
            items = parse_cat_page(WB_BASE_LINK + cat + '?sort=popular&page={cnt}', category_name, all_items)
            if len(items) == 0:
                break
            write_json(items, 'items.json')
            cnt+=1

main_scraper()

#TODO: add a function to scroll all pages for category (#READY)
#TODO: when scraping add items to json (name, price, url, category, subcategory) (#READY)
#TODO: if item already in json, check if price became less and update json, make post request to add card on our website (#READY)
#TODO: add multi threads
"""
парсинг должен выполняться раз в сутки
парсинг - пиздец как долгий процесс, поэтому надо делать его в отдельном потоке
парсинг выполняется один, с ним вместе не выполняется никаких других задач
при парсинге будет чисто сбор данны в json (по всем категориям)
если продукт добавляется впервые то его last_price равен текущей и обычный price равен текущей
если продукт уже есть в json, то его last_price равен прошлой price, а price равен текущей

после этого товары из json также раз в сутки будет по ним обход, проверка price < last_price
если да, то отправка запроса на добавление карточки на сайт, статус в json меняется на "added"
если нет, то статус остается "not added"
"""



"""
import concurrent.futures
import threading
from threading import Lock

class ProductStorage:
    def __init__(self):
        self.lock = Lock()
        self.products = read_json('items.json').get('products', [])
    
    def add_products(self, new_products):
        with self.lock:
            for product in new_products:
                existing_product = next((p for p in self.products if p['id'] == product['id']), None)
                if existing_product:
                    existing_product['last_price'] = existing_product['price']
                    existing_product['price'] = product['price']
                else:
                    product['last_price'] = product['price']
                    self.products.append(product)
            self.save_products()
    
    def save_products(self):
        write_json({'products': self.products}, 'items.json')

def process_category(cat, storage):
    cnt = 0
    while True:
        category_name = cat.replace("/catalog/dom/", "")
        items = parse_cat_page(WB_BASE_LINK + cat + f'?sort=popular&page={cnt}', category_name, storage.products)
        if not items:
            break
        storage.add_products(items)
        cnt += 1

def main_scraper():
    cats = read_json('subcategories.json')
    storage = ProductStorage()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_category, cat, storage) for cat in cats]
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Error processing category: {e}")

if __name__ == "__main__":
    main_scraper()
"""