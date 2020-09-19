"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const AuthorServices = require("../services/AuthorServices");
const FormatErrorResponse = require("../util/FormatErrorResponse");

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
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.exact()");
            res.status(status).send(message);
        }
    })

    // GET /name/:name - Find Author objects by name segment match
    router.get("/name/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.name(req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.name()");
            res.status(status).send(message);
        }
    })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Author objects
    router.get("/", async (req, res) => {
        try {
            res.send(await AuthorServices.all(req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.all()");
            res.status(status).send(message);
        }
    })

    // POST / - Insert a new Author
    router.post("/", async (req, res) => {
        try {
            res.send(await AuthorServices.insert(req.body));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.insert()");
            res.status(status).send(message);
        }
    })

    // DELETE /:id - Remove Author by ID
    router.delete("/:id", async (req, res) => {
        try {
            res.send(await AuthorServices.remove(req.params.id));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:id - Find Author by ID
    router.get("/:id", async (req, res) => {
        try {
            res.send(await AuthorServices.find(req.params.id, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.find()");
            res.status(status).send(message);
        }
    })

    // PUT /:id - Update Author by ID
    router.put("/:id", async (req, res) => {
        try {
            res.send(await AuthorServices.update(req.params.id, req.body));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.update()");
            res.status(status).send(message);
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // GET /:id/series - Find Series by Author ID
    router.get("/:id/series", async (req, res) => {
        try {
            res.send(await AuthorServices.seriesAll
                (req.params.id, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesAll()");
            res.status(status).send(message);
        }
    })

    // GET /:id/series/exact/:name - Find Series by Author ID and exact name
    router.get("/:id/series/exact/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.seriesExact
                (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesExact()");
            res.status(status).send(message);
        }
    })


    // GET /:id/series/name/:name - Find Series by Author ID and name segment
    router.get("/:id/series/name/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.seriesName
                (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesName()");
            res.status(status).send(message);
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/authors", router);

}
