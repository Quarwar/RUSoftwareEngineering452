/* 
    RU Software Engineering 452
    Assignment #2
    Author: Joseph Signorile
    Description: 
*/

const fs = require('node:fs');
const readline = require('node:readline');

let fileName = process.argv[2]; // global filename variable
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/* Parses the file according to the following rules:
   - Insert info here
   -
   -
   -
   Any entries that violate one of the rules above will be omitted from
   the final output.
*/
function parseFile(inputFile) {

}

/* Handles standard file exceptions:
   - Incorrect File Path
   - Incorrect File Format
   - No initial argument
*/
function isValidFile(inputFile) {
    try {
        // check if initial program argument is empty
        if (inputFile === undefined) {return false;}
        // check if input file is a '.txt' file
        if (!inputFile.toLowerCase().endsWith(".txt")) {
            console.log("Input file must be a text file (.txt).");
            return false;
        }

        // read input file, check if file path is valid
        const data = fs.readFileSync(inputFile, 'utf8'); 
    } catch (error) {
        console.log("Error: ", error.message); // handles file not found errors and other extraneous issues
        return false;
    }
}

async function main() {
    while (!isValidFile(fileName)) {
        const inputFile = await new Promise(resolve => {
            rl.question("Enter the file path (Type 'N' to exit): ", resolve => {
                resolve(input);
            });
        });

        if (inputFile.toUpperCase() == 'N') {
            rl.close();
            process.exit(0);
        }

        fileName = inputFile;
    }
    rl.close();

    // once a valid file has been obtained, analyze its data:
    parseFile(fileName);
}

if (require.main === module) {main();}