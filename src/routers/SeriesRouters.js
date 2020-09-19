"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const SeriesServices = require("../services/SeriesServices");
const BadRequest = require("../util/BadRequest");
const NotFound = require("../util/NotFound");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Public Objects ------------------------------------------------------------

module.exports = (app) => {

    // Model Specific Endpoints (no id) --------------------------------------

    // GET /exact/:name - Find Series by exact name
    router.get("/exact/:name", async (req, res) => {
        try {
            res.send(await SeriesServices.exact(req.params.name, req.query));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("SeriesRouters.exact() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // GET /name/:name - Find Library objects by name segment match
    router.get("/name/:name", async (req, res) => {
        try {
            res.send(await SeriesServices.name(req.params.name, req.query));
        } catch (err) {
            console.error("SeriesRouters.name() error: ", err);
            res.status(500).send(err.message);
        }
    })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Series objects
    router.get("/", async (req, res) => {
        try {
            res.send(await SeriesServices.all(req.query));
        } catch (err) {
            console.error("SeriesRouters.all() error: ", err);
            res.status(500).send(err.message);
        }
    })

    // POST / - Insert a new Series
    router.post("/", async (req, res) => {
        try {
            res.send(await SeriesServices.insert(req.body));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(400).send(err.message);
            } else if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("SeriesRouters.insert() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // DELETE /:id - Remove Series by ID
    router.delete("/:id", async (req, res) => {
        try {
            res.send(await SeriesServices.remove(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("SeriesRouters.remove() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // GET /:id - Find Series by ID
    router.get("/:id", async (req, res) => {
        try {
            res.send(await SeriesServices.find(req.params.id, req.query));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("SeriesRouters.find() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // PUT /:id - Update Series by ID
    router.put("/:id", async (req, res) => {
        try {
            res.send(await SeriesServices.update(req.params.id));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(400).send(err.message);
            } else if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("SeriesRouters.update() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // GET /:id/authors - Get all Authors for this Series (optionally paginated)
    router.get("/:id/authors", async (req, res) => {
        try {
            res.send(await SeriesServices.authorAll
                (req.params.id, req.query));
        } catch (err) {
            if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("SeriesRouters.authorAll() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // GET /:id/authors/exact/:firstName/:lastName
    //   - Get Author for this Series by exact name
    router.get("/:id/authors/exact/:firstName/:lastName", async (req, res) => {
        try {
            res.send(await SeriesServices.authorExact
                (req.params.id, req.params.firstName,
                 req.params.lastName, req.query));
        } catch (err) {
            if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("SeriesRouters.authorAll() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // POST /:id/authors/:authorId - Add Author to this Series
    router.post("/:id/authors/:authorId", async (req, res) => {
        try {
            res.send(await SeriesServices.authorAdd
                (req.params.id, req.params.authorId));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(400).send(err.message);
            } else if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("SeriesRouters.authorAdd() error: ", err);
                res.status(500).send(err.message);
            }
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/series", router);

}
