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
    router.get("/exact/:name",
        async (req, res) => {
        try {
            res.send(await SeriesServices.exact(req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.exact()");
            res.status(status).send(message);
        }
    })

    // GET /name/:name - Find Library objects by name segment match
    router.get("/name/:name",
        async (req, res) => {
        try {
            res.send(await SeriesServices.name(req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.name()");
            res.status(status).send(message);
        }
    })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Series objects
    router.get("/",
        async (req, res) => {
        try {
            res.send(await SeriesServices.all(req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.all()");
            res.status(status).send(message);
        }
    })

    // POST / - Insert a new Series
    router.post("/",
        async (req, res) => {
        try {
            res.send(await SeriesServices.insert(req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.insert()");
            res.status(status).send(message);
        }
    })

    // DELETE /:seriesId - Remove Series by ID
    router.delete("/:seriesId",
        async (req, res) => {
        try {
            res.send(await SeriesServices.remove(req.params.seriesId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:seriesId - Find Series by ID
    router.get("/:seriesId",
        async (req, res) => {
        try {
            res.send(await SeriesServices.find(req.params.seriesId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.find()");
            res.status(status).send(message);
        }
    })

    // PUT /:seriesId - Update Series by ID
    router.put("/:seriesId",
        async (req, res) => {
        try {
            res.send(await SeriesServices.update(req.params.seriesId, req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.update()");
            res.status(status).send(message);
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // ***** Series-Author Relationships (Many:Many) *****

    // GET /:seriesId/authors - Get all Authors for this Series
    router.get("/:seriesId/authors",
        async (req, res) => {
        try {
            res.send(await SeriesServices.authorAll
                (req.params.seriesId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.authorAll()");
            res.status(status).send(message);
        }
    })

    // DELETE /:seriesId/authors/:authorId - Remove Author from this Series
    router.delete("/:seriesId/authors/:authorId",
        async (req, res) => {
        try {
            res.send(await SeriesServices.authorRemove
                (req.params.seriesId, req.params.authorId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.authorRemove()");
            res.status(status).send(message);
        }
    })

    // POST /:seriesId/authors/:authorId - Add Author to this Series
    router.post("/:seriesId/authors/:authorId",
        async (req, res) => {
        try {
            res.send(await SeriesServices.authorAdd
                (req.params.seriesId, req.params.authorId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.authorAdd()");
            res.status(status).send(message);
        }
    })

    // GET /:seriesId/authors/exact/:firstName/:lastName
    //   - Get Author for this Series by exact name
    router.get("/:seriesId/authors/exact/:firstName/:lastName",
        async (req, res) => {
        try {
            res.send(await SeriesServices.authorExact
            (req.params.seriesId, req.params.firstName,
                req.params.lastName, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.authorExact()");
            res.status(status).send(message);
        }
    })

    // GET /:seriesId/authors/name/:name
    //   - Get Authors for this Series by name segment match
    router.get("/:seriesId/authors/name/:name",
        async (req, res) => {
        try {
            res.send(await SeriesServices.authorName
                (req.params.seriesId, req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.authorName()");
            res.status(status).send(message);
        }
    })

    // ***** Series-Story Relationships (Many:Many) *****

    // GET /:seriesId/stories - Get all Stories for this Series
    router.get("/:seriesId/stories",
        async (req, res) => {
        try {
            res.send(await SeriesServices.storyAll
                (req.params.seriesId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.storyAll()");
            res.status(status).send(message);
        }
    })

    // DELETE /:seriesId/stories/:storyId - Remove Story from this Series
    router.delete("/:seriesId/stories/:storyId",
        async (req, res) => {
        try {
            res.send(await SeriesServices.seriesRemove
                (req.params.seriesId, req.params.storyId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.storyAdd()");
            res.status(status).send(message);
        }
    })

    // POST /:seriesId/stories/:storyId - Add Story to this Series
    router.post("/:seriesId/stories/:seriesId",
        async (req, res) => {
        try {
            res.send(await SeriesServices.storyAdd
                (req.params.seriesId, req.params.storyId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.storyAdd()");
            res.status(status).send(message);
        }
    })

    // GET /:seriesId/stories/exact/:name
    //   - Get Story for this Series by exact name
    router.get("/:seriesId/stories/exact/:name",
        async (req, res) => {
        try {
            res.send(await SeriesServices.storyExact
                (req.params.seriesId, req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.storyExact()");
            res.status(status).send(message);
        }
    })

    // GET /:seriesId/stories/name/:name
    //   - Get Stories for this Series by name segment match
    router.get("/:seriesId/stories/name/:name",
        async (req, res) => {
        try {
            res.send(await SeriesServices.storyName
                (req.params.seriesId, req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "SeriesRouters.storyName()");
            res.status(status).send(message);
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/series", router);

}
