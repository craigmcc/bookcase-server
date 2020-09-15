"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Library = db.Library;
const LibraryServices = require("../services/LibraryServices");
const BadRequest = require("../util/BadRequest");
const NotFound = require("../util/NotFound");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Public Objects ------------------------------------------------------------

module.exports = (app) => {

    // GET / - Find all Library objects
    router.get("/", async (req, res) => {
        try {
            res.send(await LibraryServices.all());
        } catch (err) {
            console.error("LibraryRouters.all() error: ", err);
            res.status(500).send(err.message);
        }
    })

    // GET /:id - Find Library by ID
    router.get("/:id", async (req, res) => {
        try {
            res.send(await LibraryServices.find(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("LibraryRouters.fid() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/libraries", router);

}
