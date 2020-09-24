"use strict";

// Internal Modules ----------------------------------------------------------

const VolumeServices = require("../services/VolumeServices");
const FormatErrorResponse = require("../util/FormatErrorResponse");

const NotFound = require("../util/NotFound");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Public Objects ------------------------------------------------------------

module.exports = (app) => {

    // Model Specific Endpoints (no id) --------------------------------------

    // GET /exact/:name - Find Volume by exact name
    router.get("/exact/:name",
        async (req, res) => {
            try {
                res.send(await VolumeServices.exact(req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.exact()");
                res.status(status).send(message);
            }
        })

    // GET /name/:name - Find Library objects by name segment match
    router.get("/name/:name",
        async (req, res) => {
            try {
                res.send(await VolumeServices.name(req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.name()");
                res.status(status).send(message);
            }
        })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Volume objects
    router.get("/",
        async (req, res) => {
            try {
                res.send(await VolumeServices.all(req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.all()");
                res.status(status).send(message);
            }
        })

    // POST / - Insert a new Volume
    router.post("/",
        async (req, res) => {
            try {
                res.send(await VolumeServices.insert(req.body));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.insert()");
                res.status(status).send(message);
            }
        })

    // DELETE /:volumeId - Remove Volume by ID
    router.delete("/:volumeId",
        async (req, res) => {
            try {
                res.send(await VolumeServices.remove(req.params.volumeId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.remove()");
                res.status(status).send(message);
            }
        })

    // GET /:volumeId - Find Volume by ID
    router.get("/:volumeId",
        async (req, res) => {
            try {
                res.send(await VolumeServices.find(req.params.volumeId, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.find()");
                res.status(status).send(message);
            }
        })

    // PUT /:volumeId - Update Volume by ID
    router.put("/:volumeId",
        async (req, res) => {
            try {
                res.send(await VolumeServices.update(req.params.volumeId, req.body));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.update()");
                res.status(status).send(message);
            }
        })

    // Model Specific Endpoints ----------------------------------------------

    // ***** Volume-Author Relationships (Many:Many) *****

    // GET /:volumeId/authors - Get all Authors for this Volume
    router.get("/:volumeId/authors",
        async (req, res) => {
            try {
                res.send(await VolumeServices.authorAll
                    (req.params.volumeId, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.authorAll()");
                res.status(status).send(message);
            }
        })

    // DELETE /:volumeId/authors/:authorId - Remove Author from this Volume
    router.delete("/:volumeId/authors/:authorId",
        async (req, res) => {
            try {
                res.send(await VolumeServices.authorRemove
                    (req.params.volumeId, req.params.authorId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.authorRemove()");
                res.status(status).send(message);
            }
        })

    // POST /:volumeId/authors/:authorId - Add Author to this Volume
    router.post("/:volumeId/authors/:authorId",
        async (req, res) => {
            try {
                res.send(await VolumeServices.authorAdd
                    (req.params.volumeId, req.params.authorId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.authorAdd()");
                res.status(status).send(message);
            }
        })

    // GET /:volumeId/authors/exact/:firstName/:lastName
    //   - Get Author for this Volume by exact name
    router.get("/:volumeId/authors/exact/:firstName/:lastName",
        async (req, res) => {
            try {
                res.send(await VolumeServices.authorExact
                    (req.params.volumeId, req.params.firstName,
                     req.params.lastName, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.authorExact()");
                res.status(status).send(message);
            }
        })

    // GET /:volumeId/authors/name/:name
    //   - Get Authors for this Volume by name segment match
    router.get("/:volumeId/authors/name/:name",
        async (req, res) => {
            try {
                res.send(await VolumeServices.authorName
                    (req.params.volumeId, req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.authorName()");
                res.status(status).send(message);
            }
        })

    // ***** Volume-Story Relationships (Many:Many) *****

    // GET /:volumeId/stories - Get all Stories for this Volume
    router.get("/:volumeId/stories",
        async (req, res) => {
            try {
                res.send(await VolumeServices.storyAll
                    (req.params.volumeId, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.storyAll()");
                res.status(status).send(message);
            }
        })

    // DELETE /:volumeId/stories/:storyId - Remove Story from this Volume
    router.delete("/:volumeId/stories/:storyId",
        async (req, res) => {
            try {
                res.send(await VolumeServices.storyRemove
                    (req.params.volumeId, req.params.storyId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.storyRemove()");
                res.status(status).send(message);
            }
        })

    // POST /:volumeId/stories/:storyId - Add Story to this Volume
    router.post("/:volumeId/stories/:storyId",
        async (req, res) => {
            try {
                res.send(await VolumeServices.storyAdd
                    (req.params.volumeId, req.params.storyId));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.storyAdd()");
                res.status(status).send(message);
            }
        })

    // GET /:volumeId/stories/exact/:name
    //   - Get Story for this Volume by exact name
    router.get("/:volumeId/stories/exact/:name",
        async (req, res) => {
            try {
                res.send(await VolumeServices.storyExact
                    (req.params.volumeId, req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.storyExact()");
                res.status(status).send(message);
            }
        })

    // GET /:volumeId/stories/name/:name
    //   - Get Stories for this Volume by name segment match
    router.get("/:volumeId/stories/name/:name",
        async (req, res) => {
            try {
                res.send(await VolumeServices.storyName
                    (req.params.volumeId, req.params.name, req.query));
            } catch (err) {
                let [status, message] =
                    FormatErrorResponse(err, "VolumeRouters.storyName()");
                res.status(status).send(message);
            }
        })

    app.use("/api/volumes", router);

}
