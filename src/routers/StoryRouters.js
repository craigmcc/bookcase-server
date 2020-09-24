"use strict";

// Internal Modules ----------------------------------------------------------

const StoryServices = require("../services/StoryServices");
const FormatErrorResponse = require("../util/FormatErrorResponse");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Public Objects ------------------------------------------------------------

module.exports = (app) => {

    // Model Specific Endpoints (no id) --------------------------------------

    // GET /exact/:name - Find Story by exact name
    router.get("/exact/:name",
        async (req, res) => {
            try {
                res.send(await StoryServices.exact(req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.exact()");
                res.status(status).send(message);
            }
        })

    // GET /name/:name - Find Library objects by name segment match
    router.get("/name/:name",
        async (req, res) => {
            try {
                res.send(await StoryServices.name(req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.name()");
                res.status(status).send(message);
            }
        })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Story objects
    router.get("/",
        async (req, res) => {
            try {
                res.send(await StoryServices.all(req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.all()");
                res.status(status).send(message);
            }
        })

    // POST / - Insert a new Story
    router.post("/",
        async (req, res) => {
            try {
                res.send(await StoryServices.insert(req.body));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.insert()");
                res.status(status).send(message);
            }
        })

    // DELETE /:storyId - Remove Story by ID
    router.delete("/:storyId",
        async (req, res) => {
            try {
                res.send(await StoryServices.remove(req.params.storyId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.remove()");
                res.status(status).send(message);
            }
        })

    // GET /:storyId - Find Story by ID
    router.get("/:storyId",
        async (req, res) => {
            try {
                res.send(await StoryServices.find(req.params.storyId, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.find()");
                res.status(status).send(message);
            }
        })

    // PUT /:storyId - Update Story by ID
    router.put("/:storyId",
        async (req, res) => {
            try {
                res.send(await StoryServices.update(req.params.storyId, req.body));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.update()");
                res.status(status).send(message);
            }
        })

    // Model Specific Endpoints ----------------------------------------------

    // ***** Story-Author Relationships (Many:Many) *****

    // GET /:storyId/authors - Get all Authors for this Story
    router.get("/:storyId/authors",
        async (req, res) => {
            try {
                res.send(await StoryServices.authorAll
                    (req.params.storyId, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.authorAll()");
                res.status(status).send(message);
            }
        })

    // DELETE /:storyId/authors/:authorId - Remove Author from this Story
    router.delete("/:storyId/authors/:authorId",
        async (req, res) => {
            try {
                res.send(await StoryServices.authorRemove
                    (req.params.storyId, req.params.authorId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.authorRemove()");
                res.status(status).send(message);
            }
        })

    // POST /:storyId/authors/:authorId - Add Author to this Story
    router.post("/:storyId/authors/:authorId",
        async (req, res) => {
            try {
                res.send(await StoryServices.authorAdd
                    (req.params.storyId, req.params.authorId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.authorAdd()");
                res.status(status).send(message);
            }
        })

    // GET /:storyId/authors/exact/:firstName/:lastName
    //   - Get Author for this Story by exact name
    router.get("/:storyId/authors/exact/:firstName/:lastName",
        async (req, res) => {
            try {
                res.send(await StoryServices.authorExact
                    (req.params.storyId, req.params.firstName,
                     req.params.lastName, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.authorExact()");
                res.status(status).send(message);
            }
        })

    // GET /:storyId/authors/name/:name
    //   - Get Authors for this Story by name segment match
    router.get("/:storyId/authors/name/:name",
        async (req, res) => {
            try {
                res.send(await StoryServices.authorName
                    (req.params.storyId, req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.authorName()");
                res.status(status).send(message);
            }
        })

    // ***** Story-Volume Relationships (Many:Many) *****

    // GET /:storyId/volumes - Get all Volumes for this Story
    router.get("/:storyId/volumes",
        async (req, res) => {
            try {
                res.send(await StoryServices.volumeAll
                    (req.params.storyId, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.volumeAll()");
                res.status(status).send(message);
            }
        })

    // DELETE /:storyId/volumes/:volumeId - Remove Volume from this Story
    router.delete("/:storyId/volumes/:volumeId",
        async (req, res) => {
            try {
                res.send(await StoryServices.volumeRemove
                    (req.params.storyId, req.params.volumeId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.volumeRemove()");
                res.status(status).send(message);
            }
        })

    // POST /:storyId/volumes/:volumeId - Add Volume to this Story
    router.post("/:storyId/volumes/:volumeId",
        async (req, res) => {
            try {
                res.send(await StoryServices.volumeAdd
                    (req.params.storyId, req.params.volumeId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.volumeAdd()");
                res.status(status).send(message);
            }
        })

    // GET /:storyId/volumes/exact/:firstName/:lastName
    //   - Get Volume for this Story by exact name
    router.get("/:storyId/volumes/exact/:name",
        async (req, res) => {
            try {
                res.send(await StoryServices.volumeExact
                    (req.params.storyId, req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.volumeExact()");
                res.status(status).send(message);
            }
        })

    // GET /:storyId/volumes/name/:name
    //   - Get Volumes for this Story by name segment match
    router.get("/:storyId/volumes/name/:name",
        async (req, res) => {
            try {
                res.send(await StoryServices.volumeName
                    (req.params.storyId, req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "StoryRouters.volumeName()");
                res.status(status).send(message);
            }
        })

    // Export Routes ---------------------------------------------------------

    app.use("/api/stories", router);

}
