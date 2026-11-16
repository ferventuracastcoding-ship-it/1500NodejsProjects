mkdir bst-api
cd bst-api
npm init -y
npm install express


// ============================================
// BINARY SEARCH TREE API
// Node.js + Express
// ============================================

const express = require("express");

const app = express();
const PORT = 3000;

// Parse incoming JSON.
app.use(express.json());

// ============================================
// BINARY SEARCH TREE NODE
// ============================================

class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

// ============================================
// BINARY SEARCH TREE
// ============================================

class BinarySearchTree {

    constructor() {
        this.root = null;
    }

    // INSERT A NODE
    insert(value) {

        const newNode = new TreeNode(value);

        if (this.root === null) {
            this.root = newNode;
            return newNode;
        }

        let current = this.root;

        while (true) {

            if (value === current.value) {
                return null; // Ignore duplicates.
            }

            if (value < current.value) {

                if (current.left === null) {
                    current.left = newNode;
                    return newNode;
                }

                current = current.left;

            } else {

                if (current.right === null) {
                    current.right = newNode;
                    return newNode;
                }

                current = current.right;
            }
        }
    }

    // SEARCH FOR A NODE
    search(value) {

        let current = this.root;

        while (current !== null) {

            if (value === current.value) {
                return current;
            }

            if (value < current.value) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }

    // DELETE A NODE
    delete(value) {
        this.root = this.deleteNode(this.root, value);
    }

    deleteNode(node, value) {

        if (node === null) {
            return null;
        }

        if (value < node.value) {

            node.left =
                this.deleteNode(node.left, value);

        } else if (value > node.value) {

            node.right =
                this.deleteNode(node.right, value);

        } else {

            // CASE 1: No children.
            if (!node.left && !node.right) {
                return null;
            }

            // CASE 2: One child.
            if (!node.left) {
                return node.right;
            }

            if (!node.right) {
                return node.left;
            }

            // CASE 3: Two children.
            const successor =
                this.findMinimum(node.right);

            node.value = successor.value;

            node.right =
                this.deleteNode(
                    node.right,
                    successor.value
                );
        }

        return node;
    }

    // FIND MINIMUM VALUE
    findMinimum(node = this.root) {

        if (node === null) return null;

        while (node.left !== null) {
            node = node.left;
        }

        return node;
    }

    // FIND MAXIMUM VALUE
    findMaximum(node = this.root) {

        if (node === null) return null;

        while (node.right !== null) {
            node = node.right;
        }

        return node;
    }

    // INORDER: LEFT, ROOT, RIGHT
    inorder(node = this.root, result = []) {

        if (node !== null) {

            this.inorder(node.left, result);

            result.push(node.value);

            this.inorder(node.right, result);
        }

        return result;
    }

    // PREORDER: ROOT, LEFT, RIGHT
    preorder(node = this.root, result = []) {

        if (node !== null) {

            result.push(node.value);

            this.preorder(node.left, result);
            this.preorder(node.right, result);
        }

        return result;
    }

    // POSTORDER: LEFT, RIGHT, ROOT
    postorder(node = this.root, result = []) {

        if (node !== null) {

            this.postorder(node.left, result);
            this.postorder(node.right, result);

            result.push(node.value);
        }

        return result;
    }

    // CONVERT TREE INTO JSON
    toJSON(node = this.root) {

        if (node === null) {
            return null;
        }

        return {
            value: node.value,
            left: this.toJSON(node.left),
            right: this.toJSON(node.right)
        };
    }
}

// ============================================
// CREATE TREE
// ============================================

const bst = new BinarySearchTree();

// Insert starter values.
[50, 30, 70, 20, 40, 60, 80].forEach(
    value => bst.insert(value)
);

// ============================================
// API ROUTES
// ============================================

// HOME
app.get("/", (req, res) => {

    res.json({
        message: "Binary Search Tree API",
        endpoints: [
            "POST /insert",
            "GET /search/:value",
            "DELETE /delete/:value",
            "GET /tree",
            "GET /inorder",
            "GET /preorder",
            "GET /postorder",
            "GET /minimum",
            "GET /maximum"
        ]
    });
});

// INSERT NODE
app.post("/insert", (req, res) => {

    const value = Number(req.body.value);

    if (!Number.isFinite(value)) {
        return res.status(400).json({
            error: "Provide a valid numeric value."
        });
    }

    const result = bst.insert(value);

    if (!result) {
        return res.status(409).json({
            message: "Value already exists.",
            value
        });
    }

    res.status(201).json({
        message: "Node inserted successfully.",
        inserted: value,
        tree: bst.toJSON()
    });
});

// SEARCH NODE
app.get("/search/:value", (req, res) => {

    const value = Number(req.params.value);

    if (!Number.isFinite(value)) {
        return res.status(400).json({
            error: "Invalid search value."
        });
    }

    const result = bst.search(value);

    if (!result) {
        return res.status(404).json({
            found: false,
            message: "Node not found.",
            value
        });
    }

    res.json({
        found: true,
        message: "Node found!",
        node: result
    });
});

// DELETE NODE
app.delete("/delete/:value", (req, res) => {

    const value = Number(req.params.value);

    if (!Number.isFinite(value)) {
        return res.status(400).json({
            error: "Invalid delete value."
        });
    }

    const exists = bst.search(value);

    if (!exists) {
        return res.status(404).json({
            message: "Node does not exist."
        });
    }

    bst.delete(value);

    res.json({
        message: "Node deleted successfully.",
        deleted: value,
        tree: bst.toJSON()
    });
});

// DISPLAY TREE
app.get("/tree", (req, res) => {

    res.json({
        root: bst.toJSON()
    });
});

// INORDER TRAVERSAL
app.get("/inorder", (req, res) => {

    res.json({
        traversal: "Inorder",
        values: bst.inorder()
    });
});

// PREORDER TRAVERSAL
app.get("/preorder", (req, res) => {

    res.json({
        traversal: "Preorder",
        values: bst.preorder()
    });
});

// POSTORDER TRAVERSAL
app.get("/postorder", (req, res) => {

    res.json({
        traversal: "Postorder",
        values: bst.postorder()
    });
});

// MINIMUM
app.get("/minimum", (req, res) => {

    const node = bst.findMinimum();

    res.json({
        minimum: node ? node.value : null
    });
});

// MAXIMUM
app.get("/maximum", (req, res) => {

    const node = bst.findMaximum();

    res.json({
        maximum: node ? node.value : null
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {

    console.log(`
========================================
       BINARY SEARCH TREE API
========================================

Server: http://localhost:${PORT}

Root: 50

Starter Nodes:
50, 30, 70, 20, 40, 60, 80

========================================
`);
});
