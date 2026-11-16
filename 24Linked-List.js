
"use strict";

const readline = require("readline");

// ========================================
// NODE CLASS
// ========================================

class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// ========================================
// LINKED LIST CLASS
// ========================================

class LinkedList {

    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    // INSERT AT BEGINNING
    insertFirst(data) {

        const newNode = new Node(data);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head = newNode;
        }

        this.length++;

        console.log(`Inserted ${data} at beginning.`);
    }

    // INSERT AT END
    insertLast(data) {

        const newNode = new Node(data);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }

        this.length++;

        console.log(`Inserted ${data} at end.`);
    }

    // INSERT AT POSITION
    insertAt(position, data) {

        if (position < 0 || position > this.length) {
            console.log("Invalid position.");
            return false;
        }

        if (position === 0) {
            this.insertFirst(data);
            return true;
        }

        if (position === this.length) {
            this.insertLast(data);
            return true;
        }

        const newNode = new Node(data);
        let current = this.head;

        for (let i = 0; i < position - 1; i++) {
            current = current.next;
        }

        newNode.next = current.next;
        current.next = newNode;

        this.length++;

        console.log(`Inserted ${data} at position ${position}.`);

        return true;
    }

    // DELETE FIRST NODE
    deleteFirst() {

        if (!this.head) {
            console.log("List is empty.");
            return null;
        }

        const deleted = this.head.data;

        this.head = this.head.next;
        this.length--;

        if (!this.head) {
            this.tail = null;
        }

        console.log(`Deleted ${deleted}.`);

        return deleted;
    }

    // DELETE LAST NODE
    deleteLast() {

        if (!this.head) {
            console.log("List is empty.");
            return null;
        }

        if (this.head === this.tail) {
            return this.deleteFirst();
        }

        let current = this.head;

        while (current.next !== this.tail) {
            current = current.next;
        }

        const deleted = this.tail.data;

        current.next = null;
        this.tail = current;
        this.length--;

        console.log(`Deleted ${deleted}.`);

        return deleted;
    }

    // DELETE BY VALUE
    deleteValue(data) {

        if (!this.head) return false;

        if (this.head.data === data) {
            this.deleteFirst();
            return true;
        }

        let current = this.head;

        while (current.next) {

            if (current.next.data === data) {

                const deleted = current.next;

                current.next = deleted.next;

                if (deleted === this.tail) {
                    this.tail = current;
                }

                this.length--;

                console.log(`Deleted ${data}.`);

                return true;
            }

            current = current.next;
        }

        console.log(`${data} not found.`);
        return false;
    }

    // SEARCH
    search(data) {

        let current = this.head;
        let index = 0;

        while (current) {

            if (current.data === data) {
                console.log(`Found ${data} at index ${index}.`);
                return index;
            }

            current = current.next;
            index++;
        }

        console.log(`${data} not found.`);
        return -1;
    }

    // TRAVERSE
    traverse() {

        if (!this.head) {
            console.log("Linked list is empty.");
            return;
        }

        let current = this.head;
        const values = [];

        while (current) {
            values.push(current.data);
            current = current.next;
        }

        console.log("\nHEAD");

        console.log(values.join(" -> ") + " -> NULL");

        console.log("TAIL:", this.tail.data);
        console.log("LENGTH:", this.length);
    }

    // REVERSE LINKED LIST
    reverse() {

        let previous = null;
        let current = this.head;

        this.tail = this.head;

        while (current) {

            const nextNode = current.next;

            current.next = previous;

            previous = current;
            current = nextNode;
        }

        this.head = previous;

        console.log("Linked list reversed!");

    }

    // COUNT
    count() {
        console.log("Total nodes:", this.length);
        return this.length;
    }

    // FIND DUPLICATES
    findDuplicates() {

        const seen = new Set();
        const duplicates = new Set();

        let current = this.head;

        while (current) {

            if (seen.has(current.data)) {
                duplicates.add(current.data);
            }

            seen.add(current.data);
            current = current.next;
        }

        console.log(
            "Duplicates:",
            [...duplicates]
        );

        return [...duplicates];
    }

    // CLEAR LIST
    clear() {

        this.head = null;
        this.tail = null;
        this.length = 0;

        console.log("Linked list cleared.");
    }
}

// ========================================
// INITIALIZE LINKED LIST
// ========================================

const list = new LinkedList();

["Earth", "Mars", "Jupiter", "Saturn", "Titan"]
    .forEach(planet => list.insertLast(planet));

// ========================================
// NODE.JS TERMINAL MENU
// ========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu() {

    console.log(`
========================================
       LINKED LIST COMMAND CENTER
========================================

1. Insert at beginning
2. Insert at end
3. Insert at position
4. Delete first node
5. Delete last node
6. Delete by value
7. Search
8. Traverse
9. Reverse linked list
10. Count nodes
11. Find duplicates
12. Clear linked list
13. Exit

========================================
`);

    rl.question("Select operation: ", answer => {

        switch (answer) {

            case "1":
                rl.question("Enter value: ", value => {
                    list.insertFirst(value);
                    menu();
                });
                break;

            case "2":
                rl.question("Enter value: ", value => {
                    list.insertLast(value);
                    menu();
                });
                break;

            case "3":
                rl.question("Enter position: ", position => {
                    rl.question("Enter value: ", value => {
                        list.insertAt(Number(position), value);
                        menu();
                    });
                });
                break;

            case "4":
                list.deleteFirst();
                menu();
                break;

            case "5":
                list.deleteLast();
                menu();
                break;

            case "6":
                rl.question("Enter value: ", value => {
                    list.deleteValue(value);
                    menu();
                });
                break;

            case "7":
                rl.question("Search value: ", value => {
                    list.search(value);
                    menu();
                });
                break;

            case "8":
                list.traverse();
                menu();
                break;

            case "9":
                list.reverse();
                list.traverse();
                menu();
                break;

            case "10":
                list.count();
                menu();
                break;

            case "11":
                list.findDuplicates();
                menu();
                break;

            case "12":
                list.clear();
                menu();
                break;

            case "13":
                console.log("Linked List Manager Offline.");
                rl.close();
                break;

            default:
                console.log("Invalid selection.");
                menu();
        }
    });
}

// START APPLICATION
console.log("NODE.JS LINKED LIST INITIALIZED");
list.traverse();
menu();
