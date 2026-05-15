import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import chalk from 'chalk';
const fsp = fs.promises;

import { crawler as all } from './restaurant_finder.js';
import { fileChecker } from './check_addresses.js';

const getCombos = async () => {
    // clear data from all files
    await fsp.writeFile("./locations/combos/kenTacoHuts.txt", "");
    await fsp.writeFile("./locations/combos/kfcPizzaHut.txt", "");
    await fsp.writeFile("./locations/combos/kfcTacoBell.txt", "");
    await fsp.writeFile("./locations/combos/tacoBellPizzaHut.txt", "");
    await fsp.writeFile("./locations/kfc/kfcAllLocations.txt", "");
    await fsp.writeFile("./locations/kfc/kfcErrorLocations.txt", "");
    await fsp.writeFile("./locations/pizzahut/phAllLocations.txt", "");
    await fsp.writeFile("./locations/pizzahut/phErrorLocations.txt", "");
    await fsp.writeFile("./locations/tacobell/tbAllLocations.txt", "");
    await fsp.writeFile("./locations/tacobell/tbErrorLocations.txt", "");

    // get all locations from each site's locations lists
    await all('a.Directory-listLink[href]', 'a.Directory-listLink[href]', 'h2 > a.Teaser-titleLink[href]', 'https://locations.kfc.com/', true, false, './locations/kfc/kfcErrorLocations.txt', './locations/kfc/kfcAllLocations.txt');
    await all('a.DirLinks[href]', 'a.DirLinks[href]', 'h2 > a.Link[href]', 'https://locations.tacobell.com/', false, true, './locations/tacobell/tbErrorLocations.txt', './locations/tacobell/tbAllLocations.txt');
    await all('.Container > .border > .grid > div > a.Link[href]', '.Container > .border > .grid > div > a.Link[href]', '.Container > .grid > .flex > a.mb-4[href]', 'https://locations.pizzahut.com/', false, false, './locations/pizzahut/phErrorLocations.txt', './locations/pizzahut/phAllLocations.txt');
    
    // get locations with matching addresses and put them in their respective combination file
    fileChecker('./locations/pizzahut/phAllLocations.txt', './locations/kfc/kfcAllLocations.txt', './locations/combos/kfcPizzaHut.txt');
    fileChecker('./locations/kfc/kfcAllLocations.txt', './locations/tacobell/tbAllLocations.txt', './locations/combos/kfcTacoBell.txt');
    fileChecker('./locations/pizzahut/phAllLocations.txt', './locations/tacobell/tbAllLocations.txt', './locations/combos/tacoBellPizzaHut.txt');

    // check all combinations of files for potential kentacohuts
    fileChecker('./locations/combos/kfcPizzaHut.txt', './locations/combos/kfcTacoBell.txt', './locations/combos/kenTacoHuts.txt');
    fileChecker('./locations/combos/kfcPizzaHut.txt', './locations/combos/tacoBellPizzaHut.txt', './locations/combos/kenTacoHuts.txt');
    fileChecker('./locations/combos/kfcTacoBell.txt', './locations/combos/tacoBellPizzaHut.txt', './locations/combos/kenTacoHuts.txt');
    fileChecker('./locations/combos/kfcPizzaHut.txt', './locations/tacobell/tbAllLocations.txt', './locations/combos/kenTacoHuts.txt');
    fileChecker('./locations/combos/tacoBellPizzaHut.txt', './locations/kfc/kfcAllLocations.txt', './locations/combos/kenTacoHuts.txt');
    fileChecker('./locations/combos/kfcTacoBell.txt', './locations/pizzahut/phAllLocations.txt', './locations/combos/kenTacoHuts.txt');
}

getCombos();

/*
    TODO
        make write for live mas cafes, taco bell cantinas, long john silvers, and a file for other weirdly labelled taco bells
        Make site visual
            website
            progress bar
            check boxes for which combo you want (can select multiple)
        
*/
