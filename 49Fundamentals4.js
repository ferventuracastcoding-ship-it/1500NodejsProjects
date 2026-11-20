// Import the file system module.
const fs = require("fs");

// Import the path module.
const path = require("path");

// Create the path to our JSON database.
const databasePath = path.join(
    __dirname,
    "data",
    "robots.json"
);

// Make sure the data directory exists.
function initializeDatabase() {

    const directory =
        path.dirname(databasePath);

    if (!fs.existsSync(directory)) {

        fs.mkdirSync(directory, {
            recursive: true
        });
    }

    // Create the database if it does not exist.
    if (!fs.existsSync(databasePath)) {

        fs.writeFileSync(
            databasePath,
            JSON.stringify([], null, 2)
        );
    }
}

// Read robots from the JSON database.
function readRobots() {

    initializeDatabase();

    const data =
        fs.readFileSync(
            databasePath,
            "utf8"
        );

    return JSON.parse(data);
}

// Save robots to the JSON database.
function saveRobots(robots) {

    fs.writeFileSync(
        databasePath,
        JSON.stringify(
            robots,
            null,
            2
        )
    );
}

// Get every robot.
function getAll() {

    return readRobots();
}

// Find one robot.
function getById(id) {

    const robots = readRobots();

    return robots.find(
        robot => robot.id === id
    );
}

// Create a robot.
function create(data) {

    const robots = readRobots();

    // Validate required fields.
    if (!data.name || !data.type) {

        throw new Error(
            "Robot name and type are required."
        );
    }

    // Generate a new ID.
    const newId =
        robots.length > 0
            ? Math.max(
                ...robots.map(robot => robot.id)
            ) + 1
            : 1;

    // Create the robot object.
    const newRobot = {

        id: newId,

        name: data.name,

        type: data.type,

        status:
            data.status || "Ready",

        battery:
            data.battery ?? 100
    };

    // Add robot to the array.
    robots.push(newRobot);

    // Save the updated database.
    saveRobots(robots);

    return newRobot;
}

// Update a robot.
function update(id, updates) {

    const robots = readRobots();

    // Find the robot index.
    const index = robots.findIndex(
        robot => robot.id === id
    );

    // Return null if it doesn't exist.
    if (index === -1) {

        return null;
    }

    // Update the robot.
    robots[index] = {
        ...robots[index],
        ...updates,
        id: id
    };

    // Save changes.
    saveRobots(robots);

    return robots[index];
}

// Delete a robot.
function remove(id) {

    const robots = readRobots();

    // Find the robot.
    const index = robots.findIndex(
        robot => robot.id === id
    );

    // Robot doesn't exist.
    if (index === -1) {

        return null;
    }

    // Remove the robot.
    const deletedRobot =
        robots.splice(index, 1)[0];

    // Save the new array.
    saveRobots(robots);

    return deletedRobot;
}

// Export our functions.
module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
