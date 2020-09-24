"use strict"

// Internal Modules ----------------------------------------------------------

const DevModeServices = require("../services/DevModeServices");
const LibraryServices = require("../services/LibraryServices");

// External Modules ----------------------------------------------------------

const csv = require("csvtojson");
const router = require("express").Router();

// Public Objects ------------------------------------------------------------

module.exports = (app) => {

    // Public Routes ---------------------------------------------------------

    // NOTE:  Trying to embed csvtojson stuff in service module causes grief
    //        when the results are returned immediately rather than after
    //        all the processing is complete.  Therefore, do that part here.
    router.post("/import", async (req, res) => {

        let [ library, createdLibrary ] = await acquireLibrary();
        let results = {
            countAuthors: 0,
            countAuthorsSeries: 0,
            countAuthorsVolumes: 0,
            countRows: 0,
            countSeries: 0,
            countSeriesAuthors: 0,
            countSeriesVolumes: 0,
            countVolumes: 0,
        };

        try {

            csv({
                noHeader: false,
                headers: [
                    "lastName",
                    "firstName",
                    "name",
                    "year",
                    "box",
                    "read",
                    "seriesName",
                    "seriesOrdinal",
                    "notes"
                ]
            })
                .fromString(req.body)
                .subscribe(async (row) => {
                    await DevModeServices.process(library, row, results);
                })
                .on("done", (err) => {
                    if (err) {
                        throw err;
                    }
                    res.status(200).send(results);
                })

        } catch(err) {
            console.error("DevModeRouters.import() error: ", err);
            res.status(500).send(err.message);
        }

    })

    // POST /resync - Resynchronize database metadata and reload dev library
    router.post("/resync", async (req, res) => {
        try {
            res.send(await DevModeServices.resync());
        } catch (err) {
            console.error("DevModeRouters.resync() error: ", err);
            res.status(500).send(err.message);
        }
    });

    // Export Routes ---------------------------------------------------------

    app.use("/api/devmode", router);

}

// Private Methods -----------------------------------------------------------

const acquireLibrary = async () => {
    const LIBRARY_NAME = "Craig McClanahan";
    let created = false;
    let library = { };
    try {
        library = await LibraryServices.exact(LIBRARY_NAME);
    } catch (err) {
        library = await LibraryServices.insert({
            name: LIBRARY_NAME,
            notes: `Personal Library for ${LIBRARY_NAME}`
        });
        created = true;
    }
    return [ library, created ];
}

