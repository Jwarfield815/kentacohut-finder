import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import chalk from 'chalk';

// const siteUrl = 'https://locations.tacobell.com/';
let stateUrls = [];
let cityUrls = [];
let locations = [];

async function crawlLinks(url, arrayToPush, linkIdentifier, rootUrl, isKfc, errorFile) {
    console.log(chalk.green('location: ') + chalk.bgCyan.underline(url) + ' ' + chalk.bgCyan.inverse(linkIdentifier));
    
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const links = $(linkIdentifier);

        links.each((index, element) => {
            let link = $(element).attr('href').replace('../', '');
            let fullLink = rootUrl + link;

            if (isKfc && (link.split('/').length - 1) > 1) {
                locations.push(fullLink);
            } else {
                arrayToPush.push(fullLink);
            }
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

async function fillUrlArray(fromArray, arrayToFill, linkIdentifier, rootUrl, isKfc, errorFile) {
    for (const url of fromArray) {
        // for testing, makes it run shorter
        // if (fromArray.indexOf(url) < 50) {
        const asyncResult = await crawlLinks(url, arrayToFill, linkIdentifier, rootUrl, isKfc, errorFile);
        // }
    }
}

async function bufferFunction(errorFile, allFile, isTacoBell) {
    let allLocations = fs.createWriteStream(allFile);
    allLocations.on('error', function(err) { console.log(chalk.red(err)); });

    for (const page of locations) {
        try {
            const response = await axios.get(page);
            // console.log("writing " + page + " to file");
            const $ = cheerio.load(response.data);

            // check for taco bell combos labelled explicitly on site
            if (isTacoBell) {
                const links = $('div.info-container > h1');
                if (links[0].children[0].data == 'Taco Bell / Pizza Hut') {
                    fs.appendFile('./locations/combos/tacoBellPizzaHut.txt', page + '\r\n', err => {
                        if (err) {
                            console.log(chalk.red(`Error writing to file tacoBellPizzaHut.txt: ${err}`));
                        }
                    });
                } else if (links[0].children[0].data == 'Taco Bell / KFC') {
                    fs.appendFile('./locations/combos/kfcTacoBell.txt', page + '\r\n', err => {
                        if (err) {
                            console.log(chalk.red(`Error writing to file kfcTacoBell.txt: ${err}`));
                        }
                    });
                } else if (links[0].children[0].data != 'Taco Bell') {
                    console.log(links[0].children[0].data, page);
                } else {
                    allLocations.write(page + '\r\n');
                }
            } else {
                allLocations.write(page + '\r\n');
            }
            
        } catch (error) {
            fs.appendFile(errorFile, page + '\r\n', err => {
                if (err) {
                    console.log(chalk.red(`Error writing to file ${errorFile}: ${err}`));
                }
            });
            console.log(chalk.red(error));
        }
    };
}

export const crawler = async (stateSelector, citySelector, locationSelector, rootUrl, isKfc, isTacoBell, errorFile, allFile) => {
    try {
        await crawlLinks(rootUrl, stateUrls, stateSelector, rootUrl, isKfc, errorFile);
        await fillUrlArray(stateUrls, cityUrls, citySelector, rootUrl, isKfc, errorFile);
        await fillUrlArray(cityUrls, locations, locationSelector, rootUrl, isKfc, errorFile);

        console.log(locations);
        console.log(chalk.yellow(locations.length));

        await bufferFunction(errorFile, allFile, isTacoBell);
        stateUrls = [];
        cityUrls = [];
        locations = [];
    } catch (error) {
        console.error(chalk.red(`Error fetching ${rootUrl}: ${error.message}`));
        stateUrls = [];
        cityUrls = [];
        locations = [];
    }
}
