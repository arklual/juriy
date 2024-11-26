from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup as BS
import time
from xvfbwrapper import Xvfb
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import logging


def parse(url):
    try:
        service = Service(ChromeDriverManager().install())
        options = Options()  
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        driver = webdriver.Chrome(service=service, options=options)
        driver.get(url)
        time.sleep(5)
        response = driver.page_source
        driver.close()
        logging.critical(response)
        soup = BS(response)
        name = soup.find('h1', {'class': 'product-page__title'}).text
        img = soup.find('img', {'class': 'photo-zoom__preview'}).get('src')
        price = soup.find('ins', {'class': 'price-block__final-price'}).text

        real_price = ''
        for i in price:
            if i.isdigit():

                real_price+=i
        return {
            'name': name,
            'url': url,
            'img': img,
            'price': int(real_price)
        }
    except Exception as e:
        print(e)
        return None
