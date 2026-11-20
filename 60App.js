"use strict";

/*
============================================================

        NODE.JS SENIOR ENGINEERING LAB

        SINGLE-FILE ENTERPRISE API

============================================================

This project demonstrates:

1. Node.js fundamentals
2. HTTP
3. REST APIs
4. Routing
5. CRUD
6. Authentication
7. Authorization
8. Password hashing
9. Cryptography
10. Sessions
11. Events
12. Streams
13. Worker Threads
14. Async/Await
15. Promises
16. Caching
17. Rate limiting
18. Validation
19. Pagination
20. Sorting
21. Filtering
22. Metrics
23. Audit logging
24. Background jobs
25. Graceful shutdown
26. Error handling
27. Repository pattern
28. Service layer
29. Dependency injection
30. Configuration
31. CLI commands
32. Health monitoring
33. Security fundamentals
34. Performance concepts

Run:

    node app.js

Server:

    http://localhost:3000

============================================================
*/


/*
============================================================
1. BUILT-IN NODE MODULES
============================================================
*/

const http = require("http");

const fs = require("fs");

const path = require("path");

const crypto = require("crypto");

const os = require("os");

const { EventEmitter } = require("events");

const {
    Worker,
    isMainThread,
    parentPort
} = require("worker_threads");

const { Readable } = require("stream");


/*
============================================================
2. CONFIGURATION
============================================================
*/

const CONFIG = {

    PORT:
        Number(process.env.PORT) || 3000,

    HOST:
        process.env.HOST || "localhost",

    DATA_FILE:
        path.join(
            __dirname,
            "enterprise-data.json"
        ),

    LOG_FILE:
        path.join(
            __dirname,
            "enterprise.log"
        ),

    TOKEN_SECRET:
        process.env.TOKEN_SECRET ||
        "CHANGE_THIS_SECRET_IN_PRODUCTION",

    TOKEN_EXPIRATION:
        60 * 60 * 1000,

    MAX_REQUESTS:
        100,

    RATE_WINDOW:
        60 * 1000,

    CACHE_TTL:
        30 * 1000
};


/*
============================================================
3. APPLICATION ERROR
============================================================
*/

class AppError extends Error {

    constructor(
        message,
        statusCode = 500,
        code = "INTERNAL_ERROR"
    ) {

        super(message);

        this.statusCode =
            statusCode;

        this.code =
            code;

        this.isOperational = true;
    }
}


/*
============================================================
4. EVENT BUS
============================================================
*/

class EventBus
    extends EventEmitter {

    publish(event, data) {

        this.emit(
            event,
            data
        );
    }
}

const eventBus =
    new EventBus();


/*
============================================================
5. LOGGER
============================================================
*/

class Logger {

    constructor(file) {

        this.file = file;
    }

    log(level, message, metadata = {}) {

        const entry = {

            timestamp:
                new Date().toISOString(),

            level,

            message,

            metadata
        };

        const line =
            JSON.stringify(entry) +
            "\n";

        process.stdout.write(line);

        fs.appendFile(
            this.file,
            line,
            error => {

                if (error) {

                    console.error(
                        "Logging failure:",
                        error.message
                    );
                }
            }
        );
    }

    info(message, metadata) {

        this.log(
            "INFO",
            message,
            metadata
        );
    }

    warn(message, metadata) {

        this.log(
            "WARN",
            message,
            metadata
        );
    }

    error(message, metadata) {

        this.log(
            "ERROR",
            message,
            metadata
        );
    }
}

const logger =
    new Logger(
        CONFIG.LOG_FILE
    );


/*
============================================================
6. APPLICATION METRICS
============================================================
*/

class Metrics {

    constructor() {

        this.requests = 0;

        this.errors = 0;

        this.totalResponseTime = 0;

        this.routes = new Map();
    }

    request(route, duration) {

        this.requests++;

        this.totalResponseTime +=
            duration;

        const current =
            this.routes.get(route) ||
            {
                requests: 0,
                totalTime: 0
            };

        current.requests++;

        current.totalTime +=
            duration;

        this.routes.set(
            route,
            current
        );
    }

    error() {

        this.errors++;
    }

    snapshot() {

        return {

            requests:
                this.requests,

            errors:
                this.errors,

            averageResponseTime:
                this.requests
                    ? (
                        this.totalResponseTime /
                        this.requests
                    ).toFixed(2)
                    : 0
        };
    }
}

const metrics =
    new Metrics();


/*
============================================================
7. JSON DATABASE
============================================================
*/

class JsonDatabase {

    constructor(file) {

        this.file = file;

        this.data = null;

        this.writeQueue =
            Promise.resolve();
    }

    async initialize() {

        try {

            const content =
                await fs.promises.readFile(
                    this.file,
                    "utf8"
                );

            this.data =
                JSON.parse(content);

        } catch (error) {

            this.data = {

                users: [],

                records: [],

                auditLogs: [],

                counters: {

                    userId: 0,

                    recordId: 0,

                    auditId: 0
                }
            };

            await this.persist();
        }
    }

    async persist() {

        this.writeQueue =
            this.writeQueue.then(
                async () => {

                    const temporaryFile =
                        `${this.file}.tmp`;

                    await fs.promises.writeFile(
                        temporaryFile,
                        JSON.stringify(
                            this.data,
                            null,
                            2
                        )
                    );

                    await fs.promises.rename(
                        temporaryFile,
                        this.file
                    );
                }
            );

        return this.writeQueue;
    }

    nextId(type) {

        this.data.counters[type]++;

        return this.data.counters[type];
    }
}


/*
============================================================
8. REPOSITORY PATTERN
============================================================
*/

class UserRepository {

    constructor(database) {

        this.db = database;
    }

    findByUsername(username) {

        return this.db.data.users.find(
            user =>
                user.username ===
                username
        );
    }

    findById(id) {

        return this.db.data.users.find(
            user =>
                user.id === id
        );
    }

    create(user) {

        this.db.data.users.push(user);

        return user;
    }
}


class RecordRepository {

    constructor(database) {

        this.db = database;
    }

    findAll() {

        return [
            ...this.db.data.records
        ];
    }

    findById(id) {

        return this.db.data.records.find(
            record =>
                record.id === id
        );
    }

    create(record) {

        this.db.data.records.push(record);

        return record;
    }

    update(id, updates) {

        const record =
            this.findById(id);

        if (!record) {

            return null;
        }

        Object.assign(
            record,
            updates
        );

        record.updatedAt =
            new Date().toISOString();

        return record;
    }

    delete(id) {

        const index =
            this.db.data.records.findIndex(
                record =>
                    record.id === id
            );

        if (index === -1) {

            return null;
        }

        return this.db.data.records.splice(
            index,
            1
        )[0];
    }
}


/*
============================================================
9. PASSWORD SECURITY
============================================================
*/

class PasswordService {

    static hash(password) {

        const salt =
            crypto.randomBytes(
                16
            ).toString("hex");

        const hash =
            crypto.scryptSync(
                password,
                salt,
                64
            ).toString("hex");

        return `${salt}:${hash}`;
    }

    static verify(
        password,
        storedPassword
    ) {

        const [
            salt,
            storedHash
        ] =
            storedPassword.split(":");

        const hash =
            crypto.scryptSync(
                password,
                salt,
                64
            );

        return crypto.timingSafeEqual(
            hash,
            Buffer.from(
                storedHash,
                "hex"
            )
        );
    }
}


/*
============================================================
10. TOKEN SERVICE
============================================================
*/

class TokenService {

    constructor(secret) {

        this.secret =
            secret;
    }

    create(payload) {

        const data = {

            ...payload,

            iat:
                Date.now(),

            exp:
                Date.now() +
                CONFIG.TOKEN_EXPIRATION
        };

        const encoded =
            Buffer.from(
                JSON.stringify(data)
            ).toString(
                "base64url"
            );

        const signature =
            crypto
                .createHmac(
                    "sha256",
                    this.secret
                )
                .update(encoded)
                .digest(
                    "base64url"
                );

        return `${encoded}.${signature}`;
    }

    verify(token) {

        const parts =
            token.split(".");

        if (
            parts.length !== 2
        ) {

            throw new AppError(
                "Invalid token.",
                401,
                "INVALID_TOKEN"
            );
        }

        const [
            encoded,
            signature
        ] = parts;

        const expected =
            crypto
                .createHmac(
                    "sha256",
                    this.secret
                )
                .update(encoded)
                .digest(
                    "base64url"
                );

        if (
            !crypto.timingSafeEqual(
                Buffer.from(
                    signature
                ),
                Buffer.from(
                    expected
                )
            )
        ) {

            throw new AppError(
                "Invalid token.",
                401,
                "INVALID_TOKEN"
            );
        }

        const payload =
            JSON.parse(
                Buffer.from(
                    encoded,
                    "base64url"
                ).toString()
            );

        if (
            Date.now() >
            payload.exp
        ) {

            throw new AppError(
                "Token expired.",
                401,
                "TOKEN_EXPIRED"
            );
        }

        return payload;
    }
}


/*
============================================================
11. CACHE
============================================================
*/

class TTLCache {

    constructor(ttl) {

        this.ttl = ttl;

        this.store =
            new Map();
    }

    set(key, value) {

        this.store.set(
            key,
            {
                value,

                expires:
                    Date.now() +
                    this.ttl
            }
        );
    }

    get(key) {

        const item =
            this.store.get(key);

        if (!item) {

            return null;
        }

        if (
            Date.now() >
            item.expires
        ) {

            this.store.delete(key);

            return null;
        }

        return item.value;
    }

    delete(key) {

        this.store.delete(key);
    }

    clear() {

        this.store.clear();
    }
}

const cache =
    new TTLCache(
        CONFIG.CACHE_TTL
    );


/*
============================================================
12. RATE LIMITER
============================================================
*/

class RateLimiter {

    constructor(
        maxRequests,
        windowMs
    ) {

        this.maxRequests =
            maxRequests;

        this.windowMs =
            windowMs;

        this.clients =
            new Map();
    }

    check(ip) {

        const now =
            Date.now();

        let client =
            this.clients.get(ip);

        if (!client) {

            client = {

                count: 0,

                reset:
                    now +
                    this.windowMs
            };

            this.clients.set(
                ip,
                client
            );
        }

        if (
            now >
            client.reset
        ) {

            client.count = 0;

            client.reset =
                now +
                this.windowMs;
        }

        client.count++;

        return {

            allowed:
                client.count <=
                this.maxRequests,

            remaining:
                Math.max(
                    0,
                    this.maxRequests -
                    client.count
                )
        };
    }
}

const rateLimiter =
    new RateLimiter(
        CONFIG.MAX_REQUESTS,
        CONFIG.RATE_WINDOW
    );


/*
============================================================
13. AUDIT SERVICE
============================================================
*/

class AuditService {

    constructor(database) {

        this.db = database;
    }

    async record(
        userId,
        action,
        resource,
        resourceId
    ) {

        const entry = {

            id:
                this.db.nextId(
                    "auditId"
                ),

            userId,

            action,

            resource,

            resourceId,

            timestamp:
                new Date().toISOString()
        };

        this.db.data.auditLogs.push(
            entry
        );

        await this.db.persist();

        eventBus.publish(
            "audit.created",
            entry
        );
    }
}


/*
============================================================
14. AUTH SERVICE
============================================================
*/

class AuthService {

    constructor(
        userRepository,
        database,
        tokenService,
        auditService
    ) {

        this.users =
            userRepository;

        this.db =
            database;

        this.tokens =
            tokenService;

        this.audit =
            auditService;
    }

    async register(
        username,
        password
    ) {

        if (
            !username ||
            !password
        ) {

            throw new AppError(
                "Username and password are required.",
                400,
                "VALIDATION_ERROR"
            );
        }

        if (
            password.length < 8
        ) {

            throw new AppError(
                "Password must contain at least 8 characters.",
                400,
                "WEAK_PASSWORD"
            );
        }

        if (
            this.users.findByUsername(
                username
            )
        ) {

            throw new AppError(
                "Username already exists.",
                409,
                "USER_EXISTS"
            );
        }

        const user = {

            id:
                this.db.nextId(
                    "userId"
                ),

            username,

            passwordHash:
                PasswordService.hash(
                    password
                ),

            role:
                "viewer",

            createdAt:
                new Date().toISOString()
        };

        this.users.create(
            user
        );

        await this.db.persist();

        await this.audit.record(
            user.id,
            "REGISTER",
            "user",
            user.id
        );

        return {

            id: user.id,

            username:
                user.username,

            role:
                user.role
        };
    }

    async login(
        username,
        password
    ) {

        const user =
            this.users.findByUsername(
                username
            );

        if (
            !user ||
            !PasswordService.verify(
                password,
                user.passwordHash
            )
        ) {

            throw new AppError(
                "Invalid credentials.",
                401,
                "INVALID_CREDENTIALS"
            );
        }

        const token =
            this.tokens.create({

                userId:
                    user.id,

                username:
                    user.username,

                role:
                    user.role
            });

        await this.audit.record(
            user.id,
            "LOGIN",
            "user",
            user.id
        );

        return {

            token,

            user: {

                id:
                    user.id,

                username:
                    user.username,

                role:
                    user.role
            }
        };
    }
}


/*
============================================================
15. RECORD SERVICE
============================================================
*/

class RecordService {

    constructor(
        repository,
        database,
        auditService
    ) {

        this.repository =
            repository;

        this.db =
            database;

        this.audit =
            auditService;
    }

    async create(
        userId,
        data
    ) {

        if (
            !data.name
        ) {

            throw new AppError(
                "Name is required.",
                400,
                "VALIDATION_ERROR"
            );
        }

        const record = {

            id:
                this.db.nextId(
                    "recordId"
                ),

            name:
                data.name,

            category:
                data.category ||
                "general",

            status:
                data.status ||
                "active",

            ownerId:
                userId,

            metadata:
                data.metadata ||
                {},

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };

        this.repository.create(
            record
        );

        await this.db.persist();

        cache.clear();

        await this.audit.record(
            userId,
            "CREATE",
            "record",
            record.id
        );

        eventBus.publish(
            "record.created",
            record
        );

        return record;
    }

    list(options) {

        const cacheKey =
            JSON.stringify(
                options
            );

        const cached =
            cache.get(
                cacheKey
            );

        if (cached) {

            return cached;
        }

        let records =
            this.repository.findAll();

        if (
            options.search
        ) {

            const search =
                options.search
                    .toLowerCase();

            records =
                records.filter(
                    record =>
                        record.name
                            .toLowerCase()
                            .includes(
                                search
                            )
                );
        }

        if (
            options.status
        ) {

            records =
                records.filter(
                    record =>
                        record.status ===
                        options.status
                );
        }

        if (
            options.category
        ) {

            records =
                records.filter(
                    record =>
                        record.category ===
                        options.category
                );
        }

        records.sort(
            (a, b) => {

                if (
                    options.sort ===
                    "name"
                ) {

                    return a.name.localeCompare(
                        b.name
                    );
                }

                return (
                    b.id - a.id
                );
            }
        );

        const page =
            Number(
                options.page
            ) || 1;

        const limit =
            Math.min(
                Number(
                    options.limit
                ) || 10,
                100
            );

        const start =
            (page - 1) *
            limit;

        const result = {

            page,

            limit,

            total:
                records.length,

            pages:
                Math.ceil(
                    records.length /
                    limit
                ),

            records:
                records.slice(
                    start,
                    start + limit
                )
        };

        cache.set(
            cacheKey,
            result
        );

        return result;
    }

    async update(
        userId,
        id,
        updates
    ) {

        const allowedFields = [

            "name",

            "category",

            "status",

            "metadata"
        ];

        const sanitized = {};

        for (
            const field of
            allowedFields
        ) {

            if (
                updates[field] !==
                undefined
            ) {

                sanitized[field] =
                    updates[field];
            }
        }

        const record =
            this.repository.update(
                id,
                sanitized
            );

        if (!record) {

            throw new AppError(
                "Record not found.",
                404,
                "NOT_FOUND"
            );
        }

        await this.db.persist();

        cache.clear();

        await this.audit.record(
            userId,
            "UPDATE",
            "record",
            id
        );

        eventBus.publish(
            "record.updated",
            record
        );

        return record;
    }

    async delete(
        userId,
        id
    ) {

        const record =
            this.repository.delete(
                id
            );

        if (!record) {

            throw new AppError(
                "Record not found.",
                404,
                "NOT_FOUND"
            );
        }

        await this.db.persist();

        cache.clear();

        await this.audit.record(
            userId,
            "DELETE",
            "record",
            id
        );

        eventBus.publish(
            "record.deleted",
            record
        );

        return record;
    }
}


/*
============================================================
16. APPLICATION CONTAINER
============================================================
*/

class Application {

    constructor() {

        this.database =
            new JsonDatabase(
                CONFIG.DATA_FILE
            );

        this.users =
            new UserRepository(
                this.database
            );

        this.records =
            new RecordRepository(
                this.database
            );

        this.tokens =
            new TokenService(
                CONFIG.TOKEN_SECRET
            );

        this.audit =
            new AuditService(
                this.database
            );

        this.auth =
            new AuthService(
                this.users,
                this.database,
                this.tokens,
                this.audit
            );

        this.recordService =
            new RecordService(
                this.records,
                this.database,
                this.audit
            );
    }

    async initialize() {

        await this.database.initialize();

        logger.info(
            "Application initialized."
        );
    }
}


/*
============================================================
17. HTTP BODY PARSER
============================================================
*/

function readBody(request) {

    return new Promise(
        (resolve, reject) => {

            let body = "";

            request.on(
                "data",
                chunk => {

                    body +=
                        chunk.toString();

                    if (
                        body.length >
                        1_000_000
                    ) {

                        reject(
                            new AppError(
                                "Request body too large.",
                                413,
                                "BODY_TOO_LARGE"
                            )
                        );

                        request.destroy();
                    }
                }
            );

            request.on(
                "end",
                () => {

                    if (!body) {

                        resolve({});
                        return;
                    }

                    try {

                        resolve(
                            JSON.parse(
                                body
                            )
                        );

                    } catch {

                        reject(
                            new AppError(
                                "Invalid JSON.",
                                400,
                                "INVALID_JSON"
                            )
                        );
                    }
                }
            );

            request.on(
                "error",
                reject
            );
        }
    );
}


/*
============================================================
18. RESPONSE HELPERS
============================================================
*/

function sendJson(
    response,
    status,
    data
) {

    const payload =
        JSON.stringify(
            data
        );

    response.writeHead(
        status,
        {
            "Content-Type":
                "application/json",

            "Content-Length":
                Buffer.byteLength(
                    payload
                )
        }
    );

    response.end(
        payload
    );
}


/*
============================================================
19. AUTHORIZATION
============================================================
*/

function authenticateRequest(
    request,
    application
) {

    const header =
        request.headers.authorization;

    if (!header) {

        throw new AppError(
            "Authentication required.",
            401,
            "AUTH_REQUIRED"
        );
    }

    const token =
        header.replace(
            /^Bearer\s+/,
            ""
        );

    return application.tokens.verify(
        token
    );
}


/*
============================================================
20. ROUTER
============================================================
*/

async function router(
    request,
    response,
    application
) {

    const url =
        new URL(
            request.url,
            `http://${request.headers.host}`
        );

    const pathname =
        url.pathname;

    /*
    ----------------------------------------------
    HEALTH
    ----------------------------------------------
    */

    if (
        request.method === "GET" &&
        pathname === "/health"
    ) {

        return sendJson(
            response,
            200,
            {

                status:
                    "healthy",

                uptime:
                    process.uptime(),

                memory:
                    process.memoryUsage(),

                cpu:
                    os.cpus().length,

                metrics:
                    metrics.snapshot()
            }
        );
    }


    /*
    ----------------------------------------------
    REGISTER
    ----------------------------------------------
    */

    if (
        request.method === "POST" &&
        pathname === "/api/auth/register"
    ) {

        const body =
            await readBody(
                request
            );

        const result =
            await application.auth.register(
                body.username,
                body.password
            );

        return sendJson(
            response,
            201,
            result
        );
    }


    /*
    ----------------------------------------------
    LOGIN
    ----------------------------------------------
    */

    if (
        request.method === "POST" &&
        pathname === "/api/auth/login"
    ) {

        const body =
            await readBody(
                request
            );

        const result =
            await application.auth.login(
                body.username,
                body.password
            );

        return sendJson(
            response,
            200,
            result
        );
    }


    /*
    ----------------------------------------------
    LIST RECORDS
    ----------------------------------------------
    */

    if (
        request.method === "GET" &&
        pathname === "/api/records"
    ) {

        authenticateRequest(
            request,
            application
        );

        const result =
            application.recordService.list({

                search:
                    url.searchParams.get(
                        "search"
                    ),

                status:
                    url.searchParams.get(
                        "status"
                    ),

                category:
                    url.searchParams.get(
                        "category"
                    ),

                sort:
                    url.searchParams.get(
                        "sort"
                    ),

                page:
                    url.searchParams.get(
                        "page"
                    ),

                limit:
                    url.searchParams.get(
                        "limit"
                    )
            });

        return sendJson(
            response,
            200,
            result
        );
    }


    /*
    ----------------------------------------------
    CREATE RECORD
    ----------------------------------------------
    */

    if (
        request.method === "POST" &&
        pathname === "/api/records"
    ) {

        const user =
            authenticateRequest(
                request,
                application
            );

        const body =
            await readBody(
                request
            );

        const record =
            await application.recordService.create(
                user.userId,
                body
            );

        return sendJson(
            response,
            201,
            record
        );
    }


    /*
    ----------------------------------------------
    UPDATE RECORD
    ----------------------------------------------
    */

    const updateMatch =
        pathname.match(
            /^\/api\/records\/(\d+)$/
        );

    if (
        updateMatch &&
        request.method === "PUT"
    ) {

        const user =
            authenticateRequest(
                request,
                application
            );

        const body =
            await readBody(
                request
            );

        const record =
            await application.recordService.update(
                user.userId,
                Number(
                    updateMatch[1]
                ),
                body
            );

        return sendJson(
            response,
            200,
            record
        );
    }


    /*
    ----------------------------------------------
    DELETE RECORD
    ----------------------------------------------
    */

    if (
        updateMatch &&
        request.method === "DELETE"
    ) {

        const user =
            authenticateRequest(
                request,
                application
            );

        const record =
            await application.recordService.delete(
                user.userId,
                Number(
                    updateMatch[1]
                )
            );

        return sendJson(
            response,
            200,
            {

                message:
                    "Record deleted.",

                record
            }
        );
    }


    /*
    ----------------------------------------------
    AUDIT LOG
    ----------------------------------------------
    */

    if (
        request.method === "GET" &&
        pathname === "/api/audit"
    ) {

        authenticateRequest(
            request,
            application
        );

        return sendJson(
            response,
            200,
            application.database.data.auditLogs
        );
    }


    /*
    ----------------------------------------------
    METRICS
    ----------------------------------------------
    */

    if (
        request.method === "GET" &&
        pathname === "/api/metrics"
    ) {

        authenticateRequest(
            request,
            application
        );

        return sendJson(
            response,
            200,
            metrics.snapshot()
        );
    }


    /*
    ----------------------------------------------
    404
    ----------------------------------------------
    */

    throw new AppError(
        "Route not found.",
        404,
        "NOT_FOUND"
    );
}


/*
============================================================
21. WORKER THREAD DEMONSTRATION
============================================================
*/

function runBackgroundComputation() {

    if (!isMainThread) {

        parentPort.postMessage(
            {

                result:
                    crypto
                        .createHash(
                            "sha256"
                        )
                        .update(
                            "Node.js Senior Engineering"
                        )
                        .digest(
                            "hex"
                        )
            }
        );

        return;
    }

    return new Promise(
        (resolve, reject) => {

            const worker =
                new Worker(
                    __filename
                );

            worker.once(
                "message",
                message => {

                    resolve(
                        message.result
                    );

                    worker.terminate();
                }
            );

            worker.once(
                "error",
                reject
            );
        }
    );
}


/*
============================================================
22. STREAM DEMONSTRATION
============================================================
*/

function createMetricsStream() {

    return Readable.from([
        JSON.stringify(
            metrics.snapshot()
        )
    ]);
}


/*
============================================================
23. BACKGROUND JOB
============================================================
*/

function startBackgroundJobs(
    application
) {

    setInterval(
        async () => {

            const records =
                application.records
                    .findAll();

            const expired =
                records.filter(
                    record =>
                        record.status ===
                        "active"
                );

            logger.info(
                "Background health scan completed.",
                {
                    records:
                        records.length,

                    active:
                        expired.length
                }
            );

        },
        60_000
    );
}


/*
============================================================
24. EVENT LISTENERS
============================================================
*/

eventBus.on(
    "record.created",
    record => {

        logger.info(
            "Record created.",
            {
                recordId:
                    record.id
            }
        );
    }
);

eventBus.on(
    "record.updated",
    record => {

        logger.info(
            "Record updated.",
            {
                recordId:
                    record.id
            }
        );
    }
);

eventBus.on(
    "record.deleted",
    record => {

        logger.warn(
            "Record deleted.",
            {
                recordId:
                    record.id
            }
        );
    }
);

eventBus.on(
    "audit.created",
    audit => {

        logger.info(
            "Audit event created.",
            {
                action:
                    audit.action
            }
        );
    }
);


/*
============================================================
25. MAIN APPLICATION
============================================================
*/

async function main() {

    /*
    ----------------------------------------------
    WORKER THREAD
    ----------------------------------------------
    */

    if (!isMainThread) {

        runBackgroundComputation();

        return;
    }


    /*
    ----------------------------------------------
    APPLICATION CONTAINER
    ----------------------------------------------
    */

    const application =
        new Application();

    await application.initialize();


    /*
    ----------------------------------------------
    HTTP SERVER
    ----------------------------------------------
    */

    const server =
        http.createServer(
            async (
                request,
                response
            ) => {

                const start =
                    performance.now();

                const ip =
                    request.socket
                        .remoteAddress ||
                    "unknown";

                /*
                RATE LIMITING
                */

                const rate =
                    rateLimiter.check(
                        ip
                    );

                if (!rate.allowed) {

                    return sendJson(
                        response,
                        429,
                        {
                            error:
                                "Too many requests."
                        }
                    );
                }


                /*
                SECURITY HEADERS
                */

                response.setHeader(
                    "X-Content-Type-Options",
                    "nosniff"
                );

                response.setHeader(
                    "X-Frame-Options",
                    "DENY"
                );

                response.setHeader(
                    "Referrer-Policy",
                    "no-referrer"
                );


                try {

                    await router(
                        request,
                        response,
                        application
                    );

                } catch (error) {

                    metrics.error();

                    const status =
                        error.statusCode ||
                        500;

                    logger.error(
                        error.message,
                        {
                            status,

                            path:
                                request.url,

                            method:
                                request.method
                        }
                    );

                    sendJson(
                        response,
                        status,
                        {

                            error:
                                error.message,

                            code:
                                error.code ||
                                "INTERNAL_ERROR"
                        }
                    );
                }


                /*
                PERFORMANCE METRICS
                */

                const duration =
                    performance.now() -
                    start;

                metrics.request(
                    request.url,
                    duration
                );
            }
        );


    /*
    ----------------------------------------------
    START SERVER
    ----------------------------------------------
    */

    server.listen(
        CONFIG.PORT,
        CONFIG.HOST,
        async () => {

            logger.info(
                "Server started.",
                {
                    port:
                        CONFIG.PORT
                }
            );

            console.log("");

            console.log(
                "=========================================="
            );

            console.log(
                " NODE.JS SENIOR ENGINEERING PLATFORM"
            );

            console.log(
                "=========================================="
            );

            console.log(
                `http://${CONFIG.HOST}:${CONFIG.PORT}`
            );

            console.log("");

            console.log(
                "POST /api/auth/register"
            );

            console.log(
                "POST /api/auth/login"
            );

            console.log(
                "GET  /api/records"
            );

            console.log(
                "POST /api/records"
            );

            console.log(
                "PUT  /api/records/:id"
            );

            console.log(
                "DELETE /api/records/:id"
            );

            console.log(
                "GET  /api/audit"
            );

            console.log(
                "GET  /api/metrics"
            );

            console.log(
                "GET  /health"
            );

            /*
            Run a worker computation.
            */

            try {

                const result =
                    await runBackgroundComputation();

                logger.info(
                    "Worker computation completed.",
                    {
                        hash:
                            result
                    }
                );

            } catch (error) {

                logger.error(
                    "Worker failed.",
                    {
                        error:
                            error.message
                    }
                );
            }

            /*
            Start background jobs.
            */

            startBackgroundJobs(
                application
            );
        }
    );


    /*
    ----------------------------------------------
    GRACEFUL SHUTDOWN
    ----------------------------------------------
    */

    const shutdown =
        async signal => {

            logger.info(
                `Received ${signal}.`
            );

            server.close(
                async () => {

                    await application
                        .database
                        .persist();

                    logger.info(
                        "Database persisted."
                    );

                    logger.info(
                        "Server shutdown complete."
                    );

                    process.exit(
                        0
                    );
                }
            );
        };


    process.on(
        "SIGINT",
        () =>
            shutdown("SIGINT")
    );

    process.on(
        "SIGTERM",
        () =>
            shutdown("SIGTERM")
    );


    /*
    ----------------------------------------------
    UNHANDLED ERRORS
    ----------------------------------------------
    */

    process.on(
        "uncaughtException",
        error => {

            logger.error(
                "Uncaught exception.",
                {
                    error:
                        error.stack
                }
            );
        }
    );


    process.on(
        "unhandledRejection",
        reason => {

            logger.error(
                "Unhandled rejection.",
                {
                    reason:
                        String(reason)
                }
            );
        }
    );
}


/*
============================================================
26. START APPLICATION
============================================================
*/

main().catch(
    error => {

        logger.error(
            "Application startup failed.",
            {
                error:
                    error.stack
            }
        );

        process.exit(1);
    }
);
