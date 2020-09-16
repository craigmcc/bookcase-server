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

    // Model Specific Endpoints ----------------------------------------------

    // GET /exact/:name - Find Library by exact name
    router.get("/exact/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.exact(req.params.name));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("LibraryRouters.exact() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // GET /name/:name - Find Library objects by name segment match
    router.get("/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.name(req.params.name));
        } catch (err) {
            console.error("LibraryRouters.name() error: ", err);
            res.status(500).send(err.message);
        }
    })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Library objects
    router.get("/", async (req, res) => {
        try {
            res.send(await LibraryServices.all());
        } catch (err) {
            console.error("LibraryRouters.all() error: ", err);
            res.status(500).send(err.message);
        }
    })

    // POST / - Insert a new Library
    router.post("/", async (req, res) => {
        try {
            res.send(await LibraryServices.insert(req.body));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(404).send(err.message);
            } else if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("LibraryRouters.insert() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // DELETE /:id - Remove Library by ID
    router.delete("/:id", async (req, res) => {
        try {
            res.send(await LibraryServices.remove(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("LibraryRouters.remove() error: ", err);
                res.status(500).send(err.message);
            }
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
                console.error("LibraryRouters.find() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // PUT /:id - Update Library by ID
    router.put("/:id", async (req, res) => {
        try {
            res.send(await LibraryServices.update(req.params.id));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(404).send(err.message);
            } else if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("LibraryRouters.update() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/libraries", router);

}
