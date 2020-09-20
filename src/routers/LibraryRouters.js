"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const FormatErrorResponse = require("../util/FormatErrorResponse");
const LibraryServices = require("../services/LibraryServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Public Objects ------------------------------------------------------------

module.exports = (app) => {

    // Model Specific Endpoints (no :id) -------------------------------------

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

    // DELETE /:id - Remove Library by ID
    router.delete("/:id", async (req, res) => {
        try {
            res.send(await LibraryServices.remove(req.params.id));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:id - Find Library by ID
    router.get("/:id", async (req, res) => {
        try {
            res.send(await LibraryServices.find(req.params.id, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.find()");
            res.status(status).send(message);
        }
    })

    // PUT /:id - Update Library by ID
    router.put("/:id", async (req, res) => {
        try {
            res.send(await LibraryServices.update(req.params.id, req.body));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.update()");
            res.status(status).send(message);
        }
    })

    // Model Specific Endpoints (with :id) -----------------------------------

    // ***** Library-Author Relationships (One:Many) *****

    // GET /:id/authors - Find Authors by Library ID
    router.get("/:id/authors", async (req, res) => {
        try {
            res.send(await LibraryServices.authorsAll(req.params.id, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.authorAll()");
            res.status(status).send(message);
        }
    })

    // GET /:id/authors/exact/:firstName/:lastName
    //   - Find Author by Library ID and exact names
    router.get("/:id/authors/exact/:firstName/:lastName", async (req, res) => {
        try {
            res.send(await LibraryServices.authorsExact
                (req.params.id, req.params.firstName, req.params.lastName, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.authorExact()");
            res.status(status).send(message);
        }
    })


    // GET /:id/authors/name/:name - Find Authors by Library ID and name segment
    router.get("/:id/authors/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.authorsName
                    (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.authorName()");
            res.status(status).send(message);
        }
    })

    // ***** Library-Series Relationships (One:Many) *****

    // GET /:id/series - Find Series by Library ID
    router.get("/:id/series", async (req, res) => {
        try {
            res.send(await LibraryServices.seriesAll
                (req.params.id, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.seriesAll()");
            res.status(status).send(message);
        }
    })

    // GET /:id/series/exact/:name - Find Series by Library ID and exact name
    router.get("/:id/series/exact/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.seriesExact
                (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.seriesExact()");
            res.status(status).send(message);
        }
    })

    // GET /:id/series/name/:name - Find Series by Library ID and name segment
    router.get("/:id/series/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.seriesName
            (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.seriesName()");
            res.status(status).send(message);
        }
    })

    // ***** Library-Story Relationships (One:Many) *****

    // GET /:id/stories - Find Stories by Library ID
    router.get("/:id/stories", async (req, res) => {
        try {
            res.send(await LibraryServices.storiesAll
            (req.params.id, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.storiesAll()");
            res.status(status).send(message);
        }
    })

    // GET /:id/stories/exact/:name - Find Story by Library ID and exact name
    router.get("/:id/stories/exact/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.storiesExact
            (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.storiesExact()");
            res.status(status).send(message);
        }
    })

    // GET /:id/stories/name/:name - Find Stories by Library ID and name segment
    router.get("/:id/volumes/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.storiesName
            (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.volumesName()");
            res.status(status).send(message);
        }
    })

    // ***** Library-Volume Relationships (One:Many) *****

    // GET /:id/volumes - Find Volume by Library ID
    router.get("/:id/volumes", async (req, res) => {
        try {
            res.send(await LibraryServices.volumesAll
            (req.params.id, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.volumesAll()");
            res.status(status).send(message);
        }
    })

    // GET /:id/volumes/exact/:name - Find Volume by Library ID and exact name
    router.get("/:id/volumes/exact/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.volumesExact
            (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.volumesExact()");
            res.status(status).send(message);
        }
    })

    // GET /:id/volumes/name/:name - Find Volume by Library ID and name segment
    router.get("/:id/volumes/name/:name", async (req, res) => {
        try {
            res.send(await LibraryServices.volumesName
            (req.params.id, req.params.name, req.query));
        } catch (err) {
            let [status, message] = FormatErrorResponse(err, "LibraryRouters.volumesName()");
            res.status(status).send(message);
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/libraries", router);

}
