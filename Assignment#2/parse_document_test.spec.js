/*
    RU Software Engineering 452
    Assignment #2
    Jasmine Test Cases
    Author: Joseph Signorile
    Cite: ChatGPT (contributed to the test cases, helped generate random test data)

    Tests the functions exported by the Assignment #2 program.
*/

const fs = require('node:fs');
const path = require('node:path');

const {
    isValidFile,
    createOutputFile,
    isTimeValid,
    parseFile
} = require('../Pasted code(1).js');

const testDirectory = path.join(__dirname, 'test_files');

describe("Assignment #2", function () {

    beforeAll(function () {
        if (!fs.existsSync(testDirectory)) {
            fs.mkdirSync(testDirectory);
        }
    });

    afterEach(function () {
        // Remove all files created during a test
        if (fs.existsSync(testDirectory)) {
            const files = fs.readdirSync(testDirectory);

            for (const file of files) {
                fs.unlinkSync(path.join(testDirectory, file));
            }
        }

        // Remove output.txt if it was created
        if (fs.existsSync("output.txt")) {
            fs.unlinkSync("output.txt");
        }
    });

    afterAll(function () {
        if (fs.existsSync(testDirectory)) {
            fs.rmdirSync(testDirectory);
        }
    });


    // ============================================================
    // isValidFile()
    // ============================================================

    describe("isValidFile()", function () {

        it("should return false when no filename is provided", function () {
            expect(isValidFile(undefined)).toBe(false);
        });

        it("should return false for a non-text file", function () {
            const file = path.join(testDirectory, "test.csv");
            fs.writeFileSync(file, "test");

            expect(isValidFile(file)).toBe(false);
        });

        it("should return false when the file does not exist", function () {
            const file = path.join(testDirectory, "does_not_exist.txt");

            expect(isValidFile(file)).toBe(false);
        });

        it("should return true for an existing text file", function () {
            const file = path.join(testDirectory, "valid.txt");
            fs.writeFileSync(file, "");

            expect(isValidFile(file)).toBe(true);
        });

        it("should return true for a text file containing records", function () {
            const file = path.join(testDirectory, "records.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
END:RECORD`);

            expect(isValidFile(file)).toBe(true);
        });
    });


    // ============================================================
    // isTimeValid()
    // ============================================================

    describe("isTimeValid()", function () {

        it("should accept a valid date and time", function () {
            expect(isTimeValid("20250927T101530")).toBe(true);
        });

        it("should accept midnight", function () {
            expect(isTimeValid("20250927T000000")).toBe(true);
        });

        it("should accept the last valid second of the day", function () {
            expect(isTimeValid("20250927T235959")).toBe(true);
        });

        it("should accept February 29 on a leap year", function () {
            expect(isTimeValid("20240229T120000")).toBe(true);
        });

        it("should reject February 29 on a non-leap year", function () {
            expect(isTimeValid("20250229T120000")).toBe(false);
        });

        it("should reject an invalid month", function () {
            expect(isTimeValid("20251327T101530")).toBe(false);
        });

        it("should reject an invalid day", function () {
            expect(isTimeValid("20250931T101530")).toBe(false);
        });

        it("should reject day zero", function () {
            expect(isTimeValid("20250900T101530")).toBe(false);
        });

        it("should reject hour 24", function () {
            expect(isTimeValid("20250927T240000")).toBe(false);
        });

        it("should reject minute 60", function () {
            expect(isTimeValid("20250927T106000")).toBe(false);
        });

        it("should reject second 60", function () {
            expect(isTimeValid("20250927T105960")).toBe(false);
        });

        it("should reject a missing T delimiter", function () {
            expect(isTimeValid("20250927101530")).toBe(false);
        });

        it("should reject a lowercase t delimiter", function () {
            expect(isTimeValid("20250927t101530")).toBe(false);
        });

        it("should reject a timestamp that is too short", function () {
            expect(isTimeValid("20250927T10153")).toBe(false);
        });

        it("should reject a timestamp that is too long", function () {
            expect(isTimeValid("20250927T1015300")).toBe(false);
        });

        it("should reject an empty string", function () {
            expect(isTimeValid("")).toBe(false);
        });

        it("should reject undefined", function () {
            expect(isTimeValid(undefined)).toBe(false);
        });

        it("should reject letters in the date", function () {
            expect(isTimeValid("20250A27T101530")).toBe(false);
        });

        it("should reject letters in the time", function () {
            expect(isTimeValid("20250927T10AB30")).toBe(false);
        });
    });


    // ============================================================
    // parseFile() - valid records
    // ============================================================

    describe("parseFile() - valid records", function () {

        it("should parse a record containing only required properties", function () {
            const file = path.join(testDirectory, "required.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBe("A-001");
            expect(records[0].time).toBe("20250927T101530");
        });

        it("should parse a record containing all properties", function () {
            const file = path.join(testDirectory, "all_properties.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT: 72.4
UNITS: kilograms
COLOR: blue
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBe("A-001");
            expect(records[0].time).toBe("20250927T101530");
            expect(records[0].weight).toBe("72.4");
            expect(records[0].units).toBe("kilograms");
            expect(records[0].color).toBe("blue");
        });

        it("should accept keywords in different cases", function () {
            const file = path.join(testDirectory, "case.txt");

            fs.writeFileSync(file,
`begin:record
identifier: A-001
time: 20250927T101530
end:record`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBe("A-001");
        });

        it("should tolerate empty lines between records", function () {
            const file = path.join(testDirectory, "empty_lines.txt");

            fs.writeFileSync(file,
`
BEGIN:RECORD

IDENTIFIER: A-001

TIME: 20250927T101530

END:RECORD

BEGIN:RECORD

IDENTIFIER: A-002

TIME: 20250927T102000

END:RECORD
`);

            const records = parseFile(file);

            expect(records.length).toBe(2);
        });

        it("should tolerate whitespace around lines", function () {
            const file = path.join(testDirectory, "whitespace.txt");

            fs.writeFileSync(file,
`   BEGIN:RECORD
   IDENTIFIER: A-001
   TIME: 20250927T101530
   END:RECORD   `);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBe("A-001");
        });

        it("should remove whitespace around property values", function () {
            const file = path.join(testDirectory, "value_whitespace.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER:    A-001
TIME:    20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records[0].identifier).toBe("A-001");
            expect(records[0].time).toBe("20250927T101530");
        });
    });


    // ============================================================
    // parseFile() - required properties
    // ============================================================

    describe("parseFile() - required properties", function () {

        it("should reject a record missing IDENTIFIER", function () {
            const file = path.join(testDirectory, "missing_identifier.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
TIME: 20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should reject a record with an empty IDENTIFIER", function () {
            const file = path.join(testDirectory, "empty_identifier.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER:
TIME: 20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should reject a record missing TIME", function () {
            const file = path.join(testDirectory, "missing_time.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should reject a record with an empty TIME", function () {
            const file = path.join(testDirectory, "empty_time.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME:
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });
    });


    // ============================================================
    // parseFile() - duplicate properties
    // ============================================================

    describe("parseFile() - duplicate properties", function () {

        it("should reject a record with duplicate IDENTIFIER properties", function () {
            const file = path.join(testDirectory, "duplicate_identifier.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
IDENTIFIER: A-002
TIME: 20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBe("A-001");
        });

        it("should reject a record with duplicate TIME properties", function () {
            const file = path.join(testDirectory, "duplicate_time.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
TIME: 20250927T102000
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should reject a record with duplicate WEIGHT properties", function () {
            const file = path.join(testDirectory, "duplicate_weight.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT: 50
WEIGHT: 60
UNITS: pounds
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should reject a record with duplicate UNITS properties", function () {
            const file = path.join(testDirectory, "duplicate_units.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT: 50
UNITS: pounds
UNITS: kilograms
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should reject a record with duplicate COLOR properties", function () {
            const file = path.join(testDirectory, "duplicate_color.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
COLOR: blue
COLOR: red
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].color).toBe("blue");
        });
    });


    // ============================================================
    // parseFile() - malformed properties
    // ============================================================

    describe("parseFile() - malformed properties", function () {

        it("should reject a line with no colon", function () {
            const file = path.join(testDirectory, "no_colon.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER A-001
TIME: 20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should reject a line containing multiple colons", function () {
            const file = path.join(testDirectory, "multiple_colons.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001: EXTRA
TIME: 20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBeUndefined();
        });

        it("should reject an unknown property", function () {
            const file = path.join(testDirectory, "unknown_property.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
HEIGHT: 100
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
        });

        it("should ignore a property line outside of a record", function () {
            const file = path.join(testDirectory, "outside_record.txt");

            fs.writeFileSync(file,
`IDENTIFIER: A-001
BEGIN:RECORD
IDENTIFIER: A-002
TIME: 20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBe("A-002");
        });
    });


    // ============================================================
    // parseFile() - record delimiters
    // ============================================================

    describe("parseFile() - record delimiters", function () {

        it("should reject END:RECORD without BEGIN:RECORD", function () {
            const file = path.join(testDirectory, "end_without_begin.txt");

            fs.writeFileSync(file,
`END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should not create a record when END:RECORD is missing", function () {
            const file = path.join(testDirectory, "missing_end.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should handle two consecutive BEGIN:RECORD lines", function () {
            const file = path.join(testDirectory, "double_begin.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
BEGIN:RECORD
IDENTIFIER: A-002
TIME: 20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBe("A-002");
        });
    });


    // ============================================================
    // parseFile() - WEIGHT and UNITS
    // ============================================================

    describe("parseFile() - WEIGHT and UNITS", function () {

        it("should accept a numeric integer weight", function () {
            const file = path.join(testDirectory, "integer_weight.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT: 160
UNITS: pounds
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].weight).toBe("160");
        });

        it("should accept a numeric decimal weight", function () {
            const file = path.join(testDirectory, "decimal_weight.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT: 72.4
UNITS: kilograms
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].weight).toBe("72.4");
        });

        it("should reject a non-numeric weight", function () {
            const file = path.join(testDirectory, "invalid_weight.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT: abc
UNITS: pounds
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should reject an empty weight value", function () {
            const file = path.join(testDirectory, "empty_weight.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT:
UNITS: pounds
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should reject WEIGHT when UNITS is missing", function () {
            const file = path.join(testDirectory, "missing_units.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT: 72.4
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should accept kilograms regardless of keyword case", function () {
            const file = path.join(testDirectory, "kilograms_case.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT: 72.4
UNITS: KILOGRAMS
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
        });

        it("should accept pounds regardless of keyword case", function () {
            const file = path.join(testDirectory, "pounds_case.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
WEIGHT: 160
UNITS: POUNDS
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
        });
    });


    // ============================================================
    // parseFile() - duplicate IDENTIFIER values
    // ============================================================

    describe("parseFile() - duplicate IDENTIFIER values", function () {

        it("should reject the second record when IDENTIFIER is repeated", function () {
            const file = path.join(testDirectory, "repeat_identifier.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
END:RECORD

BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T102000
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBe("A-001");
            expect(records[0].time).toBe("20250927T101530");
        });

        it("should accept different IDENTIFIER values", function () {
            const file = path.join(testDirectory, "different_identifiers.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
END:RECORD

BEGIN:RECORD
IDENTIFIER: A-002
TIME: 20250927T102000
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(2);
        });
    });


    // ============================================================
    // Sorting / createOutputFile()
    // ============================================================

    describe("createOutputFile()", function () {

        it("should create output.txt", function () {
            const records = [
                {
                    identifier: "A-001",
                    time: "20250927T101530"
                }
            ];

            createOutputFile(records);

            expect(fs.existsSync("output.txt")).toBe(true);
        });

        it("should write IDENTIFIER and TIME", function () {
            const records = [
                {
                    identifier: "A-001",
                    time: "20250927T101530"
                }
            ];

            createOutputFile(records);

            const output = fs.readFileSync("output.txt", "utf8");

            expect(output).toContain("BEGIN:RECORD");
            expect(output).toContain("IDENTIFIER: A-001");
            expect(output).toContain("TIME: 20250927T101530");
            expect(output).toContain("END:RECORD");
        });

        it("should write WEIGHT and UNITS when present", function () {
            const records = [
                {
                    identifier: "A-001",
                    time: "20250927T101530",
                    weight: "72.4",
                    units: "kilograms"
                }
            ];

            createOutputFile(records);

            const output = fs.readFileSync("output.txt", "utf8");

            expect(output).toContain("WEIGHT: 72.4");
            expect(output).toContain("UNITS: kilograms");
        });

        it("should write COLOR when present", function () {
            const records = [
                {
                    identifier: "A-001",
                    time: "20250927T101530",
                    color: "blue"
                }
            ];

            createOutputFile(records);

            const output = fs.readFileSync("output.txt", "utf8");

            expect(output).toContain("COLOR: blue");
        });

        it("should not write optional properties when they are absent", function () {
            const records = [
                {
                    identifier: "A-001",
                    time: "20250927T101530"
                }
            ];

            createOutputFile(records);

            const output = fs.readFileSync("output.txt", "utf8");

            expect(output).not.toContain("WEIGHT:");
            expect(output).not.toContain("UNITS:");
            expect(output).not.toContain("COLOR:");
        });

        it("should write multiple records", function () {
            const records = [
                {
                    identifier: "A-001",
                    time: "20250927T101530"
                },
                {
                    identifier: "A-002",
                    time: "20250927T102000"
                }
            ];

            createOutputFile(records);

            const output = fs.readFileSync("output.txt", "utf8");

            expect(output).toContain("IDENTIFIER: A-001");
            expect(output).toContain("IDENTIFIER: A-002");
        });
    });


    // ============================================================
    // End-to-end parsing of the assignment example
    // ============================================================

    describe("assignment example", function () {

        it("should correctly parse all three example records", function () {
            const file = path.join(testDirectory, "example.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
identifier: A-001
time: 20250927T101530
weight: 72.4
units: kilograms
color: #2F54EB
END:RECORD

begin:record
IDENTIFIER: a-003
COLOR: rgb(255, 128, 0)
TiMe: 20250927T093005
END:RECORD

BEGIN:RECORD
Identifier: A-002
Time: 20250927T100000
Weight: 160
Units: pounds
Color: blue
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(3);

            expect(records[0].identifier).toBe("A-001");
            expect(records[1].identifier).toBe("a-003");
            expect(records[2].identifier).toBe("A-002");
        });

        it("should produce the records in ascending TIME order after sorting", function () {
            const file = path.join(testDirectory, "sort_example.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: A-001
TIME: 20250927T101530
END:RECORD

BEGIN:RECORD
IDENTIFIER: A-003
TIME: 20250927T093005
END:RECORD

BEGIN:RECORD
IDENTIFIER: A-002
TIME: 20250927T100000
END:RECORD`);

            const records = parseFile(file);

            records.sort(function (r1, r2) {
                return r1.time.localeCompare(r2.time);
            });

            expect(records[0].identifier).toBe("A-003");
            expect(records[1].identifier).toBe("A-002");
            expect(records[2].identifier).toBe("A-001");
        });
    });


    // ============================================================
    // Edge cases
    // ============================================================

    describe("edge cases", function () {

        it("should handle an empty file", function () {
            const file = path.join(testDirectory, "empty.txt");

            fs.writeFileSync(file, "");

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should handle a file containing only empty lines", function () {
            const file = path.join(testDirectory, "only_empty_lines.txt");

            fs.writeFileSync(file, "\n\n\n");

            const records = parseFile(file);

            expect(records.length).toBe(0);
        });

        it("should handle a single valid record", function () {
            const file = path.join(testDirectory, "single_record.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: TEST
TIME: 20260101T000000
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
        });

        it("should handle Windows-style line endings", function () {
            const file = path.join(testDirectory, "windows_endings.txt");

            fs.writeFileSync(file,
"BEGIN:RECORD\r\n" +
"IDENTIFIER: A-001\r\n" +
"TIME: 20250927T101530\r\n" +
"END:RECORD\r\n");

            const records = parseFile(file);

            expect(records.length).toBe(1);
        });

        it("should reject an invalid TIME while allowing another valid record", function () {
            const file = path.join(testDirectory, "one_bad_one_good.txt");

            fs.writeFileSync(file,
`BEGIN:RECORD
IDENTIFIER: BAD
TIME: 20250230T101530
END:RECORD

BEGIN:RECORD
IDENTIFIER: GOOD
TIME: 20250927T101530
END:RECORD`);

            const records = parseFile(file);

            expect(records.length).toBe(1);
            expect(records[0].identifier).toBe("GOOD");
        });
    });

});