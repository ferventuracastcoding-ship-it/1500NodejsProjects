// ==========================================
// NODE.JS MEGABYTE TO KILOBYTE CONVERTER
// ==========================================

// Import Node's readline module.
const readline = require("readline");

// Create the terminal interface.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ==========================================
// HEADER
// ==========================================

console.log(`
==============================================
       MEGABYTES → KILOBYTES CONVERTER
==============================================

Formula:

    KB = MB × 1024

Examples:

    1 MB   = 1024 KB
    5 MB   = 5120 KB
    10 MB  = 10240 KB
    100 MB = 102400 KB

==============================================
`);

// ==========================================
// CONVERSION FUNCTION
// ==========================================

function megabytesToKilobytes(megabytes) {

    // Convert MB to KB.
    return megabytes * 1024;
}

// ==========================================
// ASK USER
// ==========================================

function askForMegabytes() {

    // Ask user for megabytes.
    rl.question(
        "Enter megabytes: ",
        (input) => {

            // Convert input into a number.
            const megabytes = Number(input);

            // Check whether input is valid.
            if (
                Number.isNaN(megabytes) ||
                megabytes < 0
            ) {

                console.log(
                    "Error: Enter a positive number."
                );

                askForMegabytes();

                return;
            }

            // Convert MB to KB.
            const kilobytes =
                megabytesToKilobytes(megabytes);

            // Display result.
            console.log(`
==============================================

${megabytes} MB = ${kilobytes.toLocaleString()} KB

==============================================
`);

            // Ask whether the user wants another conversion.
            rl.question(
                "Convert another? (y/n): ",
                (answer) => {

                    // Continue if user enters y.
                    if (
                        answer.toLowerCase() === "y"
                    ) {

                        askForMegabytes();

                    } else {

                        console.log(
                            "\nConverter closed."
                        );

                        rl.close();
                    }
                }
            );
        }
    );
}

// ==========================================
// START
// ==========================================

askForMegabytes();
