function validateNumbers(req, res) {
    const { a, b } = req.body;

    if (
        typeof a !== "number" ||
        typeof b !== "number" ||
        !Number.isFinite(a) ||
        !Number.isFinite(b)
    ) {
        res.status(400).json({
            error: "Both a and b must be valid numbers"
        });

        return false;
    }

    return true;
}

if (!validateNumbers(req, res)) return;
