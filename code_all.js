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
    await fsp.writeFile("./locations/combos/actualPizzaHutTacoBells.txt", "");
    await fsp.writeFile("./locations/combos/extraKfcTacoBells.txt", "");
    await fsp.writeFile("./locations/combos/extraPizzaHutTacoBells.txt", "");
    await fsp.writeFile("./locations/combos/kentacoHuts.txt", "");
    await fsp.writeFile("./locations/combos/tbPizzaHutLocations.txt", "");
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
}

getCombos();

/*
    TODO
        check_addresses.js in this file
            make it callable with different files as arguments
        rename this file to main.js
        combine kfc(), tb(), and ph() into one function, callable with different arguments for urls and such
*/
