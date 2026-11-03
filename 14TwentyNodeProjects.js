
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Initialize project systems
const users = createUserDatabase();
const tasks = createTaskManager();
const email = createEmailService();
const urls = createURLShortener();
const logs = createLogManager();
const cart = createShoppingCart();
const inventory = createInventory();
const cache = createCache();
const scheduler = createJobScheduler();

async function runProject(number) {
    switch (Number(number)) {

        case 1:
            console.log(await weatherApp("Solar System"));
            break;

        case 2:
            console.log(databaseBackup({
                users: users.getAll(),
                tasks: tasks.list()
            }));
            break;

        case 3:
            users.add(1, "STAR", "kingpfkings@example.com");
            users.add(2, "SOLAR SYSTEM", "solarsystem@example.com");
            console.log(users.getAll());
            console.log("Total users:", users.count());
            break;

        case 4: {
            const account = createAccount("System", "MyPassword123!");
            console.log("Login:", loginAccount(account, "MyPassword123!"));
            break;
        }

        case 5:
            console.log(fileManager("write", "example.txt", "Hello Node.js"));
            console.log(fileManager("read", "example.txt"));
            break;

        case 6:
            startRestAPI(3000);
            break;

        case 7: {
            const task = tasks.add("Build a Node.js application");
            tasks.complete(task.id);
            console.log(tasks.list());
            break;
        }

        case 8:
            console.log(await webScraper("https://example.com"));
            break;

        case 9:
            console.log(email.send(
                "user@example.com",
                "Node.js Project",
                "Hello from the email queue!"
            ));
            break;

        case 10:
            const shortened = urls.shorten("https://example.com");
            console.log(shortened);
            console.log(urls.resolve(shortened.shortCode));
            break;

        case 11:
            startChatServer(4000);
            break;

        case 12:
            logs.info("Application started");
            logs.warning("Example warning");
            console.log(logs.read());
            break;

        case 13:
            console.log(generatePassword(20));
            break;

        case 14:
            cart.add("Laptop", 1200, 1);
            cart.add("Mouse", 30, 2);
            console.log(cart.checkout());
            break;

        case 15:
            inventory.add(1, "Starligner01 Engine", 50, 500000);
            inventory.sell(1, 2);
            console.log(inventory.list());
            console.log("Inventory value:", inventory.stockValue());
            break;

        case 16:
            console.log(dataAnalytics([
                10, 20, 30, 40, 50, 60, 70, 80
            ]));
            break;

        case 17:
            cache.set("mission", "Mars Expedition");
            console.log(cache.get("mission"));
            break;

        case 18:
            console.log(serverMonitor());
            break;

        case 19:
            console.log(imageManager("list"));
            break;

        case 20:
            scheduler.schedule("Demo Job", () => {
                console.log("Background job:", new Date().toISOString());
            }, 5000);
            console.log(scheduler.list());
            break;

        default:
            console.log("Invalid project number");
    }
}

function showMenu() {
    console.log("\n==================================");
    console.log("    NODE.JS PROJECT COMMAND CENTER");
    console.log("==================================");

    for (let i = 1; i <= 20; i++) {
        console.log(`${i}. ${[
            "Weather App",
            "Database Backup",
            "User Database",
            "Authentication",
            "File Manager",
            "REST API",
            "Task Manager",
            "Web Scraper",
            "Email Service",
            "URL Shortener",
            "Chat Server",
            "Log Manager",
            "Password Generator",
            "Shopping Cart",
            "Inventory System",
            "Data Analytics",
            "Cache System",
            "Server Monitor",
            "Image Manager",
            "Job Scheduler"
        ][i - 1]}`);
    }

    console.log("0. Exit");
    console.log("==================================");

    rl.question("Select a project (0-20): ", async answer => {
        if (answer === "0") {
            scheduler.stopAll();
            console.log("Command Center closed.");
            rl.close();
            return;
        }

        try {
            await runProject(answer);
        } catch (error) {
            console.error("Project error:", error.message);
        }

        showMenu();
    });
}

// Start the application
showMenu();
