// There is error in being unhealthy
require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});
