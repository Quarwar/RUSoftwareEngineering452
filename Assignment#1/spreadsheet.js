/* 
    RU Software Engineering 452
    Assignment #1
    Author: Joseph Signorile
    Description: Simple NodeJS program that takes in a .csv as input and prints a
    table of the contents to the command line. 
*/

const fs = require('node:fs');
const readline = require('node:readline');

let filename = process.argv[2];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/* Checks if the filepath yields an valid file:
   File is valid if:
   1. The filepath exists and ends with '.csv'
   2. The .csv is nonempty
   3. The .csv is properly formatted (same number of columns per row)
*/
function isValidFile(inputfile) {
    try {
        // check if initial argument is empty
        if (inputfile === undefined) {return false;} 
        
        // check that the file has a .csv extension
        if (!inputfile.toLowerCase().endsWith(".csv")) {
            console.log("Error: File must be a .csv file.");
            return false;
        }
        
        const data = fs.readFileSync(inputfile, 'utf8'); // read file

        // file cannot be empty
        if (data.trim() === "") {
            console.log("File cannot be empty.");
            return false;
        }

        const lines = data.trim().split(/\r?\n/); // split into lines

        // checks that each row has the same number of columns
        // Note: the display code also works for jagged tables if this block is commented out
        const numColumns = lines[0].split(',').length;
        for (let i = 0; i < lines.length; i++) {
            const columns = lines[i].split(',');

            if (columns.length !== numColumns) {
                console.log("Each row of the .csv does not have the same number of fields.");
                return false;
            }
        }

        return true;

    } catch (error) {
        console.log("Error:", error.message); // handles file not found errors and other extraneous issues
        return false;
    }
}

// Given a correctly formatted nonempty .csv, this prints a table to the command line
function displayTable(inputfile) {
    const data = fs.readFileSync(inputfile, 'utf8'); // read file
    const lines = data.trim().split(/\r?\n/); // split into lines

    // count the number of characters each element in a column has
    // find the maximum and use it to determine the column width
    const columnWidth = new Int32Array(lines[0].split(',').length).fill(0);
    lines.forEach(line => {
        let columns = line.split(','), str;
        for (let i = 0; i < columns.length; i++) {
            str = columns[i];
            if (str.length > columnWidth[i]) {
                columnWidth[i] = str.length;
            }
        }
    })

    // create a table containing the data:
    lines.forEach(line => {
        let columns = line.split(','), str = "| ";
        for (let i = 0; i < columns.length; i++) {
            str += columns[i];
            str += " ".repeat(columnWidth[i] - columns[i].length);
            str += " | ";
        }
        console.log(str);
    })
}

async function main() {
    // Important: Check if the input file is valid:
    while (!isValidFile(filename)) {
        const inputfile = await new Promise(resolve => {
            rl.question("Enter the file path (type 'N' to exit): ", input => {
                resolve(input);
            });
        });

        if (inputfile.toUpperCase() == 'N') {
            rl.close();
            process.exit(0);
        }

        filename = inputfile;
    }
    rl.close();

    // Once the file has been verified, print the table:
    displayTable(filename);
}

if (require.main === module) {main();}
module.exports = {isValidFile, displayTable};