"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const AuthorServices = require("../services/AuthorServices");
const FormatErrorResponse = require("../util/FormatErrorResponse");

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

    // DELETE /:authorId - Remove Author by ID
    router.delete("/:authorId", async (req, res) => {
        try {
            res.send(await AuthorServices.remove(req.params.authorId));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:authorId - Find Author by ID
    router.get("/:authorId", async (req, res) => {
        try {
            res.send(await AuthorServices.find(req.params.authorId, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.find()");
            res.status(status).send(message);
        }
    })

    // PUT /:authorId - Update Author by ID
    router.put("/:authorId", async (req, res) => {
        try {
            res.send(await AuthorServices.update(req.params.authorId, req.body));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.update()");
            res.status(status).send(message);
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // ***** Author-Series Relationships (Many:Many)

    // GET /:authorId/series - Find Series by Author ID
    router.get("/:authorId/series", async (req, res) => {
        try {
            res.send(await AuthorServices.seriesAll
                (req.params.authorId, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesAll()");
            res.status(status).send(message);
        }
    })

    // GET /:authorId/series/exact/:name - Find Series by Author ID and exact name
    router.get("/:authorId/series/exact/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.seriesExact
                (req.params.authorId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesExact()");
            res.status(status).send(message);
        }
    })

    // GET /:authorId/series/name/:name - Find Series by Author ID and name segment
    router.get("/:authorId/series/name/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.seriesName
                (req.params.authorId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesName()");
            res.status(status).send(message);
        }
    })

    // ***** Author-Story Relationships (Many:Many)

    // GET /:authorId/stories - Find Story objects by Author ID
    router.get("/:authorId/stories", async (req, res) => {
        try {
            res.send(await AuthorServices.storyAll
            (req.params.authorId, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.storyAll()");
            res.status(status).send(message);
        }
    })

    // DELETE /:authorId/stories/:storyId - Remove Story from this Author
    router.delete("/:authorId/stories/:storyId", async (req, res) => {
        try {
            res.send(await AuthorServices.storyRemove
            (req.params.authorId, req.params.storyId));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesAdd()");
            res.status(status).send(message);
        }
    })

    // POST /:authorId/stories/:seriesId - Add Story to this Author
    router.post("/:authorId/stories/:storyId", async (req, res) => {
        try {
            res.send(await AuthorServices.storyAdd
            (req.params.authorId, req.params.seriesId));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesAdd()");
            res.status(status).send(message);
        }
    })

    // GET /:authorId/stories/exact/:name - Find Story by Author ID and exact name
    router.get("/:authorId/stories/exact/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.storyExact
            (req.params.authorId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.storyExact()");
            res.status(status).send(message);
        }
    })

    // GET /:authorId/stories/name/:name - Find Story by Author ID and name segment
    router.get("/:authorId/stories/name/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.storyName
            (req.params.authorId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.storyName()");
            res.status(status).send(message);
        }
    })

    // ***** Author-Volume Relationships (Many:Many)

    // GET /:authorId/volumes - Find Volume objects by Author ID
    router.get("/:authorId/volumes", async (req, res) => {
        try {
            res.send(await AuthorServices.volumeAll
            (req.params.authorId, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.volumeAll()");
            res.status(status).send(message);
        }
    })

    // DELETE /:authorId/volumes/:volumeId - Remove Volume from this Author
    router.delete("/:authorId/volumes/:volumeId", async (req, res) => {
        try {
            res.send(await AuthorServices.volumeRemove
            (req.params.authorId, req.params.volumeId));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesAdd()");
            res.status(status).send(message);
        }
    })

    // POST /:authorId/volumes/:seriesId - Add Volume to this Author
    router.post("/:authorId/volumes/:volumeId", async (req, res) => {
        try {
            res.send(await AuthorServices.volumeAdd
            (req.params.authorId, req.params.seriesId));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.seriesAdd()");
            res.status(status).send(message);
        }
    })

    // GET /:authorId/volumes/exact/:name - Find Volume by Author ID and exact name
    router.get("/:authorId/volumes/exact/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.volumeExact
            (req.params.authorId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.volumeExact()");
            res.status(status).send(message);
        }
    })

    // GET /:authorId/volumes/name/:name - Find Volume by Author ID and name segment
    router.get("/:authorId/volumes/name/:name", async (req, res) => {
        try {
            res.send(await AuthorServices.volumeName
            (req.params.authorId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "AuthorRouters.volumeName()");
            res.status(status).send(message);
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/authors", router);

}
