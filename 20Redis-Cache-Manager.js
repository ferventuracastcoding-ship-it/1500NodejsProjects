// ==========================================
// NODE.JS REDIS CACHE MANAGER
// ==========================================

// Import the Redis client.
const { createClient } = require("redis");

// Import readline for terminal input.
const readline = require("readline");

// ==========================================
// REDIS CONFIGURATION
// ==========================================

// Create a Redis client.
const redis = createClient({
    url: "redis://127.0.0.1:6379"
});

// ==========================================
// REDIS ERROR HANDLER
// ==========================================

redis.on("error", (error) => {

    // Display Redis connection errors.
    console.log(
        `Redis Error: ${error.message}`
    );
});

// ==========================================
// TERMINAL INTERFACE
// ==========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ==========================================
// HEADER
// ==========================================

console.log(`
================================================
             REDIS CACHE MANAGER
================================================

Cache frequently accessed data using Redis.

Commands:

  set <key> <value>    Store data
  get <key>            Retrieve cached data
  delete <key>         Delete cached data
  exists <key>         Check cache
  ttl <key>            Show expiration
  list                 List cached keys
  clear                Clear entire cache
  demo                 Run cache demonstration
  stats                Show Redis statistics
  help                 Show commands
  exit                 Exit

Examples:

  set user:1 Fernando
  get user:1
  delete user:1
  ttl user:1

================================================
`);

// ==========================================
// SET CACHE
// ==========================================

async function setCache(key, value) {

    // Make sure a key was provided.
    if (!key) {

        console.log(
            "Error: Enter a cache key."
        );

        return;
    }

    // Make sure a value was provided.
    if (!value) {

        console.log(
            "Error: Enter a value."
        );

        return;
    }

    // Store the value in Redis.
    await redis.set(key, value);

    // Display confirmation.
    console.log(`
CACHE SET

Key:
${key}

Value:
${value}
`);
}

// ==========================================
// SET CACHE WITH EXPIRATION
// ==========================================

async function setCacheWithExpiration(
    key,
    value,
    seconds
) {

    // Store value with expiration time.
    await redis.set(
        key,
        value,
        {
            EX: seconds
        }
    );

    // Display confirmation.
    console.log(`
CACHE SET

Key:
${key}

Value:
${value}

Expires:
${seconds} seconds
`);
}

// ==========================================
// GET CACHE
// ==========================================

async function getCache(key) {

    // Make sure a key exists.
    if (!key) {

        console.log(
            "Error: Enter a cache key."
        );

        return;
    }

    // Look for the key in Redis.
    const value = await redis.get(key);

    // Check whether data exists.
    if (value === null) {

        console.log(`
CACHE MISS

Key:
${key}

Data was not found in Redis.
`);

        return;
    }

    // Display cached data.
    console.log(`
CACHE HIT

Key:
${key}

Value:
${value}
`);
}

// ==========================================
// DELETE CACHE
// ==========================================

async function deleteCache(key) {

    // Delete the key.
    const result = await redis.del(key);

    // Check result.
    if (result === 1) {

        console.log(
            `Deleted cache key: ${key}`
        );

    } else {

        console.log(
            `Cache key not found: ${key}`
        );
    }
}

// ==========================================
// CHECK CACHE
// ==========================================

async function checkCache(key) {

    // Check whether the key exists.
    const exists = await redis.exists(key);

    // Display result.
    if (exists) {

        console.log(
            `CACHE EXISTS: ${key}`
        );

    } else {

        console.log(
            `CACHE DOES NOT EXIST: ${key}`
        );
    }
}

// ==========================================
// SHOW TTL
// ==========================================

async function showTTL(key) {

    // Get remaining expiration time.
    const seconds = await redis.ttl(key);

    // Display result.
    if (seconds === -1) {

        console.log(
            `${key} has no expiration.`
        );

    } else if (seconds === -2) {

        console.log(
            `${key} does not exist.`
        );

    } else {

        console.log(
            `${key} expires in ${seconds} seconds.`
        );
    }
}

// ==========================================
// LIST KEYS
// ==========================================

async function listKeys() {

    // Get all Redis keys.
    const keys = await redis.keys("*");

    // Check whether cache is empty.
    if (keys.length === 0) {

        console.log(
            "\nRedis cache is empty.\n"
        );

        return;
    }

    // Display header.
    console.log(`
========================================
             REDIS CACHE
========================================
`);

    // Display every key.
    keys.forEach((key, index) => {

        console.log(
            `${index + 1}. ${key}`
        );
    });

    console.log(`
========================================
Total Keys: ${keys.length}
========================================
`);
}

// ==========================================
// CLEAR CACHE
// ==========================================

async function clearCache() {

    // Delete every key in the current database.
    await redis.flushDb();

    // Confirm operation.
    console.log(
        "\nRedis cache cleared.\n"
    );
}

// ==========================================
// REDIS STATISTICS
// ==========================================

async function showStats() {

    // Request Redis server information.
    const info = await redis.info();

    // Display information.
    console.log(`
========================================
             REDIS SERVER
========================================

${info}

========================================
`);
}

// ==========================================
// CACHE DEMONSTRATION
// ==========================================

async function runCacheDemo() {

    // Define a demonstration key.
    const key = "demo:user";

    // Check Redis first.
    console.log(`
========================================
           CACHE DEMONSTRATION
========================================

Step 1:
Checking Redis...
`);

    // Try to retrieve cached data.
    let value = await redis.get(key);

    // If the value is not cached.
    if (value === null) {

        console.log(`
CACHE MISS

The data is not in Redis.

Generating expensive data...
`);

        // Simulate an expensive operation.
        await delay(2000);

        // Generate data.
        value = JSON.stringify({
            id: 1,
            name: "Fernando",
            role: "Developer",
            source: "Generated Data"
        });

        // Store generated data.
        await redis.set(
            key,
            value,
            {
                EX: 60
            }
        );

        console.log(`
Data generated and stored in Redis.

CACHE SET
Expiration: 60 seconds
`);

    } else {

        // Cache hit.
        console.log(`
CACHE HIT

Redis already contains the data.
`);
    }

    // Display final data.
    console.log(`
DATA:

${value}

========================================
`);
}

// ==========================================
// DELAY FUNCTION
// ==========================================

function delay(milliseconds) {

    // Return a Promise that resolves later.
    return new Promise((resolve) => {

        setTimeout(
            resolve,
            milliseconds
        );
    });
}

// ==========================================
// HELP
// ==========================================

function showHelp() {

    console.log(`
========================================
              REDIS COMMANDS
========================================

set <key> <value>
Store data permanently.

get <key>
Retrieve cached data.

delete <key>
Delete cached data.

exists <key>
Check whether a key exists.

ttl <key>
Show expiration time.

list
List cached keys.

clear
Delete all cached data.

demo
Demonstrate CACHE HIT and CACHE MISS.

stats
Display Redis server information.

help
Show this menu.

exit
Close the application.

========================================
`);

    askCommand();
}

// ==========================================
// COMMAND HANDLER
// ==========================================

async function handleCommand(input) {

    // Remove whitespace.
    input = input.trim();

    // Ignore empty commands.
    if (!input) {

        askCommand();

        return;
    }

    // Split the command.
    const parts = input.split(/\s+/);

    // Get the command.
    const command =
        parts[0].toLowerCase();

    // Get the key.
    const key = parts[1];

    // Get the value.
    const value = parts
        .slice(2)
        .join(" ");

    // ======================================
    // SET
    // ======================================

    if (command === "set") {

        await setCache(
            key,
            value
        );

        askCommand();

        return;
    }

    // ======================================
    // GET
    // ======================================

    if (command === "get") {

        await getCache(key);

        askCommand();

        return;
    }

    // ======================================
    // DELETE
    // ======================================

    if (command === "delete") {

        await deleteCache(key);

        askCommand();

        return;
    }

    // ======================================
    // EXISTS
    // ======================================

    if (command === "exists") {

        await checkCache(key);

        askCommand();

        return;
    }

    // ======================================
    // TTL
    // ======================================

    if (command === "ttl") {

        await showTTL(key);

        askCommand();

        return;
    }

    // ======================================
    // LIST
    // ======================================

    if (command === "list") {

        await listKeys();

        askCommand();

        return;
    }

    // ======================================
    // CLEAR
    // ======================================

    if (command === "clear") {

        await clearCache();

        askCommand();

        return;
    }

    // ======================================
    // DEMO
    // ======================================

    if (command === "demo") {

        await runCacheDemo();

        askCommand();

        return;
    }

    // ======================================
    // STATS
    // ======================================

    if (command === "stats") {

        await showStats();

        askCommand();

        return;
    }

    // ======================================
    // HELP
    // ======================================

    if (command === "help") {

        showHelp();

        return;
    }

    // ======================================
    // EXIT
    // ======================================

    if (command === "exit") {

        console.log(
            "\nClosing Redis connection..."
        );

        // Disconnect from Redis.
        await redis.quit();

        // Close terminal.
        rl.close();

        return;
    }

    // ======================================
    // UNKNOWN COMMAND
    // ======================================

    console.log(
        `Unknown command: ${command}`
    );

    console.log(
        "Type 'help' for available commands."
    );

    askCommand();
}

// ==========================================
// TERMINAL PROMPT
// ==========================================

function askCommand() {

    // Display terminal prompt.
    rl.question(
        "redis-cache> ",
        (input) => {

            // Handle command asynchronously.
            handleCommand(input)
                .catch((error) => {

                    console.log(
                        `Error: ${error.message}`
                    );

                    askCommand();
                });
        }
    );
}

// ==========================================
// CONNECT TO REDIS
// ==========================================

async function start() {

    try {

        // Connect to Redis.
        await redis.connect();

        // Display connection message.
        console.log(
            "Redis connected successfully."
        );

        // Start terminal.
        askCommand();

    } catch (error) {

        // Display connection failure.
        console.log(`
Could not connect to Redis.

Make sure Redis is running on:
127.0.0.1:6379

Error:
${error.message}
`);

        process.exit(1);
    }
}

// ==========================================
// START APPLICATION
// ==========================================

start();
