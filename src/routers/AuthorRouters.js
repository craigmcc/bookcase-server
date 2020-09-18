"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const AuthorServices = require("../services/AuthorServices");
const BadRequest = require("../util/BadRequest");
const NotFound = require("../util/NotFound");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Public Objects ------------------------------------------------------------

module.exports = (app) => {

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Author objects
    router.get("/", async (req, res) => {
        try {
            res.send(await AuthorServices.all(req.query));
        } catch (err) {
            console.error("AuthorRouters.all() error: ", err);
            res.status(500).send(err.message);
        }
    })

    // POST / - Insert a new Author
    router.post("/", async (req, res) => {
        try {
            res.send(await AuthorServices.insert(req.body));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(400).send(err.message);
            } else if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("AuthorRouters.insert() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // DELETE /:id - Remove Author by ID
    router.delete("/:id", async (req, res) => {
        try {
            res.send(await AuthorServices.remove(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("AuthorRouters.remove() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // GET /:id - Find Author by ID
    router.get("/:id", async (req, res) => {
        try {
            res.send(await AuthorServices.find(req.params.id, req.query));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("AuthorRouters.find() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // PUT /:id - Update Author by ID
    router.put("/:id", async (req, res) => {
        try {
            res.send(await AuthorServices.update(req.params.id));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(400).send(err.message);
            } else if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("AuthorRouters.update() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/authors", router);

}
