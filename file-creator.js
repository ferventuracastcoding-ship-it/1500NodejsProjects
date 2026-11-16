// ==========================================
// NODE.JS TERMINAL FILE CREATOR
// ==========================================

// Import Node's built-in filesystem module.
const fs = require("fs");

// Import Node's built-in path module.
const path = require("path");

// Import Node's readline module.
const readline = require("readline");

// Create the terminal interface.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ------------------------------------------
// TERMINAL HEADER
// ------------------------------------------

console.log(`
==============================================
          NODE.JS FILE CREATOR
==============================================

Commands:

  create <file>       Create a new file
  write <file>        Write to a file
  append <file>       Add content to a file
  read <file>         Read a file
  list                List files
  mkdir <folder>      Create a folder
  rename <old> <new>  Rename a file
  delete <file>       Delete a file
  exists <file>       Check if a file exists
  info <file>         Show file information
  help                Show commands
  clear               Clear terminal
  exit                Exit program

Examples:

  create hello.txt
  write hello.txt
  read hello.txt
  list
  mkdir projects
  rename hello.txt welcome.txt
  delete welcome.txt

==============================================
`);

// ------------------------------------------
// CREATE FILE
// ------------------------------------------

function createFile(filename) {

    // Check whether a filename was provided.
    if (!filename) {
        console.log("Error: Please provide a filename.");
        return;
    }

    // Create the full path.
    const filePath = path.resolve(filename);

    // Check whether the file already exists.
    if (fs.existsSync(filePath)) {
        console.log(`File already exists: ${filename}`);
        return;
    }

    // Create an empty file.
    fs.writeFileSync(filePath, "");

    // Confirm creation.
    console.log(`Created: ${filename}`);
}

// ------------------------------------------
// WRITE FILE
// ------------------------------------------

function writeFile(filename) {

    // Check for filename.
    if (!filename) {
        console.log("Error: Please provide a filename.");
        return;
    }

    // Ask the user for content.
    rl.question("Enter content: ", (content) => {

        // Write content to the file.
        fs.writeFileSync(filename, content);

        // Confirm operation.
        console.log(`Written to: ${filename}`);

        // Return to terminal.
        askCommand();
    });
}

// ------------------------------------------
// APPEND FILE
// ------------------------------------------

function appendFile(filename) {

    // Check for filename.
    if (!filename) {
        console.log("Error: Please provide a filename.");
        return;
    }

    // Ask for additional content.
    rl.question("Enter content to append: ", (content) => {

        // Append content to the file.
        fs.appendFileSync(filename, content);

        // Confirm operation.
        console.log(`Content appended to: ${filename}`);

        // Return to terminal.
        askCommand();
    });
}

// ------------------------------------------
// READ FILE
// ------------------------------------------

function readFile(filename) {

    // Check for filename.
    if (!filename) {
        console.log("Error: Please provide a filename.");
        return;
    }

    // Check whether the file exists.
    if (!fs.existsSync(filename)) {
        console.log(`File not found: ${filename}`);
        return;
    }

    // Read the file.
    const content = fs.readFileSync(filename, "utf8");

    // Display the contents.
    console.log(`
========== ${filename} ==========

${content}

=================================
`);
}

// ------------------------------------------
// LIST FILES
// ------------------------------------------

function listFiles() {

    // Read the current directory.
    const files = fs.readdirSync(".");

    // Display header.
    console.log("\n========== DIRECTORY ==========");

    // Check whether the directory is empty.
    if (files.length === 0) {
        console.log("Directory is empty.");
    }

    // Display every item.
    files.forEach((file, index) => {

        // Get information about the item.
        const stats = fs.statSync(file);

        // Determine whether it is a folder.
        const type = stats.isDirectory()
            ? "[DIR]"
            : "[FILE]";

        // Display item.
        console.log(`${index + 1}. ${type} ${file}`);
    });

    // Display footer.
    console.log("===============================\n");
}

// ------------------------------------------
// CREATE DIRECTORY
// ------------------------------------------

function createDirectory(folder) {

    // Check for folder name.
    if (!folder) {
        console.log("Error: Please provide a folder name.");
        return;
    }

    // Check whether folder already exists.
    if (fs.existsSync(folder)) {
        console.log(`Folder already exists: ${folder}`);
        return;
    }

    // Create folder.
    fs.mkdirSync(folder);

    // Confirm creation.
    console.log(`Created folder: ${folder}`);
}

// ------------------------------------------
// RENAME FILE
// ------------------------------------------

function renameFile(oldName, newName) {

    // Check for both filenames.
    if (!oldName || !newName) {
        console.log("Usage: rename old.txt new.txt");
        return;
    }

    // Check whether original exists.
    if (!fs.existsSync(oldName)) {
        console.log(`File not found: ${oldName}`);
        return;
    }

    // Rename the file.
    fs.renameSync(oldName, newName);

    // Confirm operation.
    console.log(`Renamed ${oldName} → ${newName}`);
}

// ------------------------------------------
// DELETE FILE
// ------------------------------------------

function deleteFile(filename) {

    // Check for filename.
    if (!filename) {
        console.log("Error: Please provide a filename.");
        return;
    }

    // Check whether file exists.
    if (!fs.existsSync(filename)) {
        console.log(`File not found: ${filename}`);
        return;
    }

    // Delete the file.
    fs.unlinkSync(filename);

    // Confirm deletion.
    console.log(`Deleted: ${filename}`);
}

// ------------------------------------------
// CHECK FILE
// ------------------------------------------

function checkExists(filename) {

    // Check for filename.
    if (!filename) {
        console.log("Error: Please provide a filename.");
        return;
    }

    // Check whether path exists.
    const exists = fs.existsSync(filename);

    // Display result.
    if (exists) {
        console.log(`${filename} exists.`);
    } else {
        console.log(`${filename} does not exist.`);
    }
}

// ------------------------------------------
// FILE INFORMATION
// ------------------------------------------

function fileInfo(filename) {

    // Check for filename.
    if (!filename) {
        console.log("Error: Please provide a filename.");
        return;
    }

    // Check existence.
    if (!fs.existsSync(filename)) {
        console.log(`Not found: ${filename}`);
        return;
    }

    // Get file statistics.
    const stats = fs.statSync(filename);

    // Display information.
    console.log(`
========== FILE INFO ==========

Name:       ${path.basename(filename)}
Location:   ${path.resolve(filename)}
Size:       ${stats.size} bytes
Directory:  ${stats.isDirectory()}
File:       ${stats.isFile()}
Created:    ${stats.birthtime}
Modified:   ${stats.mtime}

===============================
`);
}

// ------------------------------------------
// COMMAND HANDLER
// ------------------------------------------

function handleCommand(input) {

    // Remove unnecessary whitespace.
    input = input.trim();

    // Ignore empty commands.
    if (!input) {
        askCommand();
        return;
    }

    // Split the command into parts.
    const parts = input.split(" ");

    // Get the command.
    const command = parts[0].toLowerCase();

    // Get the first argument.
    const argument1 = parts[1];

    // Get the second argument.
    const argument2 = parts[2];

    // --------------------------------------
    // CREATE
    // --------------------------------------

    if (command === "create") {
        createFile(argument1);
        askCommand();
        return;
    }

    // --------------------------------------
    // WRITE
    // --------------------------------------

    if (command === "write") {
        writeFile(argument1);
        return;
    }

    // --------------------------------------
    // APPEND
    // --------------------------------------

    if (command === "append") {
        appendFile(argument1);
        return;
    }

    // --------------------------------------
    // READ
    // --------------------------------------

    if (command === "read") {
        readFile(argument1);
        askCommand();
        return;
    }

    // --------------------------------------
    // LIST
    // --------------------------------------

    if (command === "list") {
        listFiles();
        askCommand();
        return;
    }

    // --------------------------------------
    // MKDIR
    // --------------------------------------

    if (command === "mkdir") {
        createDirectory(argument1);
        askCommand();
        return;
    }

    // --------------------------------------
    // RENAME
    // --------------------------------------

    if (command === "rename") {
        renameFile(argument1, argument2);
        askCommand();
        return;
    }

    // --------------------------------------
    // DELETE
    // --------------------------------------

    if (command === "delete") {
        deleteFile(argument1);
        askCommand();
        return;
    }

    // --------------------------------------
    // EXISTS
    // --------------------------------------

    if (command === "exists") {
        checkExists(argument1);
        askCommand();
        return;
    }

    // --------------------------------------
    // INFO
    // --------------------------------------

    if (command === "info") {
        fileInfo(argument1);
        askCommand();
        return;
    }

    // --------------------------------------
    // HELP
    // --------------------------------------

    if (command === "help") {

        console.log(`
Commands:

  create <file>       Create an empty file
  write <file>        Write content
  append <file>       Append content
  read <file>         Read file contents
  list                List files and folders
  mkdir <folder>      Create a folder
  rename <old> <new>  Rename a file
  delete <file>       Delete a file
  exists <file>       Check existence
  info <file>         Show file information
  clear               Clear terminal
  help                Show help
  exit                Exit
`);

        askCommand();
        return;
    }

    // --------------------------------------
    // CLEAR
    // --------------------------------------

    if (command === "clear") {

        // Clear terminal screen.
        console.clear();

        // Show title again.
        console.log("NODE.JS FILE CREATOR\n");

        askCommand();
        return;
    }

    // --------------------------------------
    // EXIT
    // --------------------------------------

    if (command === "exit") {

        // Display closing message.
        console.log("\nFile Creator closed.");

        // Close readline.
        rl.close();

        return;
    }

    // --------------------------------------
    // UNKNOWN COMMAND
    // --------------------------------------

    console.log(
        `Unknown command: ${command}`
    );

    console.log(
        "Type 'help' to see available commands."
    );

    // Ask for another command.
    askCommand();
}

// ------------------------------------------
// TERMINAL PROMPT
// ------------------------------------------

function askCommand() {

    // Display command prompt.
    rl.question("file-creator> ", handleCommand);
}

// ------------------------------------------
// START PROGRAM
// ------------------------------------------

askCommand();
