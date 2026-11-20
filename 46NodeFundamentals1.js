// Import Node's built-in file system module. 
// This code it to praactice syntax
const fs = require("fs");

// Import Node's path module.
const path = require("path");

// Import the custom users module.
const users = require("./modules/users");

// Create the path to the data directory.
const dataDirectory = path.join(__dirname, "data");

// Create the data directory if it does not exist.
if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
}

// Display the application title.
console.log("=================================");
console.log("   NODE.JS FUNDAMENTALS LAB");
console.log("=================================");

// Create an array of users.
const userList = [
    {
        id: 1,
        name: "Fernando",
        role: "Developer"
    },
    {
        id: 2,
        name: "Alex",
        role: "Engineer"
    }
];

// Save users to a JSON file.
fs.writeFileSync(
    path.join(dataDirectory, "users.json"),
    JSON.stringify(userList, null, 2)
);

// Read the JSON file.
const savedUsers = fs.readFileSync(
    path.join(dataDirectory, "users.json"),
    "utf8"
);

// Convert JSON text back into JavaScript data.
const parsedUsers = JSON.parse(savedUsers);

// Display users.
console.log("\nUSERS:");

parsedUsers.forEach(user => {
    console.log(`${user.id}: ${user.name} - ${user.role}`);
});

// Demonstrate a custom module.
console.log("\nUSER COUNT:", users.count(parsedUsers));

// Demonstrate filtering.
const developers = parsedUsers.filter(
    user => user.role === "Developer"
);

console.log("\nDEVELOPERS:");
console.log(developers);

// Demonstrate mapping.
const names = parsedUsers.map(
    user => user.name
);

console.log("\nUSER NAMES:");
console.log(names);
