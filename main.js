import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import chalk from 'chalk';
const fsp = fs.promises;

import { crawler as kfc } from './code_kfc.js';
import { crawler as tb } from './code_tb.js';
import { crawler as ph } from './code_ph.js';
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
    await kfc();
    await tb(); // automatically gets locations tagged as Taco Bell / Pizza Hut
    await ph();

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
        combine kfc(), tb(), and ph() into one function, callable with different arguments for urls and such
        in code_tb.js, add a check for taco bell / kfc labelled locations, just like taco bell / pizza hut ones
            see if these are labelled on the kfc or pizza hut sites too
*/
