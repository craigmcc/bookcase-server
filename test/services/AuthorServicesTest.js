"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author;
const AuthorServices = require("../../src/services/AuthorServices");
const Library = db.Library;
const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

const {
    authorsData0, authorsData1, loadAuthors,
    librariesData0, librariesData1, loadLibraries
} = require("../util/SeedData");

const {
    authorKey, libraryKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// AuthorServices Tests ------------------------------------------------------

describe("AuthorServices Tests", () => {

    // Test Hooks ------------------------------------------------------------

    before("#init", async () => {
        await Library.sync({
            force: true
        });
        await Author.sync({
            force: true
        });
    });

    beforeEach("#erase", async () => {
        await Author.destroy({
            cascade: true,
            truncate: true
        });
        await Library.destroy({
            cascade: true,
            truncate: true
        })
    });

    // Test Methods ----------------------------------------------------------

    describe("#all()", () => {

        context("all objects", () => {

            it("should find all objects", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {
                    let results = await AuthorServices.all();
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = authorKey(result);
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
                    let results = await AuthorServices.all({
                        withLibrary: ""
                    });
                    expect(results.length).to.equal(3);
                    results.forEach(author => {
                        if (author.library) {
                            expect(author.library.id).to.equal(libraryMatch.id);
                        } else {
                            expect.fail("Should have included library");
                        }
                    })
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should find some objects with pagination", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {
                    let results = await AuthorServices.all({
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
                    let results = await AuthorServices.all();
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#find()", () => {

        context("all objects", () => {

            it("should fail with invalid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let authors = await loadAuthors(libraries[0], authorsData0);
                let invalidId = 9999;

                try {
                    await AuthorServices.find(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Author ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[1].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[2].dataValues;

                try {
                    let result = await AuthorServices.find(authorMatch.id);
                    expect(result.name).to.equal(authorMatch.name);
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
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let duplicateNameAuthor = {
                    ...authors[0].dataValues,
                    firstName: authors[1].firstName,
                    lastName: authors[1].lastName
                }

                try {
                    await AuthorServices.insert(duplicateNameAuthor);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${duplicateNameAuthor.firstName} ${duplicateNameAuthor.lastName}' ` +
                            "is already in use within this Library");
                }

            });

            it("should fail with invalid libraryId", async () => {

                let invalidAuthor = {
                    ...authorsData0[0],
                    libraryId: 9999
                }

                try {
                    await AuthorServices.insert(invalidAuthor);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidAuthor.libraryId}`);
                }

            });

            it("should fail with missing firstName", async () => {

                let libraries = await loadLibraries(librariesData0);
                let invalidAuthor = {
                    ...authorsData0[1],
                    firstName: null,
                    libraryId: libraries[0].id
                }

                try {
                    await AuthorServices.insert(invalidAuthor);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("firstName: Is required");
                }

            });

            it("should fail with missing lastName", async () => {

                let libraries = await loadLibraries(librariesData0);
                let invalidAuthor = {
                    ...authorsData0[2],
                    lastName: null,
                    libraryId: libraries[1].id
                }

                try {
                    await AuthorServices.insert(invalidAuthor);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("lastName: Is required");
                }

            });

            it("should fail with missing libraryId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let invalidAuthor = {
                    ...authorsData0[0],
                    libraryId: null
                }

                try {
                    await AuthorServices.insert(invalidAuthor);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("libraryId: Is required");
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with valid arguments", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let validAuthor = {
                    ...authorsData0[2],
                    firstName: "Sister",
                    libraryId: libraryMatch.id
                }

                try {
                    let result = await AuthorServices.insert(validAuthor);
                    expect(result.firstName).to.equal(validAuthor.firstName);
                    expect(result.lastName).to.equal(validAuthor.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#remove()", () => {

        context("all objects", () => {

            it("should fail with invalid id", async () => {

                let invalidId = 9999;

                try {
                    await AuthorServices.remove(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Author ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[1].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;

                try {
                    let result = await AuthorServices.remove(authorMatch.id);
                    expect(result.firstName).to.equal(authorMatch.firstName);
                    expect(result.lastName).to.equal(authorMatch.lastName);
                    let count = await Author.count({});
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
                let libraryMatch = libraries[1].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let invalidData = {
                    ...authors[0].dataValues,
                    firstName: authors[1].dataValues.firstName,
                    lastName: authors[1].dataValues.lastName
                }

                try {
                    await AuthorServices.update(invalidData.id, invalidData);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.firstName} ${invalidData.lastName}' ` +
                            "is already in use within this Library");
                }

            });

            it("should fail with invalid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let invalidId = 9999;
                let invalidData = {
                    ...authors[2].dataValues,
                    id: invalidId
                }

                try {
                    await AuthorServices.update(invalidId, invalidData);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Author ${invalidId}`);
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with no change", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[1].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let validData = {
                    ...authors[1].dataValues
                }
                let validId = validData.id;

                try {
                    let result = await AuthorServices.update(validId, validData);
                    expect(result.id).to.equal(validData.id);
                    expect(result.firstName).to.equal(validData.firstName);
                    expect(result.lastName).to.equal(validData.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with other field change", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let validData = {
                    ...authors[2].dataValues,
                    notes: "Brand New Notes"
                }
                let validId = validData.id;

                try {
                    let result = await AuthorServices.update(validId, validData);
                    expect(result.id).to.equal(validData.id);
                    expect(result.firstName).to.equal(validData.firstName);
                    expect(result.lastName).to.equal(validData.lastName);
                    expect(result.notes).to.equal(validData.notes);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

});
