import fs from 'fs';
const fsp = fs.promises;

export const fileChecker = async (inputFile, fileToCheckAgainst, outputFile) => {
    const inputStream = (await fsp.readFile(inputFile, 'utf8', (err, data) => { console.log(err); }));
    const checkAgainstStream = await fsp.readFile(fileToCheckAgainst, 'utf8', (err, data) => { console.log(err); });
    let inputArray = inputStream.split('\r\n');
    let checkAgainstArray = checkAgainstStream.split('\r\n');

    let combos = [];

    inputArray.forEach((location) => {
        location.replace(".html", "");
        let address = location.substring(location.lastIndexOf('/') + 1, location.length);
        let matching = checkAgainstArray.find(compareLocation => compareLocation.includes(address));
        if (matching) { combos.push(matching); }
    });

    combos.push("");

    fs.appendFile(outputFile,
        combos.join('\r\n'),
        err => { if (err) { console.log(err); } }
    );
}
