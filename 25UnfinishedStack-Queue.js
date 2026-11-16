// Stack & Queue
"use strict";

// ============================================
// STACK AND QUEUE SIMULATOR
// NODE.JS DATA STRUCTURES COMMAND CENTER
// ============================================

// ============================================
// STACK CLASS - LAST IN, FIRST OUT
// ============================================

class Stack {

    constructor() {
        this.items = [];
    }

    // PUSH
    push(value) {
        this.items.push(value);
        console.log(`PUSHED: ${value}`);
    }

    // POP
    pop() {

        if (this.isEmpty()) {
            console.log("Stack is empty!");
            return null;
        }

        const removed = this.items.pop();

        console.log(`POPPED: ${removed}`);

        return removed;
    }

    // PEEK
    peek() {

        if (this.isEmpty()) {
            console.log("Stack is empty!");
            return null;
        }

        console.log("TOP:", this.items[this.items.length - 1]);

        return this.items[this.items.length - 1];
    }

    // SEARCH
    search(value) {

        const index = this.items.lastIndexOf(value);

        if (index === -1) {
            console.log(`${value} not found.`);
            return -1;
        }

        console.log(`${value} found at index ${index}.`);

        return index;
    }

    // REVERSE
    reverse() {
        this.items.reverse();
        console.log("Stack reversed!");
    }

    // CHECK EMPTY
    isEmpty() {
        return this.items.length === 0;
    }

    // SIZE
    size() {
        return this.items.length;
    }

    // DISPLAY
    display() {

        console.log("\n========== STACK ==========");

        if (this.isEmpty()) {
            console.log("EMPTY STACK");
            return;
        }

        for (let i = this.items.length - 1; i >= 0; i--) {

            const label = i === this.items.length - 1
                ? " <- TOP"
                : "";

            console.log(`| ${this.items[i]} ${label}`);
        }

        console.log("========== BASE ==========");
        console.log("SIZE:", this.size());
    }

    // CLEAR
    clear() {
        this.items = [];
        console.log("Stack cleared.");
    }
}

// ============================================
// QUEUE CLASS - FIRST IN, FIRST OUT
// ============================================

class Queue {

    constructor() {
        this.items = [];
    }

    // ENQUEUE
    enqueue(value) {
        this.items.push(value);
        console.log(`ENQUEUED: ${value}`);
    }

    // DEQUEUE
    dequeue() {

        if (this.isEmpty()) {
            console.log("Queue is empty!");
            return null;
        }

        const removed = this.items.shift();

        console.log(`DEQUEUED: ${removed}`);

        return removed;
    }

    // FRONT
    front() {

        if (this.isEmpty()) {
            console.log("Queue is empty!");
            return null;
        }

        console.log("FRONT:", this.items[0]);

        return this.items[0];
    }

    // REAR
    rear() {

        if (this.isEmpty()) {
            console.log("Queue is empty!");
            return null;
        }

        const last = this.items[this.items.length - 1];

        console.log("REAR:", last);

        return last;
    }

    // SEARCH
    search(value) {

        const index = this.items.indexOf(value);

        if (index === -1) {
            console.log(`${value} not found.`);
            return -1;
        }

        console.log(`${value} found at index ${index}.`);

        return index;
    }

    // CHECK EMPTY
    isEmpty() {
        return this.items.length === 0;
    }

    // SIZE
    size() {
        return this.items.length;
    }

    // DISPLAY
    display() {

        console.log("\n========== QUEUE ==========");

        if (this.isEmpty()) {
            console.log("EMPTY QUEUE");
            return;
        }

        console.log(
            "FRONT ->",
            this.items.join(" -> "),
            "-> REAR"
        );

        console.log("SIZE:", this.size());
    }

    // CLEAR
    clear() {
        this.items = [];
        console.log("Queue cleared.");
    }
}

// ============================================
// INITIALIZE DATA STRUCTURES
// ============================================

const stack = new Stack();
const queue = new Queue();

// SAMPLE MISSION DATA
const missions = [
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Titan"
];

// ============================================
// TERMINAL INTERFACE
// ============================================

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ============================================
// STACK MENU
// ============================================

function stackMenu() {

    console.log(`
================================
          STACK MENU
================================

1. Push
2. Pop
3. Peek
4. Search
5. Reverse
6. Display
7. Clear
8. Show Size
9. Return to Main Menu

================================
`);

    rl.question("Select operation: ", answer => {

        switch (answer) {

            case "1":
                rl.question("Enter value: ", value => {
                    stack.push(value);
                    stackMenu();
                });
                break;

            case "2":
                stack.pop();
                stackMenu();
                break;

            case "3":
                stack.peek();
                stackMenu();
                break;

            case "4":
                rl.question("Search value: ", value => {
                    stack.search(value);
                    stackMenu();
                });
                break;

            case "5":
                stack.reverse();
                stackMenu();
                break;

            case "6":
                stack.display();
                stackMenu();
                break;

            case "7":
                stack.clear();
                stackMenu();
                break;

            case "8":
                console.log("Stack Size:", stack.size());
                stackMenu();
                break;

            case "9":
                mainMenu();
                break;

            default:
                console.log("Invalid option.");
                stackMenu();
        }
    });
}

// ============================================
// QUEUE MENU
// ============================================

function queueMenu() {

    console.log(`
================================
          QUEUE MENU
================================

1. Enqueue
2. Dequeue
3. Front
4. Rear
5. Search
6. Display
7. Clear
8. Show Size
9. Return to Main Menu

================================
`);

    rl.question("Select operation: ", answer => {

        switch (answer) {

            case "1":
                rl.question("Enter value: ", value => {
                    queue.enqueue(value);
                    queueMenu();
                });
                break;

            case "2":
                queue.dequeue();
                queueMenu();
                break;

            case "3":
                queue.front();
                queueMenu();
                break;

            case "4":
                queue.rear();
                queueMenu();
                break;

            case "5":
                rl.question("Search value: ", value => {
                    queue.search(value);
                    queueMenu();
                });
                break;

            case "6":
                queue.display();
                queueMenu();
                break;

            case "7":
                queue.clear();
                queueMenu();
                break;

            case "8":
                console.log("Queue Size:", queue.size());
                queueMenu();
                break;

            case "9":
                mainMenu();
                break;

            default:
                console.log("Invalid option.");
                queueMenu();
        }
    });
}

// ============================================
// MAIN MENU
// ============================================

function mainMenu() {

    console.log(`
========================================
       STACK & QUEUE COMMAND CENTER
========================================

1. Stack Operations
2. Queue Operations
3. Load Sample Mission Data
4. Display Both Structures
5. Exit

========================================
`);

    rl.question("Select operation: ", answer => {

        switch (answer) {

            case "1":
                stackMenu();
                break;

            case "2":
                queueMenu();
                break;

            case "3":

                missions.forEach(mission => {
                    stack.push(mission);
                    queue.enqueue(mission);
                });

                mainMenu();
                break;

            case "4":
                stack.display();
                queue.display();
                mainMenu();
                break;

            case "5":
                console.log("Command Center Offline.");
                rl.close();
                break;

            default:
                console.log("Invalid selection.");
                mainMenu();
        }
    });
}

// ============================================
// START APPLICATION
// ============================================

console.log("STACK & QUEUE SIMULATOR INITIALIZED");

mainMenu();
