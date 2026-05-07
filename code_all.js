import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import chalk from 'chalk';

const tacoBellUrl = 'https://locations.tacobell.com/';
let stateUrls = [];
let cityUrls = [];
let locations = [];

async function crawlLinks(url, arrayToPush, linkIdentifier, mainFile, errorFile) {
    console.log(chalk.green('location: ') + chalk.bgCyan.underline(url) + ' ' + chalk.bgCyan.inverse(linkIdentifier));
    
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const links = $(linkIdentifier);

        links.each((index, element) => {
            let link = $(element).attr('href').replace('../', '');
            let fullLink = tacoBellUrl + link;
            arrayToPush.push(fullLink);
        });
    } catch (error) {
        fs.appendFile(errorFile, url + '\r\n', err => {
            if (err) {
                console.log(chalk.red(`Error writing to file ${errorFile}: ${err}`));
            }
        });
        console.error(chalk.red(`Error fetching ${url}: ${error.message}`));
    }
}

async function fillUrlArray(fromArray, arrayToFill, linkIdentifier, mainFile, errorFile) {
    for (const url of fromArray) {
        const asyncResult = await crawlLinks(url, arrayToFill, linkIdentifier, mainFile, errorFile);
    }
}

async function bufferFunction(mainFile, errorFile) {
    let allLocations = fs.createWriteStream(mainFile);
    allLocations.on('error', function(err) { console.log(chalk.red(err)); });

    for (const page of locations) {
        try {
            const response = await axios.get(page);
            console.log("inside locations: " + page);
            const $ = cheerio.load(response.data);
            const links = $('div.info-container > h1');

            if (links[0].children[0].data == 'Taco Bell / Pizza Hut') {
                fs.appendFile('./tbPizzaHutLocations.txt', page + '\r\n', err => {
                    if (err) {
                        console.log(chalk.red(`Error writing to file tbPizzaHutLocations.txt: ${err}`));
                    }
                });
                console.log(chalk.magenta(page));
            } else {
                allLocations.write(page + '\r\n');
            }
        } catch (error) {
            console.log(chalk.red('darn'));
        }
    };
}

const crawler = async (baseUrl, stateQuery, cityQuery, locationQuery, mainFile, errorFile) => {
    try {
        await crawlLinks(baseUrl, stateUrls, stateQuery, mainFile, errorFile);
        await fillUrlArray(stateUrls, cityUrls, cityQuery, mainFile, errorFile);
        await fillUrlArray(cityUrls, locations, locationQuery, mainFile, errorFile);

        console.log(locations);
        console.log(chalk.yellow(locations.length));

        await bufferFunction(mainFile, errorFile);
        stateUrls = [];
        cityUrls = [];
        locations = [];
    } catch (error) {
        console.error(chalk.red(`Error fetching ${baseUrl}: ${error.message}`));
    }
}

crawler(
    'https://locations.tacobell.com/',
    'a.DirLinks[href]',
    'a.DirLinks[href]',
    'h2 > a.Link[href]',
    './tbAllLocations.txt',
    './tbErrorLocations.txt'
);
crawler(
    'https://locations.kfc.com/',
    'a.Directory-listLink[href]',
    'a.Directory-listLink[href]',
    'h2 > a.Teaser-titleLink[href]',
    './kfcAllLocations.txt',
    './kfcErrorLocations.txt'
);
crawler(
    'https://locations.pizzahut.com/',
    '.border > .grid > div > a.Link[href]',
    '.border > .grid > div > a.Link[href]',
    '.grid > .flex > a.Link[href]',
    './phAllLocations.txt',
    './phErrorLocations.txt'
);
