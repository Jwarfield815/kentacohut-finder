import fs from 'fs';
const fsp = fs.promises;

var array1 = [
    'https://locations.tacobell.com/wv/cross-lanes/322-goff-mountain-rd.html',
    'https://locations.tacobell.com/ca/citrus-heights/6031-greenback-lane.html',
    'https://locations.tacobell.com/va/roanoke/4220-franklin-rd-sw.html',
    'https://locations.tacobell.com/wv/huntington/2515-5th-ave.html',
    'https://locations.tacobell.com/va/sterling/22288-s-sterling-blvd.html',
    'https://locations.tacobell.com/va/vinton/1918-washington-avenue.html',
    'https://locations.tacobell.com/wi/kenosha/7020-green-bay-road.html',
    'https://locations.tacobell.com/tn/nashville/2200-childrens-way.html'
];
var array2 = [
    'https://locations.pizzahut.com/va/roanoke/4220-franklin-rd-sw',
    'https://locations.pizzahut.com/tn/memphis/1229-getwell',
    'https://locations.pizzahut.com/va/sterling/22288-s-sterling-blvd',
    'https://locations.pizzahut.com/va/vinton/1918-washington-avenue',
    'https://locations.pizzahut.com/fl/melbourne/65-bulldog-boulevard',
    'https://locations.pizzahut.com/wi/kenosha/7020-green-bay-road',
    'https://locations.pizzahut.com/tn/nashville/2200-childrens-way-14043182',
    'https://locations.pizzahut.com/tn/memphis/3555-austin-peay-highway'
];

const fileChecker = async () => {
    let tbAllLocations = await fsp.readFile('./tbAllLocations.txt', 'utf8', (err, data) => {});
    let phAllLocations = await fsp.readFile('./phAllLocations.txt', 'utf8', (err, data) => {});
    let kfcAllLocations = await fsp.readFile('./kfcAllLocations.txt', 'utf8', (err, data) => {});
    let kfcTacoBellCombos = await fsp.readFile('./extraKfcTacoBells.txt', 'utf8', (err, data) => {});

    tbAllLocations = tbAllLocations.split('\r\n');
    phAllLocations = phAllLocations.split('\r\n');
    kfcAllLocations = kfcAllLocations.split('\r\n');
    kfcTacoBellCombos = kfcTacoBellCombos.split('\r\n');

    let tbPhCombos = []
    let tbKfcCombos = []
    let phKfcCombos = []
    let tbPhKfcCombos = []

    kfcTacoBellCombos.forEach((tacoBell) => {
        let tbAddress = tacoBell.substring(tacoBell.lastIndexOf('/') + 1, tacoBell.length - 5);
        let matching = phAllLocations.find(pizzaHut => pizzaHut.includes(tbAddress));
        if (matching) { tbPhCombos.push(matching); }
    });

    fs.writeFile('./kentacoHuts.txt',
        tbPhCombos.join('\r\n'),
        err => { if (err) { console.log(err); } }
    );
}

fileChecker();
