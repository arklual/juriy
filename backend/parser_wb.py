from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup as BS
import time
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

def parse(url):
    service = Service(ChromeDriverManager().install())
    options = Options()  
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(url)
    time.sleep(15)
    response = driver.page_source
    print(response)
    driver.close()
    
    soup = BS(response, 'html.parser')
    card = soup.find('div', {'class': 'product-page__grid'})
    price = card.find('div', {'class': 'product-page__price-block product-page__price-block--common hide-mobile'}).find('ins', {'class': 'price-block__final-price red-price'}).text
    name = card.find('h1', {'class': 'product-page__title'}).text
    # url = soup.find('a', {'class': 'product-card__link'}).get("href")
    #price = soup.find('ins', {'class': 'price__lower-price'}).text
    img = soup.find("img", {'class': 'photo-zoom__preview j-zoom-image hide'})['src']
    real_price = ''
    for i in price:
        if i.isdigit():
            real_price += i

    return {
        'name': name,
        'url': url,
        'img': img,
        'price': int(real_price)
    }
    

#parse('https://www.wildberries.ru/catalog/49302865/detail.aspx')