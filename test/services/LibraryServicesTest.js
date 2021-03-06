"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author;
const Library = db.Library;
const LibraryServices = require("../../src/services/LibraryServices");
const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

const {
    authorsData0, authorsData1, loadAuthors,
    librariesData0, librariesData1, loadLibraries,
} = require("../util/SeedData");

const {
    libraryKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// LibraryServices Tests -----------------------------------------------------

describe("LibraryServices Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach()", async () => {
        await db.sequelize.sync({
            force: true,
            truncate: true,
        })
    });


    // Test Methods ----------------------------------------------------------

    describe("#all()", () => {

        context("all objects", () => {

            it("should find all objects", async () => {

                await loadLibraries(librariesData0);

                try {
                    let results = await LibraryServices.all();
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = libraryKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                        }
                        previousKey = currentKey;
                    })
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should find all objects with includes", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[1].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {
                    let results = await LibraryServices.all({
                        withAuthors: ""
                    });
                    expect(results.length).to.equal(3);
                    results.forEach(library => {
                        if (library.authors) {
                            if (library.id === libraryMatch.id) {
                                expect(library.authors.length).to.equal(3);
                            } else {
                                expect(library.authors.length).to.equal(0);
                            }
                        } else {
                            expect.fail("Should have included authors");
                        }
                    })
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should find some objects with pagination", async () => {

                let libraries = await loadLibraries(librariesData0);

                try {
                    let results = await LibraryServices.all({
                        offset: 1
                    });
                    expect(results.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

        });

        context("no objects", () => {

            it("should find no objects", async () => {

                try {
                    let results = await LibraryServices.all();
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#exact()", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                await loadLibraries(librariesData0);
                let invalidName = "Foo Bar";

                try {
                    await LibraryServices.exact(invalidName);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Library '${invalidName}'`);
                }

            });

            it("should succeed with valid name", async () => {

                let libraries = await loadLibraries(librariesData0);
                let match = libraries[1];

                try {
                    let result = await LibraryServices.exact(match.name);
                    expect(result.id).to.equal(match.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#find()", () => {

        context("all objects", () => {

            it("should fail with invalid id", async () => {

                await loadLibraries(librariesData0);
                let invalidId = 9999;

                try {
                    await LibraryServices.find(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let match = libraries[1];

                try {
                    let result = await LibraryServices.find(match.id);
                    expect(result.name).to.equal(match.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#insert()", () => {

        context("invalid arguments", () => {

            it("should fail with duplicate name", async () => {

                let libraries = await loadLibraries(librariesData0);
                let duplicateNameLibrary = {
                    name: libraries[2].name
                }

                try {
                    await LibraryServices.insert(duplicateNameLibrary);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${duplicateNameLibrary.name}' is already in use`);
                }

            });

            it("should fail with missing name", async () => {

                let invalidLibrary = {
                }

                try {
                    await LibraryServices.insert(invalidLibrary);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("name: Is required");
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with valid arguments", async () => {

                let validLibrary = {
                    name: "New Library"
                }

                try {
                    let result = await LibraryServices.insert(validLibrary);
                    expect(result.name).to.equal(validLibrary.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#name()", () => {

        // WARNING:  sqlite3 does not understand ilike operator so we cannot test

    });

    describe("#remove()", () => {

        context("all objects", () => {

            it("should fail with invalid id", async () => {

                await loadLibraries(librariesData0);
                let invalidId = 9999;

                try {
                    await LibraryServices.remove(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let match = libraries[1];

                try {
                    let result = await LibraryServices.remove(match.id);
                    expect(result.name).to.equal(match.name);
                    let count = await Library.count({});
                    expect(count).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    // NOTE - individual validation errors got checked in #insert() tests
    describe("#update()", () => {

        context("invalid arguments", () => {

            it("should fail with duplicate name", async () => {

                let libraries = await loadLibraries(librariesData0);
                let invalidData = {
                    ...libraries[0].dataValues,
                    name: libraries[1].dataValues.name,
                }

                try {
                    await LibraryServices.update(invalidData.id, invalidData);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.name}' is already in use`);
                }

            });

            it("should fail with invalid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let invalidData = {
                    ...libraries[0].dataValues,
                    notes: "Updated notes for invalid id change",
                }
                let invalidId = 9999;

                try {
                    await LibraryServices.update(invalidId, invalidData);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidId}`);
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with no change", async () => {

                let libraries = await loadLibraries(librariesData0);
                let validData = {
                    ...libraries[2].dataValues
                }
                let validId = validData.id;

                try {
                    let result = await LibraryServices.update(validId, validData);
                    expect(result.id).to.equal(validData.id);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with other field change", async () => {

                let libraries = await loadLibraries(librariesData0);
                let validData = {
                    ...libraries[2].dataValues,
                    name: "Brand New Name"
                }
                let validId = validData.id;

                try {
                    let result = await LibraryServices.update(validId, validData);
                    expect(result.id).to.equal(validData.id);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

});
