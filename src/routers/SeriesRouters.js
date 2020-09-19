"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const FormatErrorResponse = require("../util/FormatErrorResponse");
const SeriesServices = require("../services/SeriesServices");

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
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.exact()");
            res.status(status).send(message);
        }
    })

    // GET /name/:name - Find Library objects by name segment match
    router.get("/name/:name", async (req, res) => {
        try {
            res.send(await SeriesServices.name(req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.name()");
            res.status(status).send(message);
        }
    })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Series objects
    router.get("/", async (req, res) => {
        try {
            res.send(await SeriesServices.all(req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.all()");
            res.status(status).send(message);
        }
    })

    // POST / - Insert a new Series
    router.post("/", async (req, res) => {
        try {
            res.send(await SeriesServices.insert(req.body));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.insert()");
            res.status(status).send(message);
        }
    })

    // DELETE /:id - Remove Series by ID
    router.delete("/:id", async (req, res) => {
        try {
            res.send(await SeriesServices.remove(req.params.id));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:id - Find Series by ID
    router.get("/:id", async (req, res) => {
        try {
            res.send(await SeriesServices.find(req.params.id, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.find()");
            res.status(status).send(message);
        }
    })

    // PUT /:id - Update Series by ID
    router.put("/:id", async (req, res) => {
        try {
            res.send(await SeriesServices.update(req.params.id, req.body));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.update()");
            res.status(status).send(message);
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // GET /:id/authors - Get all Authors for this Series (optionally paginated)
    router.get("/:id/authors", async (req, res) => {
        try {
            res.send(await SeriesServices.authorAll
                (req.params.id, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.authorAll()");
            res.status(status).send(message);
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
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.authorExact()");
            res.status(status).send(message);
        }
    })

    // GET /:id/authors/name/:name
    //   - Get Author for this Series by exact name
    router.get("/:id/authors/exact/:name", async (req, res) => {
        try {
            res.send(await SeriesServices.authorName
            (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.authorExact()");
            res.status(status).send(message);
        }
    })

    // POST /:id/authors/:authorId - Add Author to this Series
    router.post("/:id/authors/:authorId", async (req, res) => {
        try {
            res.send(await SeriesServices.authorAdd
            (req.params.id, req.params.authorId));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "SeriesRouters.authorAdd()");
            res.status(status).send(message);
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/series", router);

}
