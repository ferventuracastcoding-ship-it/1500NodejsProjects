simple-calculator-api/
│
├── src/
│   ├── routes/
│   │   └── calculator.js
│   ├── controllers/
│   │   └── calculatorController.js
│   └── server.js
│
├── package.json
└── README.md

// Addition
exports.add = (req, res) => {
    const { a, b } = req.body;

    res.json({
        operation: "addition",
        a,
        b,
        result: a + b
    });
};

// Subtraction
exports.subtract = (req, res) => {
    const { a, b } = req.body;

    res.json({
        operation: "subtraction",
        a,
        b,
        result: a - b
    });
};

// Multiplication
exports.multiply = (req, res) => {
    const { a, b } = req.body;

    res.json({
        operation: "multiplication",
        a,
        b,
        result: a * b
    });
};

// Division
exports.divide = (req, res) => {
    const { a, b } = req.body;

    if (b === 0) {
        return res.status(400).json({
            error: "Division by zero is not allowed"
        });
    }

    res.json({
        operation: "division",
        a,
        b,
        result: a / b
    });
};
