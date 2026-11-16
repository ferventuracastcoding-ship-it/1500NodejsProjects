// ==========================================
// NODE.JS TERMINAL CALCULATOR
// ==========================================

// Import Node's built-in readline module.
const readline = require("readline");

// Create the terminal interface.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Store calculator history.
const history = [];

// Display the calculator title.
console.log(`
==========================================
        NODE.JS TERMINAL CALCULATOR
==========================================

Commands:
  +       Addition
  -       Subtraction
  *       Multiplication
  /       Division
  ^       Power
  %       Percentage
  sqrt    Square root
  history Show calculation history
  clear   Clear history
  help    Show commands
  exit    Quit calculator

Examples:
  10 + 5
  20 * 4
  100 / 5
  2 ^ 8
  50%
  sqrt 144

==========================================
`);

// Ask the user for input.
function askQuestion() {
    rl.question("calc> ", handleInput);
}

// Calculate two numbers.
function calculate(num1, operator, num2) {

    switch (operator) {

        // Addition.
        case "+":
            return num1 + num2;

        // Subtraction.
        case "-":
            return num1 - num2;

        // Multiplication.
        case "*":
            return num1 * num2;

        // Division.
        case "/":

            // Prevent division by zero.
            if (num2 === 0) {
                return "Error: Cannot divide by zero.";
            }

            return num1 / num2;

        // Exponentiation.
        case "^":
            return Math.pow(num1, num2);

        // Unknown operator.
        default:
            return "Error: Unknown operator.";
    }
}

// Format numbers nicely.
function formatNumber(number) {

    // Return errors without formatting.
    if (typeof number === "string") {
        return number;
    }

    // Round extremely small floating-point errors.
    if (Math.abs(number) < 0.0000000001) {
        number = 0;
    }

    return Number(number.toFixed(10));
}

// Process terminal input.
function handleInput(input) {

    // Remove extra spaces.
    input = input.trim();

    // Ignore empty input.
    if (input === "") {
        askQuestion();
        return;
    }

    // Exit command.
    if (input.toLowerCase() === "exit") {

        console.log("\nCalculator closed. Goodbye!");

        rl.close();

        return;
    }

    // Help command.
    if (input.toLowerCase() === "help") {

        console.log(`
Available commands:

  10 + 5       Addition
  10 - 5       Subtraction
  10 * 5       Multiplication
  10 / 5       Division
  2 ^ 8        Power
  50%          Percentage
  sqrt 144     Square root
  history      Show history
  clear        Clear history
  help         Show help
  exit         Exit calculator
`);

        askQuestion();

        return;
    }

    // Show history.
    if (input.toLowerCase() === "history") {

        if (history.length === 0) {

            console.log("\nNo calculations yet.\n");

        } else {

            console.log("\n========== HISTORY ==========");

            history.forEach((calculation, index) => {
                console.log(`${index + 1}. ${calculation}`);
            });

            console.log("=============================\n");
        }

        askQuestion();

        return;
    }

    // Clear history.
    if (input.toLowerCase() === "clear") {

        history.length = 0;

        console.log("\nHistory cleared.\n");

        askQuestion();

        return;
    }

    // Handle square root.
    if (input.toLowerCase().startsWith("sqrt")) {

        const value = Number(input.substring(4).trim());

        if (isNaN(value)) {

            console.log("Error: Enter a valid number.");

        } else if (value < 0) {

            console.log("Error: Cannot square-root a negative number.");

        } else {

            const result = formatNumber(Math.sqrt(value));

            const calculation = `√${value} = ${result}`;

            console.log(`Result: ${result}`);

            history.push(calculation);
        }

        askQuestion();

        return;
    }

    // Handle percentages.
    if (input.endsWith("%")) {

        const value = Number(input.slice(0, -1));

        if (isNaN(value)) {

            console.log("Error: Invalid percentage.");

        } else {

            const result = formatNumber(value / 100);

            const calculation = `${value}% = ${result}`;

            console.log(`Result: ${result}`);

            history.push(calculation);
        }

        askQuestion();

        return;
    }

    // Match standard calculations.
    const match = input.match(
        /^(-?\d+(?:\.\d+)?)\s*([+\-*\/^])\s*(-?\d+(?:\.\d+)?)$/
    );

    // Check whether the expression is valid.
    if (!match) {

        console.log(
            "Error: Invalid expression. Example: 10 + 5"
        );

        askQuestion();

        return;
    }

    // Extract the first number.
    const num1 = Number(match[1]);

    // Extract the operator.
    const operator = match[2];

    // Extract the second number.
    const num2 = Number(match[3]);

    // Perform the calculation.
    const result = formatNumber(
        calculate(num1, operator, num2)
    );

    // Display the result.
    console.log(`Result: ${result}`);

    // Save successful calculations.
    if (typeof result !== "string") {

        history.push(
            `${num1} ${operator} ${num2} = ${result}`
        );
    }

    // Ask for another calculation.
    askQuestion();
}

// Start the calculator.
askQuestion();

// Handle terminal closing.
rl.on("close", () => {
    process.exit(0);
});
