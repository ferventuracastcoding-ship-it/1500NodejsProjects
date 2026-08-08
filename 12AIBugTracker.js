const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// --------------------------------------------------
// In-memory database
// --------------------------------------------------

let bugs = [];
let nextId = 1;


// --------------------------------------------------
// AI Bug Analyzer
// --------------------------------------------------

function analyzeBug(title, description) {

    const text = `${title} ${description}`.toLowerCase();

    let severity = "low";
    let priority = "low";
    let category = "general";
    let confidence = 0.70;

    // Severity detection
    if (
        text.includes("crash") ||
        text.includes("data loss") ||
        text.includes("security") ||
        text.includes("cannot login")
    ) {
        severity = "critical";
        priority = "urgent";
        confidence = 0.96;
    }

    else if (
        text.includes("broken") ||
        text.includes("error") ||
        text.includes("payment") ||
        text.includes("database")
    ) {
        severity = "high";
        priority = "high";
        confidence = 0.89;
    }

    else if (
        text.includes("slow") ||
        text.includes("incorrect") ||
        text.includes("display")
    ) {
        severity = "medium";
        priority = "medium";
        confidence = 0.84;
    }

    // Category detection
    if (
        text.includes("login") ||
        text.includes("password") ||
        text.includes("authentication")
    ) {
        category = "authentication";
    }

    else if (
        text.includes("database") ||
        text.includes("sql") ||
        text.includes("mongodb")
    ) {
        category = "database";
    }

    else if (
        text.includes("api") ||
        text.includes("endpoint") ||
        text.includes("request")
    ) {
        category = "api";
    }

    else if (
        text.includes("css") ||
        text.includes("button") ||
        text.includes("layout") ||
        text.includes("display")
    ) {
        category = "frontend";
    }

    else if (
        text.includes("payment") ||
        text.includes("checkout")
    ) {
        category = "payments";
    }

    return {
        severity,
        priority,
        category,
        confidence
    };
}


// --------------------------------------------------
// Duplicate Detection
// --------------------------------------------------

function findDuplicates(title, description) {

    const newText =
        `${title} ${description}`.toLowerCase();

    return bugs.filter(bug => {

        const oldText =
            `${bug.title} ${bug.description}`
            .toLowerCase();

        const words =
            newText
                .split(/\s+/)
                .filter(word => word.length > 4);

        let matches = 0;

        for (const word of words) {

            if (oldText.includes(word)) {
                matches++;
            }
        }

        return matches >= 2;
    });
}


// --------------------------------------------------
// Create Bug
// --------------------------------------------------

app.post("/api/bugs", (req, res) => {

    const {
        title,
        description,
        reporter = "anonymous"
    } = req.body;

    if (!title || !description) {

        return res.status(400).json({
            error: "Title and description are required"
        });
    }

    const analysis =
        analyzeBug(title, description);

    const duplicates =
        findDuplicates(title, description);

    const bug = {

        id: nextId++,

        title,

        description,

        reporter,

        status: "open",

        assignedTo: null,

        createdAt:
            new Date().toISOString(),

        ai: {

            ...analysis,

            duplicateCount:
                duplicates.length,

            recommendation:
                analysis.severity === "critical"
                    ? "Escalate immediately"
                    : "Add to engineering queue"
        }
    };

    bugs.push(bug);

    res.status(201).json(bug);
});


// --------------------------------------------------
// Get All Bugs
// --------------------------------------------------

app.get("/api/bugs", (req, res) => {

    let result = [...bugs];

    if (req.query.status) {

        result = result.filter(
            bug =>
                bug.status === req.query.status
        );
    }

    if (req.query.severity) {

        result = result.filter(
            bug =>
                bug.ai.severity ===
                req.query.severity
        );
    }

    if (req.query.category) {

        result = result.filter(
            bug =>
                bug.ai.category ===
                req.query.category
        );
    }

    res.json({
        count: result.length,
        bugs: result
    });
});


// --------------------------------------------------
// Get One Bug
// --------------------------------------------------

app.get("/api/bugs/:id", (req, res) => {

    const bug =
        bugs.find(
            bug =>
                bug.id ===
                Number(req.params.id)
        );

    if (!bug) {

        return res.status(404).json({
            error: "Bug not found"
        });
    }

    res.json(bug);
});


// --------------------------------------------------
// Update Bug Status
// --------------------------------------------------

app.patch("/api/bugs/:id", (req, res) => {

    const bug =
        bugs.find(
            bug =>
                bug.id ===
                Number(req.params.id)
        );

    if (!bug) {

        return res.status(404).json({
            error: "Bug not found"
        });
    }

    const {
        status,
        assignedTo
    } = req.body;

    if (status) {
        bug.status = status;
    }

    if (assignedTo !== undefined) {
        bug.assignedTo = assignedTo;
    }

    res.json(bug);
});


// --------------------------------------------------
// AI Re-analyze Bug
// --------------------------------------------------

app.post("/api/bugs/:id/analyze", (req, res) => {

    const bug =
        bugs.find(
            bug =>
                bug.id ===
                Number(req.params.id)
        );

    if (!bug) {

        return res.status(404).json({
            error: "Bug not found"
        });
    }

    bug.ai = {
        ...bug.ai,
        ...analyzeBug(
            bug.title,
            bug.description
        ),
        analyzedAt:
            new Date().toISOString()
    };

    res.json({
        message: "Bug re-analyzed",
        bug
    });
});


// --------------------------------------------------
// Duplicate Finder
// --------------------------------------------------

app.get("/api/bugs/:id/duplicates", (req, res) => {

    const bug =
        bugs.find(
            bug =>
                bug.id ===
                Number(req.params.id)
        );

    if (!bug) {

        return res.status(404).json({
            error: "Bug not found"
        });
    }

    const duplicates =
        findDuplicates(
            bug.title,
            bug.description
        )
        .filter(item =>
            item.id !== bug.id
        );

    res.json({
        bugId: bug.id,
        duplicates
    });
});


// --------------------------------------------------
// Dashboard Statistics
// --------------------------------------------------

app.get("/api/dashboard", (req, res) => {

    const total = bugs.length;

    const open =
        bugs.filter(
            bug => bug.status === "open"
        ).length;

    const closed =
        bugs.filter(
            bug => bug.status === "closed"
        ).length;

    const critical =
        bugs.filter(
            bug =>
                bug.ai.severity === "critical"
        ).length;

    const high =
        bugs.filter(
            bug =>
                bug.ai.severity === "high"
        ).length;

    const categories = {};

    bugs.forEach(bug => {

        const category =
            bug.ai.category;

        categories[category] =
            (categories[category] || 0) + 1;
    });

    res.json({

        total,

        open,

        closed,

        critical,

        high,

        categories

    });
});


// --------------------------------------------------
// Search Bugs
// --------------------------------------------------

app.get("/api/search", (req, res) => {

    const query =
        String(req.query.q || "")
            .toLowerCase();

    if (!query) {

        return res.json([]);
    }

    const results =
        bugs.filter(bug => {

            const text =
                `${bug.title}
                 ${bug.description}
                 ${bug.ai.category}`
                .toLowerCase();

            return text.includes(query);
        });

    res.json(results);
});


// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/", (req, res) => {

    res.json({

        application:
            "AI Bug Tracker",

        status:
            "online",

        endpoints: {

            bugs:
                "/api/bugs",

            dashboard:
                "/api/dashboard",

            search:
                "/api/search?q=login"

        }
    });
});


// --------------------------------------------------
// Start Server
// --------------------------------------------------

app.listen(PORT, () => {

    console.log(
        `🤖 AI Bug Tracker running at http://localhost:${PORT}`
    );
});
