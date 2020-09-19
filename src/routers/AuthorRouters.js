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

    // Model Specific Endpoints (no id) --------------------------------------

    // GET /exact/:name - Find Author by exact name
    router.get("/exact/:firstName/:lastName", async (req, res) => {
        try {
            res.send(await AuthorServices.exact
            (req.params.firstName, req.params.lastName, req.query));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("AuthorRouters.exact() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // GET /name/:name - Find Author objects by name segment match
    router.get("/name/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.name(req.params.name, req.query));
        } catch (err) {
            console.error("AuthorRouters.name() error: ", err);
            res.status(500).send(err.message);
        }
    })

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

    // Model Specific Endpoints ----------------------------------------------

    // GET /:id/series - Find Series by Author ID
    router.get("/:id/series", async (req, res) => {
        try {
            res.send(await AuthorServices.seriesAll
                (req.params.id, req.query));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("AuthorRouters.seriesAll() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // GET /:id/series/exact/:name - Find Series by Author ID and exact name
    router.get("/:id/series/exact/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.seriesExact
                (req.params.id, req.params.name, req.query));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("AuthorRouters.seriesExact() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })


    // GET /:id/series/name/:name - Find Series by Author ID and name segment
    router.get("/:id/series/name/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.seriesName
                (req.params.id, req.params.name, req.query));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("LibraryRouters.seriesName() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/authors", router);

}
