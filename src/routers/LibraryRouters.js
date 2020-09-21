"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const FormatErrorResponse = require("../util/FormatErrorResponse");
const LibraryServices = require("../services/LibraryServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Public Objects ------------------------------------------------------------

module.exports = (app) => {

    // Model Specific Endpoints (no :libraryId) -------------------------------------

    // GET /exact/:name - Find Library by exact name
    router.get("/exact/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.exact(req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.exact()");
            res.status(status).send(message);
        }
    })

    // GET /name/:name - Find Library objects by name segment match
    router.get("/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.name(req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.name()");
            res.status(status).send(message);
        }
    })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Library objects
    router.get("/", async (req, res) => {
        try {
            res.send(await LibraryServices.all(req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.all()");
            res.status(status).send(message);
        }
    })

    // POST / - Insert a new Library
    router.post("/", async (req, res) => {
        try {
            res.send(await LibraryServices.insert(req.body));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.insert()");
            res.status(status).send(message);
        }
    })

    // DELETE /:libraryId - Remove Library by ID
    router.delete("/:libraryId", async (req, res) => {
        try {
            res.send(await LibraryServices.remove(req.params.libraryId));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:libraryId - Find Library by ID
    router.get("/:libraryId", async (req, res) => {
        try {
            res.send(await LibraryServices.find(req.params.libraryId, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.find()");
            res.status(status).send(message);
        }
    })

    // PUT /:libraryId - Update Library by ID
    router.put("/:libraryId", async (req, res) => {
        try {
            res.send(await LibraryServices.update(req.params.libraryId, req.body));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.update()");
            res.status(status).send(message);
        }
    })

    // Model Specific Endpoints (with :libraryId) -----------------------------------

    // ***** Library-Author Relationships (One:Many) *****

    // GET /:libraryId/authors - Find Authors by Library ID
    router.get("/:libraryId/authors", async (req, res) => {
        try {
            res.send(await LibraryServices.authorAll(req.params.libraryId, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.authorAll()");
            res.status(status).send(message);
        }
    })

    // GET /:libraryId/authors/exact/:firstName/:lastName
    //   - Find Author by Library ID and exact names
    router.get("/:libraryId/authors/exact/:firstName/:lastName", async (req, res) => {
        try {
            res.send(await LibraryServices.authorExact
                (req.params.libraryId, req.params.firstName, req.params.lastName, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.authorExact()");
            res.status(status).send(message);
        }
    })


    // GET /:libraryId/authors/name/:name - Find Authors by Library ID and name segment
    router.get("/:libraryId/authors/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.authorName
                    (req.params.libraryId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.authorName()");
            res.status(status).send(message);
        }
    })

    // ***** Library-Series Relationships (One:Many) *****

    // GET /:libraryId/series - Find Series by Library ID
    router.get("/:libraryId/series", async (req, res) => {
        try {
            res.send(await LibraryServices.seriesAll
                (req.params.libraryId, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.seriesAll()");
            res.status(status).send(message);
        }
    })

    // GET /:libraryId/series/exact/:name - Find Series by Library ID and exact name
    router.get("/:libraryId/series/exact/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.seriesExact
                (req.params.libraryId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.seriesExact()");
            res.status(status).send(message);
        }
    })

    // GET /:libraryId/series/name/:name - Find Series by Library ID and name segment
    router.get("/:libraryId/series/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.seriesName
            (req.params.libraryId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.seriesName()");
            res.status(status).send(message);
        }
    })

    // ***** Library-Story Relationships (One:Many) *****

    // GET /:libraryId/stories - Find Stories by Library ID
    router.get("/:libraryId/stories", async (req, res) => {
        try {
            res.send(await LibraryServices.storyAll
            (req.params.libraryId, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.storiesAll()");
            res.status(status).send(message);
        }
    })

    // GET /:libraryId/stories/exact/:name - Find Story by Library ID and exact name
    router.get("/:libraryId/stories/exact/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.storyExact
            (req.params.libraryId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.storiesExact()");
            res.status(status).send(message);
        }
    })

    // GET /:libraryId/stories/name/:name - Find Stories by Library ID and name segment
    router.get("/:libraryId/volumes/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.storyName
            (req.params.libraryId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.volumesName()");
            res.status(status).send(message);
        }
    })

    // ***** Library-Volume Relationships (One:Many) *****

    // GET /:libraryId/volumes - Find Volume by Library ID
    router.get("/:libraryId/volumes", async (req, res) => {
        try {
            res.send(await LibraryServices.volumeAll
            (req.params.libraryId, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.volumesAll()");
            res.status(status).send(message);
        }
    })

    // GET /:libraryId/volumes/exact/:name - Find Volume by Library ID and exact name
    router.get("/:libraryId/volumes/exact/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.volumeExact
            (req.params.libraryId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.volumesExact()");
            res.status(status).send(message);
        }
    })

    // GET /:libraryId/volumes/name/:name - Find Volume by Library ID and name segment
    router.get("/:libraryId/volumes/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.volumeName
            (req.params.libraryId, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.volumesName()");
            res.status(status).send(message);
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/libraries", router);

}
