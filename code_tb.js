import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import chalk from 'chalk';

const tacoBellUrl = 'https://locations.tacobell.com/';
let stateUrls = [];
let cityUrls = [];
let locations = [];

async function crawlLinks(url, arrayToPush, linkIdentifier) {
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
        fs.appendFile('./tbErrorLocations.txt', url + '\r\n', err => {
            if (err) {
                console.log(chalk.red(`Error writing to file tbErrorLocations.txt: ${err}`));
            }
        });
        console.error(chalk.red(`Error fetching ${url}: ${error.message}`));
    }
}

async function fillUrlArray(fromArray, arrayToFill, linkIdentifier) {
    for (const url of fromArray) {
        // console.log(fromArray.indexOf(url))
        // if (fromArray.indexOf(url) < 50) {
            const asyncResult = await crawlLinks(url, arrayToFill, linkIdentifier);
        // }
    }
    // const asyncResult = await crawlLinks(fromArray[0], arrayToFill, linkIdentifier)
}

async function bufferFunction() {
    let tbAllLocations = fs.createWriteStream('tbAllLocations.txt');
    tbAllLocations.on('error', function(err) { console.log(chalk.red(err)); });

    for (const page of locations) {
        try {
            const response = await axios.get(page);
            console.log("inside locations: " + page);
            const $ = cheerio.load(response.data);
            const links = $('div.info-container > h1');

            if (links[0].children[0].data == 'Taco Bell / Pizza Hut') {
                fs.appendFile('./tbPizzaHutLocations.txt', page + '\r\n', err => {
                    if (err) {
                        console.log(chalk.red(`Error writing to file tbErrorLocations.txt: ${err}`));
                    }
                });
                console.log(chalk.magenta(page));
            } else {
                tbAllLocations.write(page + '\r\n');
            }
        } catch (error) {
            console.log(chalk.red('darn'));
        }
    };
}

const crawler = async () => {
    try {
        await crawlLinks(tacoBellUrl, stateUrls, 'a.DirLinks[href]');
        await fillUrlArray(stateUrls, cityUrls, 'a.DirLinks[href]');
        await fillUrlArray(cityUrls, locations, 'h2 > a.Link[href]');

        console.log(locations);
        console.log(chalk.yellow(locations.length));

        await bufferFunction();
    } catch (error) {
        console.error(chalk.red(`Error fetching ${tacoBellUrl}: ${error.message}`));
    }
}

crawler();
