import requests
from lxml import etree
import os
import time
from bs4 import BeautifulSoup
import re

start = time.time()

URL = "https://locations.tacobell.com/"
resp = requests.get(URL)

if os.path.exists("combinationpizzahutandtacobell.txt"):
    os.remove("combinationpizzahutandtacobell.txt")
file = open("combinationpizzahutandtacobell.txt", "x")
file.close()
counter = 0

if resp.status_code == 200:
    dom = etree.HTML(resp.text)
    elements = dom.xpath('//a[@class="Directory-listLink"]')
    for x in elements:
        newLink = URL + x.attrib['href']
        newResp = requests.get(newLink)
        newDom = etree.HTML(newResp.text)
        newElements = newDom.xpath('//a[@class="Directory-listLink"]')

        for y in newElements:
            pogLink = URL + y.attrib['href']
            pogResp = requests.get(pogLink)

            soup = BeautifulSoup(pogResp.text, 'html.parser')
            if pogLink.count('/') == 5:
                features = soup.find_all('img', 'Core-icon visible-xs')
                for feature in features:
                    comboStatus = ""
                    isCombo = False
                    if "KFC" in feature['alt']:
                        comboStatus += "KFC " 
                        isCombo = True
                    if "Pizza Hut" in feature['alt']:
                        comboStatus += "PizzaHut "
                        isCombo = True

                    if isCombo:
                        comboStatus += URL + link['href'].replace('../', '')
                        print(comboStatus)
                        f = open("combinationpizzahutandtacobell.txt", "a")
                        f.write(comboStatus + "\n")
                        f.close()
            else:
                links = soup.find_all('a', 'Teaser-viewPage')
                for link in links:
                    epicResp = requests.get(URL + link['href'].replace('../', ''))
                    epicSoup = BeautifulSoup(epicResp.text, 'html.parser')
                    features = epicSoup.find_all('img', 'Core-icon visible-xs')
                    
                    for feature in features:
                        comboStatus = ""
                        isCombo = False
                        if "KFC" in feature['alt']:
                            comboStatus += "KFC "
                            isCombo = True
                        if "Pizza Hut" in feature['alt']:
                            comboStatus += "PizzaHut "
                            isCombo = True

                        if isCombo:
                            comboStatus += URL + link['href'].replace('../', '')
                            print(comboStatus)
                            f = open("combinationpizzahutandtacobell.txt", "a")
                            f.write(comboStatus + "\n")
                            f.close()
end = time.time()
total = end - start

print(counter, total, start, end)
