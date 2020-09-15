"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Library = db.Library;
const LibraryServices = require("../../src/services/LibraryServices");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// Test Data -----------------------------------------------------------------

const libraryData = {
    library0Data: {
        name: "First Library",
        notes: "Notes about First Library"
    },
    library1Data: {
        name: "Second Library",
        notes: "Notes about Second Library"
    },
    library2Data: {
        name: "Third Library"
    }
}

let libraries = [];

const loadLibraries = async () => {
    let data = [
        libraryData.library0Data,
        libraryData.library1Data,
        libraryData.library2Data
    ]
    libraries = await Library.bulkCreate(data, {
        validate: true
    });


}

// LibraryServices Tests -----------------------------------------------------

describe("LibraryServices Tests", () => {

    before("#init", async () => {
        await Library.sync({
            force: true
        });
    });

    beforeEach("#erase", async () => {
        await Library.destroy({
            cascade: true,
            truncate: true
        });
    });

    // Test Methods ----------------------------------------------------------

    describe("#all()", () => {

        context("all objects", () => {

            it("should find all objects", async () => {

                await loadLibraries();

                let results = await LibraryServices.all();
                expect(results.length).to.equal(3);

            })

        });

        context("no objects", () => {

            it("should find no objects", async () => {

                let results = await LibraryServices.all();
                expect(results.length).to.equal(0);

            });

        });

    });

});
