"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("./src/models/index");

// External Modules ----------------------------------------------------------

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");

// Configure Application -----------------------------------------------------

const app = express();
// app.set("json spaces", 2); // For pretty-printed JSON responses
app.use(bodyParser.json());
app.use(bodyParser.text({
    limit: "1mb",
    type: "text/csv"
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: "*"
}))

// Configure Routes ----------------------------------------------------------

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Bookcase Server Application"
    });
});

// TODO - Configure Routers
require("./src/routers/AuthorRouters")(app);
require("./src/routers/DevModeRouters")(app);
require("./src/routers/LibraryRouters")(app);
require("./src/routers/SeriesRouters")(app);

// Start Server --------------------------------------------------------------

let PORT = process.env.PORT || 8084;

app.listen(PORT, () => {
    console.info(`Server is running on port ${PORT}`);
});
