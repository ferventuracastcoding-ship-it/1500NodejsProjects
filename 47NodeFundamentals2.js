// Import the Node.js file system module.
const fs = require("fs");

// Import the Node.js path module.
const path = require("path");

// Import our custom robot module.
const robots = require("./robots");

// Import our custom mission module.
const missions = require("./missions");

// Display the application title.
console.log("======================================");
console.log("     NODE.JS ROBOT MISSION MANAGER");
console.log("======================================");

// Create the data directory path.
const dataDirectory = path.join(__dirname, "data");

// Create the data directory if it does not exist.
if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
}

// Create robot data.
const robotList = [
    {
        id: 1,
        name: "ROVER-001",
        type: "Mars Rover",
        status: "Ready",
        battery: 95
    },
    {
        id: 2,
        name: "ROBOT-002",
        type: "Mining Robot",
        status: "Active",
        battery: 72
    },
    {
        id: 3,
        name: "DRONE-003",
        type: "Survey Drone",
        status: "Charging",
        battery: 41
    }
];

// Convert the JavaScript array into JSON.
const jsonData = JSON.stringify(robotList, null, 2);

// Save the robots to a file.
fs.writeFileSync(
    path.join(dataDirectory, "robots.json"),
    jsonData
);

// Read the JSON file.
const fileData = fs.readFileSync(
    path.join(dataDirectory, "robots.json"),
    "utf8"
);

// Convert JSON back into JavaScript.
const loadedRobots = JSON.parse(fileData);

// Display all robots.
console.log("\nROBOT FLEET:");

loadedRobots.forEach(robot => {
    console.log(
        `${robot.id}. ${robot.name} | ${robot.type} | ` +
        `${robot.status} | Battery: ${robot.battery}%`
    );
});

// Count robots.
console.log(
    "\nTotal Robots:",
    robots.count(loadedRobots)
);

// Find a specific robot.
const selectedRobot = robots.findById(loadedRobots, 2);

console.log("\nSELECTED ROBOT:");

console.log(selectedRobot);

// Find robots with battery above 50%.
const healthyRobots = loadedRobots.filter(
    robot => robot.battery >= 50
);

console.log("\nROBOTS WITH 50%+ BATTERY:");

healthyRobots.forEach(robot => {
    console.log(`${robot.name}: ${robot.battery}%`);
});

// Create a mission.
const mission = missions.createMission(
    "Mars Survey",
    "ROVER-001",
    "Mars"
);

console.log("\nNEW MISSION:");
console.log(mission);

// Demonstrate Promise and async/await.
async function startMission() {

    const result = await missions.startMission(mission);

    console.log("\nMISSION STATUS:");
    console.log(result);
}

// Start the mission.
startMission();
