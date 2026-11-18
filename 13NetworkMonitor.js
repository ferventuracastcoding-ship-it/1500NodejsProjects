const express = require("express");
const net = require("net");

const app = express();
const PORT = 3000;

app.use(express.json());

const targets = [
    {
        id: 1,
        name: "Google DNS",
        host: "8.8.8.8",
        port: 53
    },
    {
        id: 2,
        name: "Cloudflare DNS",
        host: "1.1.1.1",
        port: 53
    },
    {
        id: 3,
        name: "Localhost",
        host: "127.0.0.1",
        port: 3000
    }
];

const results = new Map();


// --------------------------------------------------
// TCP connectivity test
// --------------------------------------------------

function checkHost(target, timeout = 3000) {

    return new Promise((resolve) => {

        const socket = new net.Socket();

        const start = Date.now();

        let finished = false;

        function finish(result) {

            if (finished) return;

            finished = true;

            socket.destroy();

            resolve(result);
        }

        socket.setTimeout(timeout);

        socket.connect(
            target.port,
            target.host,
            () => {

                const responseTime =
                    Date.now() - start;

                finish({
                    online: true,
                    responseTime,
                    checkedAt:
                        new Date().toISOString()
                });
            }
        );

        socket.on("timeout", () => {

            finish({
                online: false,
                error: "Connection timeout",
                checkedAt:
                    new Date().toISOString()
            });
        });

        socket.on("error", (error) => {

            finish({
                online: false,
                error: error.message,
                checkedAt:
                    new Date().toISOString()
            });
        });
    });
}


// --------------------------------------------------
// Check all targets
// --------------------------------------------------

async function monitorNetwork() {

    for (const target of targets) {

        const result =
            await checkHost(target);

        results.set(
            target.id,
            {
                ...target,
                ...result
            }
        );
    }
}


// --------------------------------------------------
// Dashboard
// --------------------------------------------------

app.get("/api/network", (req, res) => {

    res.json(
        Array.from(results.values())
    );
});


// --------------------------------------------------
// Check one target
// --------------------------------------------------

app.get("/api/network/:id", (req, res) => {

    const result =
        results.get(
            Number(req.params.id)
        );

    if (!result) {

        return res.status(404).json({
            error: "Target not found"
        });
    }

    res.json(result);
});


// --------------------------------------------------
// Add monitoring target
// --------------------------------------------------

app.post("/api/network", (req, res) => {

    const {
        name,
        host,
        port
    } = req.body;

    if (!name || !host || !port) {

        return res.status(400).json({
            error:
                "name, host and port are required"
        });
    }

    const target = {

        id:
            targets.length === 0
                ? 1
                : Math.max(
                    ...targets.map(t => t.id)
                ) + 1,

        name,
        host,
        port: Number(port)
    };

    targets.push(target);

    res.status(201).json(target);
});


// --------------------------------------------------
// Remove target
// --------------------------------------------------

app.delete("/api/network/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const index =
        targets.findIndex(
            target => target.id === id
        );

    if (index === -1) {

        return res.status(404).json({
            error: "Target not found"
        });
    }

    targets.splice(index, 1);

    results.delete(id);

    res.json({
        message: "Target removed"
    });
});


// --------------------------------------------------
// Network statistics
// --------------------------------------------------

app.get("/api/statistics", (req, res) => {

    const data =
        Array.from(results.values());

    const online =
        data.filter(
            item => item.online
        ).length;

    const offline =
        data.filter(
            item => !item.online
        ).length;

    const responseTimes =
        data
            .filter(
                item =>
                    item.online &&
                    typeof item.responseTime === "number"
            )
            .map(
                item => item.responseTime
            );

    const averageLatency =
        responseTimes.length
            ? responseTimes.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / responseTimes.length
            : 0;

    res.json({

        totalTargets: data.length,

        online,

        offline,

        averageLatency:
            `${averageLatency.toFixed(2)} ms`

    });
});


// --------------------------------------------------
// Run monitoring every 10 seconds
// --------------------------------------------------

async function startMonitoring() {

    await monitorNetwork();

    console.log(
        "Network scan completed:",
        new Date().toLocaleTimeString()
    );
}

startMonitoring();

setInterval(
    startMonitoring,
    10000
);


// --------------------------------------------------
// Server
// --------------------------------------------------

app.listen(PORT, () => {

    console.log(
        `🌐 Network Monitor running at http://localhost:${PORT}`
    );
});
