// ==========================================
// NODE.JS + MONGODB CRUD APPLICATION
// ==========================================

// Import MongoDB.
const { MongoClient, ObjectId } = require("mongodb");

// Import readline.
const readline = require("readline");

// ==========================================
// MONGODB CONFIGURATION
// ==========================================

// MongoDB connection URL.
const MONGO_URL = "mongodb://127.0.0.1:27017";

// Database name.
const DATABASE_NAME = "nodeCrudDatabase";

// Collection name.
const COLLECTION_NAME = "users";

// Create MongoDB client.
const client = new MongoClient(MONGO_URL);

// Store the collection.
let collection;

// ==========================================
// TERMINAL
// ==========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ==========================================
// CONNECT TO MONGODB
// ==========================================

async function connectDatabase() {

    try {

        // Connect to MongoDB.
        await client.connect();

        // Select database.
        const database =
            client.db(DATABASE_NAME);

        // Select collection.
        collection =
            database.collection(COLLECTION_NAME);

        console.log(`
========================================
       MONGODB CRUD APPLICATION
========================================

Connected to MongoDB!

Database:
${DATABASE_NAME}

Collection:
${COLLECTION_NAME}

Commands:

  create   Create a record
  read     Read all records
  find     Find a record
  update   Update a record
  delete   Delete a record
  count    Count records
  clear    Delete ALL records
  help     Show commands
  exit     Exit

========================================
`);

        // Start terminal.
        askCommand();

    } catch (error) {

        console.log(`
MongoDB connection failed.

Make sure MongoDB is running.

Error:
${error.message}
`);

        process.exit(1);
    }
}

// ==========================================
// CREATE
// ==========================================

async function createRecord() {

    // Ask for name.
    rl.question("Name: ", (name) => {

        // Ask for email.
        rl.question("Email: ", async (email) => {

            // Ask for age.
            rl.question("Age: ", async (age) => {

                try {

                    // Create the record.
                    const record = {
                        name: name,
                        email: email,
                        age: Number(age),
                        createdAt: new Date()
                    };

                    // Insert into MongoDB.
                    const result =
                        await collection.insertOne(record);

                    console.log(`
Record created!

ID:
${result.insertedId}

Name:
${name}

Email:
${email}

Age:
${age}
`);

                } catch (error) {

                    console.log(
                        `Create error: ${error.message}`
                    );
                }

                // Return to menu.
                askCommand();
            });
        });
    });
}

// ==========================================
// READ
// ==========================================

async function readRecords() {

    try {

        // Find every record.
        const records =
            await collection.find({}).toArray();

        // Check whether records exist.
        if (records.length === 0) {

            console.log("\nNo records found.\n");

            askCommand();

            return;
        }

        console.log(`
========================================
              ALL RECORDS
========================================
`);

        // Display every record.
        records.forEach((record, index) => {

            console.log(`
Record #${index + 1}

ID:
${record._id}

Name:
${record.name}

Email:
${record.email}

Age:
${record.age}

Created:
${record.createdAt}

----------------------------------------
`);
        });

        askCommand();

    } catch (error) {

        console.log(
            `Read error: ${error.message}`
        );

        askCommand();
    }
}

// ==========================================
// FIND
// ==========================================

async function findRecord() {

    // Ask for ID.
    rl.question("Enter record ID: ", async (id) => {

        try {

            // Find record by MongoDB ObjectId.
            const record =
                await collection.findOne({
                    _id: new ObjectId(id)
                });

            // Check result.
            if (!record) {

                console.log(
                    "\nRecord not found.\n"
                );

                askCommand();

                return;
            }

            // Display record.
            console.log(`
========================================
              RECORD FOUND
========================================

ID:
${record._id}

Name:
${record.name}

Email:
${record.email}

Age:
${record.age}

Created:
${record.createdAt}

========================================
`);

        } catch (error) {

            console.log(
                `Find error: ${error.message}`
            );
        }

        askCommand();
    });
}

// ==========================================
// UPDATE
// ==========================================

async function updateRecord() {

    // Ask for ID.
    rl.question("Enter record ID: ", (id) => {

        // Ask for new name.
        rl.question("New name: ", (name) => {

            // Ask for new email.
            rl.question("New email: ", (email) => {

                // Ask for new age.
                rl.question("New age: ", async (age) => {

                    try {

                        // Update the record.
                        const result =
                            await collection.updateOne(
                                {
                                    _id: new ObjectId(id)
                                },
                                {
                                    $set: {
                                        name: name,
                                        email: email,
                                        age: Number(age),
                                        updatedAt:
                                            new Date()
                                    }
                                }
                            );

                        // Check whether anything changed.
                        if (result.matchedCount === 0) {

                            console.log(
                                "\nRecord not found.\n"
                            );

                        } else {

                            console.log(
                                "\nRecord updated successfully.\n"
                            );
                        }

                    } catch (error) {

                        console.log(
                            `Update error: ${error.message}`
                        );
                    }

                    askCommand();
                });
            });
        });
    });
}

// ==========================================
// DELETE
// ==========================================

async function deleteRecord() {

    // Ask for ID.
    rl.question("Enter record ID: ", async (id) => {

        try {

            // Delete the record.
            const result =
                await collection.deleteOne({
                    _id: new ObjectId(id)
                });

            // Check result.
            if (result.deletedCount === 0) {

                console.log(
                    "\nRecord not found.\n"
                );

            } else {

                console.log(
                    "\nRecord deleted successfully.\n"
                );
            }

        } catch (error) {

            console.log(
                `Delete error: ${error.message}`
            );
        }

        askCommand();
    });
}

// ==========================================
// COUNT
// ==========================================

async function countRecords() {

    try {

        // Count documents.
        const count =
            await collection.countDocuments();

        // Display count.
        console.log(`
========================================

Total Records: ${count}

========================================
`);

    } catch (error) {

        console.log(
            `Count error: ${error.message}`
        );
    }

    askCommand();
}

// ==========================================
// CLEAR DATABASE
// ==========================================

async function clearRecords() {

    // Ask for confirmation.
    rl.question(
        "Delete ALL records? (yes/no): ",
        async (answer) => {

            // Check confirmation.
            if (
                answer.toLowerCase() !== "yes"
            ) {

                console.log(
                    "\nOperation cancelled.\n"
                );

                askCommand();

                return;
            }

            try {

                // Delete every document.
                const result =
                    await collection.deleteMany({});

                console.log(`
Deleted ${result.deletedCount} record(s).
`);

            } catch (error) {

                console.log(
                    `Clear error: ${error.message}`
                );
            }

            askCommand();
        }
    );
}

// ==========================================
// HELP
// ==========================================

function showHelp() {

    console.log(`
========================================
              CRUD COMMANDS
========================================

create
Create a new MongoDB record.

read
Display every record.

find
Find one record by ID.

update
Update an existing record.

delete
Delete a record by ID.

count
Count all records.

clear
Delete all records.

help
Display this menu.

exit
Close the application.

========================================
`);

    askCommand();
}

// ==========================================
// COMMAND HANDLER
// ==========================================

function handleCommand(command) {

    // Convert command to lowercase.
    command =
        command.trim().toLowerCase();

    // CREATE.
    if (command === "create") {

        createRecord();

        return;
    }

    // READ.
    if (command === "read") {

        readRecords();

        return;
    }

    // FIND.
    if (command === "find") {

        findRecord();

        return;
    }

    // UPDATE.
    if (command === "update") {

        updateRecord();

        return;
    }

    // DELETE.
    if (command === "delete") {

        deleteRecord();

        return;
    }

    // COUNT.
    if (command === "count") {

        countRecords();

        return;
    }

    // CLEAR.
    if (command === "clear") {

        clearRecords();

        return;
    }

    // HELP.
    if (command === "help") {

        showHelp();

        return;
    }

    // EXIT.
    if (command === "exit") {

        console.log(
            "\nClosing MongoDB connection..."
        );

        // Close MongoDB.
        client.close().then(() => {

            console.log(
                "MongoDB disconnected."
            );

            console.log(
                "CRUD application closed."
            );

            rl.close();
        });

        return;
    }

    // Unknown command.
    console.log(
        "\nUnknown command. Type 'help'.\n"
    );

    askCommand();
}

// ==========================================
// TERMINAL PROMPT
// ==========================================

function askCommand() {

    rl.question(
        "mongodb-crud> ",
        handleCommand
    );
}

// ==========================================
// START APPLICATION
// ==========================================

connectDatabase();
