import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import chalk from 'chalk';

const pizzaHutUrl = 'https://locations.pizzahut.com/';
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
            let fullLink = pizzaHutUrl + link;
            arrayToPush.push(fullLink);
        });
    } catch (error) {
        fs.appendFile('./phErrorLocations.txt', url + '\r\n', err => {
            if (err) {
                console.log(chalk.red(`Error writing to file phErrorLocations.txt: ${err}`));
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
    let phAllLocations = fs.createWriteStream('phAllLocations.txt');
    phAllLocations.on('error', function(err) { console.log(chalk.red(err)); });

    for (const page of locations) {
        try {
            const response = await axios.get(page);
            console.log("inside locations: " + page);
            const $ = cheerio.load(response.data);
            const links = $('div.info-container > h1');

            phAllLocations.write(page + '\r\n');
        } catch (error) {
            fs.appendFile('./phErrorLocations.txt', page + '\r\n', err => {
                if (err) {
                    console.log(chalk.red(`Error writing to file phErrorLocations.txt: ${err}`));
                }
            });
            console.log(chalk.red(error));
        }
    };
}

const crawler = async () => {
    try {
        await crawlLinks(pizzaHutUrl, stateUrls, '.Container > .border > .grid > div > a.Link[href]');
        await fillUrlArray(stateUrls, cityUrls, '.Container > .border > .grid > div > a.Link[href]');
        await fillUrlArray(cityUrls, locations, '.Container > .grid > .flex > a.Link[href]');

        console.log(locations);
        console.log(chalk.yellow(locations.length));

        await bufferFunction();
    } catch (error) {
        console.error(chalk.red(`Error fetching ${pizzaHutUrl}: ${error.message}`));
    }
}

// TODO 
// save addresses of KFC and Pizza Hut restaurants too
// when all locations are printed to files, write another script to compare addresses in each, and see if there are any addresses that match

crawler();
