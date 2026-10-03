/* 
    RU Software Engineering 452
    Assignment #2
    Author: Joseph Signorile
    Description: Takes in an input file of record data, parses the data, and write the sorted (ascending order in terms of
    date/time) data to an output file according to thes specifications below.
    Cite: ChatGPT is used only on the two lines mentioned below.
*/

const fs = require('node:fs');
const readline = require('node:readline');

let fileName = process.argv[2]; // global filename variable
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/* Parses the file according to the following rules:
   General Format Details:
   - Each record must begin with a line containing exactly "Begin:Record" (case-insensitive) (surrounding white space is ignored)
   - Each record must end with a line containing exactly "End:Record" (case-insensitive) (surrounding white space is ignored)
   - Empty lines within and outside of entries are tolerated: lines that don't correspond to any property are marked as errors
   - White space on either side of each line is ignored (trimmed)
   - If there is any error while processing a Begin/End block, the line where the error occured is ignored (the record may be omitted)
   - Duplicate properties result in an error (the latter is ignored)
   - ':' is a reserved delimiter. Each line must only have one; lines with two are errors (catches multi-property lines)
   
   Details regarding Properties:
   - There are five data keywords: Identifier, Time, Weight, Units, Color (case-insensitive)
   - Every record's Identifier field should be unique: if not, the latter is omitted
   - Every record is required to have the Time and Identifier properties
   - If a record has the Weight property, it must have the Units property 
   - The Time field must follow a strict date-time format: Ex: 20250927T093005 

   Any entries that violate one of the rules above will be omitted from the final output.
   The input file below is assumed to be valid: isValidFile(inputFile) is true.
*/
function parseFile(inputFile) {
    const data = fs.readFileSync(inputFile, 'utf8'); // read file
    const lines = data.trim().split(/\r?\n/); // split into lines

    // Look at every line in the file. Note: The line number is (i+1)
    let identifier, time, weight, units, color; // data values
    let inBlock = false; // boolean that records whether the parser is within a record block
    const entries = []; // array of Record objects
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim(); // remove leading/trailing whitespace from each line
        let sections = lines[i].split(':'); // extract the key:value pair from each line

        // control flow logic:
        if (line.toUpperCase() === "BEGIN:RECORD") {
            if (inBlock) {
                console.log("Error: Line " + (i+1) + ": No end mark \"END:RECORD\" for last record.");
                flush();
            }
            inBlock = true;
        } else if (line.toUpperCase() === "END:RECORD") {
            if (!inBlock) {
                console.log("Error: Line " + (i+1) + ": Unclosed end mark (missing \"BEGIN:RECORD\").");
            } else {
                // verify required property conditions
                if (identifier === undefined || identifier === "") {
                    console.log("Error: Line " + (i+1) + ": Record is missing an identifier.");
                } else if (isRepeatID()) {
                    console.log("Error: Line " + (i+1) + ": Duplicate value (repeat identifier).");
                } else if (time === undefined) {
                    console.log("Error: Line " + (i+1) + ": Record is missing a date/time value.");
                } else if (!isTimeValid(time)) {
                    console.log("Error: Line " + (i+1) + ": Date/time field is invalid.");
                } else if (weight !== undefined && !/^\d+(\.\d+)?$/.test(weight)) { // makes sure the weight value is a number (credit: ChatGPT) 
                    console.log("Error: Line " + (i+1) + ": Record with weight data doesn't have a valid weight value.");
                } else if (weight !== undefined &&
                    (units === undefined ||
                    !(units.toUpperCase() === "POUNDS" ||
                    units.toUpperCase() === "KILOGRAMS"
                    ))) {
                    console.log("Error: Line " + (i+1) + ": Record with weight key has invalid/missing units.");
                } else if (color === "") {
                    console.log("Error: Line " + (i+1) + ": Record with color key doesn't have a color value.");
                } else {
                    entries.push(new Record(identifier, time, weight, units, color));
                }

                inBlock = false;
                flush();
            }
        } else if (line === "") { // ignore empty lines
        } else if (!inBlock) {
            console.log("Error: Line " + (i+1) + ": Line data does not belong to a valid record.");
        } else if (sections.length > 2) {
            console.log("Error: Line " + (i+1) + ": Each line can only contain one key:value pair (line ignored). "); 
        } else if (sections.length === 1) {
            console.log("Error: Line " + (i+1) + ": Line data must be in key:value pairs (extraneous symbols) (line ignored).");
        } else if (sections[0].trim().toUpperCase() == "IDENTIFIER") {
            if (identifier !== undefined) {console.log("Error: Line " + (i+1) + ": Duplicate identifier property.");} 
            else {identifier = sections[1].trim();}
        } else if (sections[0].trim().toUpperCase() == "TIME") {
            if (time !== undefined) {console.log("Error: Line " + (i+1) + ": Duplicate time property.");} 
            else {time = sections[1].trim();}
        } else if (sections[0].trim().toUpperCase() == "WEIGHT") {
            if (weight !== undefined) {console.log("Error: Line " + (i+1) + ": Duplicate weight property.");} 
            else {weight = sections[1].trim();}
        } else if (sections[0].trim().toUpperCase() == "UNITS") {
            if (units !== undefined) {console.log("Error: Line " + (i+1) + ": Duplicate units property.");} 
            else {units = sections[1].trim();}
        } else if (sections[0].trim().toUpperCase() == "COLOR") {
            if (color !== undefined) {console.log("Error: Line " + (i+1) + ": Duplicate color property.");} 
            else {color = sections[1].trim();}
        } else {
            console.log("Error: Line " + (i+1) + ": Invalid property (line ignored).");
        }
    }
    if (inBlock) {console.log("Error: Line " + lines.length + ": Missing \"END:RECORD\" for last record.");}

    // if the current record has an error, omit it, reset the underlying data, and move on
    function flush() {identifier = undefined; time = undefined; weight = undefined; units = undefined; color = undefined;}

    // checks if there is a repeat identifier
    function isRepeatID() {
        for (let j = 0; j < entries.length; j++) {
            if (entries[j].identifier === identifier) {return true;}
        }
        return false;
    }

    return entries; // organized list of records
}

// Object constructor for each Record. Ensures order of data and makes presentation easier.
function Record(identifier, time, weight, units, color) {
    this.identifier = identifier;
    this.time = time;
    this.weight = weight;
    this.units = units;
    this.color = color;

    // remove optional data if not included
    if (this.weight === undefined) {delete this.weight; delete this.units;}
    if (this.color === undefined) {delete this.color;}
}

/* Checks to make sure the time field matches the following format:
   - The Time property is exactly 15 characters long: 8 for the date, 6 for the time, 1 for the delimiter 'T'
   - The date attribute takes the form: YYYYMMDD (must be a valid date)
   - The time attribute takes the form: HHMMSS (HH: 00-23) (MM: 00-59) (SS: 00-59)
*/
function isTimeValid(time) {
    // check basic format: YYYYMMDDTHHMMSS
    if (!/^\d{8}T\d{6}$/.test(time)) {return false;} // Credit for format check expression: ChatGPT

    // extract date/time components
    const year = Number(time.substring(0, 4));
    const month = Number(time.substring(4, 6));
    const day = Number(time.substring(6, 8));
    const hour = Number(time.substring(9, 11));
    const minute = Number(time.substring(11, 13));
    const second = Number(time.substring(13, 15));

    // check time ranges
    if (hour > 23 || minute > 59 || second > 59) {return false;}

    // check that the date is valid
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
}

// Compares two records by their date/time attributes
// The format YYYYMMDDTHHMMSS makes direct lexicographic comparison possible
function compareRecords(r1, r2) {
    return r1.time.localeCompare(r2.time);
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
        const data = fs.readFileSync(inputFile, "utf8"); 
    } catch (error) {
        console.log("Error: ", error.message); // handles file not found errors and other extraneous issues
        return false;
    }
    return true;
}

// Once the sorted list of records is obtained, write that list to a new output file:
function createOutputFile(records) {
    try {
        fs.writeFileSync("output.txt", "");
        for (let i = 0; i < records.length; i++) {
            let record = records[i];
            let outputString = "BEGIN:RECORD\n";
            outputString += "IDENTIFIER: " + record.identifier + "\n";
            outputString += "TIME: " + record.time + "\n";
            if ("weight" in record) {
                outputString += "WEIGHT: " + record.weight + "\n";
                outputString += "UNITS: " + record.units + "\n";
            }
            if ("color" in record) {
                outputString += "COLOR: " + record.color + "\n";
            }
            outputString += "END:RECORD\n\n";
            fs.appendFileSync("output.txt", outputString);
        }
    } catch (error) {
        console.error("Error while writing data to a file: ", error);
    }
}

async function main() {
    while (!isValidFile(fileName)) {
        const inputFile = await new Promise(resolve => {
            rl.question("Enter the file path (Type 'N' to exit): ", input => {
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
    const records = parseFile(fileName);
    // sort records in ascending order by date/time data
    records.sort(compareRecords);
    // write the sorted list of records to a file
    createOutputFile(records);
}

if (require.main === module) {main();}
module.exports = {isValidFile, createOutputFile, isTimeValid, parseFile};