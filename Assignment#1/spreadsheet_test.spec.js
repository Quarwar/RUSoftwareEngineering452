/*
    Jasmine Test Cases for spreadsheet.js
    Author: Joseph Signorile
    Cite: ChatGPT (used for generating some test csv's)
*/
const fs = require('node:fs');
const path = require('node:path');
const { isValidFile, displayTable } = require('../../spreadsheet.js');
const testDir = path.join(__dirname, 'test_files');

// Create test files before running tests
beforeAll(() => {
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }

    // Normal CSV
    fs.writeFileSync(
        path.join(testDir, 'valid.csv'),
        'Name,Age,Major\nJoe,21,Engineering\nBob,20,Computer Science'
    );

    // Empty CSV
    fs.writeFileSync(
        path.join(testDir, 'empty.csv'),
        ''
    );

    // Jagged CSV
    fs.writeFileSync(
        path.join(testDir, 'jagged.csv'),
        'Name,Age,Major\nJoe,21\nBob,20,Computer Science'
    );

    // Blank cells
    fs.writeFileSync(
        path.join(testDir, 'blank_cells.csv'),
        'Name,Age,Major\nJoe,,Engineering\n,20,Computer Science'
    );

    // Spreadsheet formulas
    fs.writeFileSync(
        path.join(testDir, 'formulas.csv'),
        'Name,Formula\nJoe,=SUM(A1:A5)\nBob,=AVERAGE(B1:B5)'
    );

    // Trailing commas
    fs.writeFileSync(
        path.join(testDir, 'trailing_comma.csv'),
        'Name,Age,Major,\nJoe,21,Engineering,\nBob,20,CS,'
    );

    // Long values
    fs.writeFileSync(
        path.join(testDir, 'long_values.csv'),
        'Name,Description\nJoe,Short\nJoseph,This is a very long description'
    );
});

describe('isValidFile()', () => {

    it('should accept a valid CSV file', () => {
        const filename = path.join(testDir, 'valid.csv');

        expect(isValidFile(filename)).toBe(true);
    });

    it('should reject an undefined filename', () => {
        expect(isValidFile(undefined)).toBe(false);
    });

    it('should reject a file that does not have a .csv extension', () => {
        const filename = path.join(testDir, 'not_a_csv.txt');

        fs.writeFileSync(filename, 'Name,Age\nJoe,21');

        expect(isValidFile(filename)).toBe(false);

        fs.unlinkSync(filename);
    });

    it('should reject a nonexistent file', () => {
        const filename = path.join(testDir, 'does_not_exist.csv');

        expect(isValidFile(filename)).toBe(false);
    });

    it('should reject an empty CSV file', () => {
        const filename = path.join(testDir, 'empty.csv');

        expect(isValidFile(filename)).toBe(false);
    });

    it('should reject a CSV with rows containing different numbers of fields', () => {
        const filename = path.join(testDir, 'jagged.csv');

        expect(isValidFile(filename)).toBe(false);
    });

    it('should accept a CSV containing empty cells', () => {
        const filename = path.join(testDir, 'blank_cells.csv');

        expect(isValidFile(filename)).toBe(true);
    });

    it('should accept a CSV containing formulas as plain text', () => {
        const filename = path.join(testDir, 'formulas.csv');

        expect(isValidFile(filename)).toBe(true);
    });

    it('should accept a CSV containing trailing commas', () => {
        const filename = path.join(testDir, 'trailing_comma.csv');

        expect(isValidFile(filename)).toBe(true);
    });

    it('should accept a CSV containing long values', () => {
        const filename = path.join(testDir, 'long_values.csv');

        expect(isValidFile(filename)).toBe(true);
    });
});


describe('displayTable()', () => {

    let consoleOutput;

    beforeEach(() => {
        consoleOutput = [];

        spyOn(console, 'log').and.callFake(message => {
            consoleOutput.push(message);
        });
    });

    it('should print every row of a valid CSV', () => {
        const filename = path.join(testDir, 'valid.csv');

        displayTable(filename);

        expect(consoleOutput.length).toBe(3);

        expect(consoleOutput[0]).toContain('Name');
        expect(consoleOutput[0]).toContain('Age');
        expect(consoleOutput[0]).toContain('Major');

        expect(consoleOutput[1]).toContain('Joe');
        expect(consoleOutput[1]).toContain('21');
        expect(consoleOutput[1]).toContain('Engineering');

        expect(consoleOutput[2]).toContain('Bob');
        expect(consoleOutput[2]).toContain('20');
        expect(consoleOutput[2]).toContain('Computer Science');
    });

    it('should align columns using spaces', () => {
        const filename = path.join(testDir, 'valid.csv');

        displayTable(filename);

        // Every row should have the same overall width.
        expect(consoleOutput[0].length).toBe(consoleOutput[1].length);
        expect(consoleOutput[1].length).toBe(consoleOutput[2].length);
    });

    it('should print empty cells without crashing', () => {
        const filename = path.join(testDir, 'blank_cells.csv');

        expect(() => {
            displayTable(filename);
        }).not.toThrow();

        expect(consoleOutput.length).toBe(3);
    });

    it('should print formulas as plain text', () => {
        const filename = path.join(testDir, 'formulas.csv');

        displayTable(filename);

        expect(consoleOutput[1]).toContain('=SUM(A1:A5)');
        expect(consoleOutput[2]).toContain('=AVERAGE(B1:B5)');
    });

    it('should print trailing empty columns', () => {
        const filename = path.join(testDir, 'trailing_comma.csv');

        displayTable(filename);

        expect(consoleOutput.length).toBe(3);

        // There should be four columns because of the trailing comma.
        expect(consoleOutput[0]).toContain('Name');
        expect(consoleOutput[0]).toContain('Age');
        expect(consoleOutput[0]).toContain('Major');
    });

    it('should handle long cell values', () => {
        const filename = path.join(testDir, 'long_values.csv');

        expect(() => {
            displayTable(filename);
        }).not.toThrow();

        expect(consoleOutput[1]).toContain('Short');
        expect(consoleOutput[2]).toContain(
            'This is a very long description'
        );
    });
});


describe('extraneous CSV cases', () => {

    it('should handle a CSV containing only one column', () => {
        const filename = path.join(testDir, 'one_column.csv');

        fs.writeFileSync(
            filename,
            'Name\nJoe\nBob\nAlice'
        );

        expect(isValidFile(filename)).toBe(true);

        fs.unlinkSync(filename);
    });

    it('should handle a CSV containing only one row', () => {
        const filename = path.join(testDir, 'one_row.csv');

        fs.writeFileSync(
            filename,
            'Name,Age,Major'
        );

        expect(isValidFile(filename)).toBe(true);

        expect(() => {
            displayTable(filename);
        }).not.toThrow();

        fs.unlinkSync(filename);
    });

    it('should handle numerical and non-numerical values', () => {
        const filename = path.join(testDir, 'mixed_values.csv');

        fs.writeFileSync(
            filename,
            'Name,Age,GPA\nJoe,21,3.8\nBob,20,3.5'
        );

        expect(isValidFile(filename)).toBe(true);

        fs.unlinkSync(filename);
    });

    it('should handle spaces and tabs inside cells', () => {
        const filename = path.join(testDir, 'spaces_tabs.csv');

        fs.writeFileSync(
            filename,
            'Name,Description\nJoe,Hello World\nBob,Hello\tWorld'
        );

        expect(isValidFile(filename)).toBe(true);

        fs.unlinkSync(filename);
    });
});


afterAll(() => {
    // Remove all test files
    if (fs.existsSync(testDir)) {
        const files = fs.readdirSync(testDir);

        files.forEach(file => {
            fs.unlinkSync(path.join(testDir, file));
        });

        fs.rmdirSync(testDir);
    }
});