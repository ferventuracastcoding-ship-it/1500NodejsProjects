
"use strict";

const readline = require("readline");

// ==========================================
// NODE.JS HASH TABLE COMMAND CENTER
// ==========================================

class HashTable {

    constructor(size = 10) {
        this.size = size;
        this.buckets = Array.from(
            { length: size },
            () => []
        );

        this.count = 0;
        this.collisions = 0;
    }

    // Hash function: Convert string into an index
    hash(key) {

        let total = 0;

        for (let i = 0; i < key.length; i++) {
            total = (total * 31 + key.charCodeAt(i))
                % this.size;
        }

        return total;
    }

    // INSERT
    insert(key, value) {

        const index = this.hash(key);
        const bucket = this.buckets[index];

        // Update existing key
        const existing = bucket.find(
            item => item.key === key
        );

        if (existing) {
            existing.value = value;
            console.log(`Updated: ${key}`);
            return;
        }

        // Collision detection
        if (bucket.length > 0) {
            this.collisions++;
        }

        bucket.push({ key, value });
        this.count++;

        console.log(`Inserted: ${key} at index ${index}`);

        // Resize when load factor exceeds 0.75
        if (this.loadFactor() > 0.75) {
            this.resize();
        }
    }

    // SEARCH
    search(key) {

        const index = this.hash(key);

        const result = this.buckets[index].find(
            item => item.key === key
        );

        if (result) {
            console.log("FOUND:", result);
            return result.value;
        }

        console.log(`NOT FOUND: ${key}`);
        return null;
    }

    // DELETE
    delete(key) {

        const index = this.hash(key);
        const bucket = this.buckets[index];

        const position = bucket.findIndex(
            item => item.key === key
        );

        if (position === -1) {
            console.log(`Cannot delete: ${key}`);
            return false;
        }

        bucket.splice(position, 1);
        this.count--;

        console.log(`Deleted: ${key}`);
        return true;
    }

    // UPDATE
    update(key, value) {

        const index = this.hash(key);

        const item = this.buckets[index].find(
            item => item.key === key
        );

        if (!item) {
            console.log("Key does not exist.");
            return false;
        }

        item.value = value;
        console.log(`Updated: ${key}`);

        return true;
    }

    // LOAD FACTOR
    loadFactor() {
        return this.count / this.size;
    }

    // RESIZE
    resize() {

        const oldBuckets = this.buckets;

        this.size *= 2;

        this.buckets = Array.from(
            { length: this.size },
            () => []
        );

        for (const bucket of oldBuckets) {
            for (const item of bucket) {

                const index = this.hash(item.key);

                this.buckets[index].push(item);
            }
        }

        console.log(`Table resized to ${this.size} buckets.`);
    }

    // DISPLAY
    display() {

        console.log("\n========== HASH TABLE ==========");

        this.buckets.forEach((bucket, index) => {

            const entries = bucket.map(
                item => `${item.key}: ${item.value}`
            );

            console.log(
                `${index} => ${entries.join(" -> ") || "EMPTY"}`
            );
        });

        console.log("================================");
    }

    // STATISTICS
    stats() {

        console.log("\nHASH TABLE STATISTICS");

        console.log("Capacity:", this.size);
        console.log("Entries:", this.count);
        console.log("Collisions:", this.collisions);
        console.log(
            "Load Factor:",
            this.loadFactor().toFixed(2)
        );
    }
}

// ==========================================
// ROCKET MISSION DATA
// ==========================================

const rockets = new HashTable(10);

const missions = [
    ["Earth", "Launch Base"],
    ["Mars", "Colony Mission"],
    ["Jupiter", "Orbital Research"],
    ["Saturn", "Titan Expedition"],
    ["Uranus", "Ice Exploration"],
    ["Neptune", "Deep Space Mission"],
    ["Pluto", "Outer Solar System"],
    ["Titan", "Dragonfly Mission"],
    ["Europa", "Ocean Explorer"],
    ["Moon", "Lunar Gateway"]
];

missions.forEach(([key, value]) => {
    rockets.insert(key, value);
});

// ==========================================
// INTERACTIVE NODE.JS TERMINAL
// ==========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu() {

    console.log(`
====================================
      HASH TABLE COMMAND CENTER
====================================

1. Insert rocket
2. Search rocket
3. Delete rocket
4. Update rocket
5. Display hash table
6. Show statistics
7. Insert sample rockets
8. Exit

====================================
`);

    rl.question("Select an operation: ", answer => {

        switch (answer) {

            case "1":
                rl.question("Rocket name: ", key => {
                    rl.question("Mission: ", value => {
                        rockets.insert(key, value);
                        menu();
                    });
                });
                break;

            case "2":
                rl.question("Search key: ", key => {
                    rockets.search(key);
                    menu();
                });
                break;

            case "3":
                rl.question("Delete key: ", key => {
                    rockets.delete(key);
                    menu();
                });
                break;

            case "4":
                rl.question("Rocket name: ", key => {
                    rl.question("New mission: ", value => {
                        rockets.update(key, value);
                        menu();
                    });
                });
                break;

            case "5":
                rockets.display();
                menu();
                break;

            case "6":
                rockets.stats();
                menu();
                break;

            case "7":
                missions.forEach(([key, value]) => {
                    rockets.insert(key, value);
                });
                menu();
                break;

            case "8":
                console.log("Command center offline.");
                rl.close();
                break;

            default:
                console.log("Invalid selection.");
                menu();
        }
    });
}

// START APPLICATION
console.log("NODE.JS HASH TABLE INITIALIZED");
menu();
