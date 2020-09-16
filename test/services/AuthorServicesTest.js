"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author;
const AuthorServices = require("../../src/services/AuthorServices");
const Library = db.Library;
const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// Test Data -----------------------------------------------------------------

// Must be seeded with valid libraryId
const authorsData0 = {
    author0Data: {
        firstName: "Barney",
        lastName: "Rubble",
        notes: "Barney Author"
    },
    author1Data: {
        firstName: "Betty",
        lastName: "Rubble",
        notes: "Betty Author"
    },
    author2Data: {
        firstName: "Bam Bam",
        lastName: "Rubble",
        notes: "Bam Bam Author"
    }
}

// Must be seeded with valid libraryId
const authorsData1 = {
    author0Data: {
        firstName: "Fred",
        lastName: "Flintstone",
        notes: "Fred Author"
    },
    author1Data: {
        firstName: "Wilma",
        lastName: "Flintstone",
        notes: "Wilma Author"
    },
    author2Data: {
        firstName: "Pebbles",
        lastName: "Flintstone",
        notes: "Pebbles Author"
    }
}

const librariesData = {
    library0Data: {
        name: "First Library",
        notes: "Special Notes about First Library"
    },
    library1Data: {
        name: "Second Library",
        notes: "Other Notes about Second Library"
    },
    library2Data: {
        name: "Third Library"
    }
}

// Returns array of created Author objects
const loadAuthors = async (library, authorsData) => {
    let data = [
        authorsData.author0Data,
        authorsData.author1Data,
        authorsData.author2Data
    ]
    data.forEach(datum => {
        datum.libraryId = library.id
    });
    try {
        return await Author.bulkCreate(data, {
            validate: true
        });
    } catch (err) {
        console.error("loadAuthors() error: ", err);
        throw err;
    }
}

// Returns array of created Library objects
const loadLibraries = async () => {
    let data = [
        librariesData.library0Data,
        librariesData.library1Data,
        librariesData.library2Data
    ]
    try {
        return await Library.bulkCreate(data, {
            validate: true
        });
    } catch (err) {
        console.error("loadLibraries() error: ", err);
        throw err;
    }
}

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

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                let results = await AuthorServices.all();
                expect(results.length).to.equal(3);

            })

        });

        context("no objects", () => {

            it("should find no objects", async () => {

                let results = await AuthorServices.all();
                expect(results.length).to.equal(0);

            });

        });

    });

    describe("#authorAll()", () => {

        context("all objects", () => {

            it("should fail with invalid libraryId", async () => {

                let invalidId = 9999;

                try {
                    await AuthorServices.authorAll(invalidId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidId}`);
                }

            })

            it("should succeed for all authors for library with", async () => {

                let libraries = await loadLibraries();
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadAuthors(libraryFirst, authorsData0);
                await loadAuthors(librarySecond, authorsData1);

                try {
                    let complete = await AuthorServices.all();
                    expect(complete.length).to.equal(6);
                    let results = await AuthorServices.authorAll(libraryFirst.id);
                    expect(results.length).to.equal(3);
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
                    })
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should succeed for no authors for library without", async () => {

                let libraries = await loadLibraries();
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadAuthors(libraryFirst, authorsData0);

                try {
                    let complete = await AuthorServices.all();
                    expect(complete.length).to.equal(3);
                    let results = await AuthorServices.authorAll(libraryFirst.id);
                    expect(results.length).to.equal(3);
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
                    })
                    results = await AuthorServices.authorAll(librarySecond.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

        });

    })

    describe("#authorExact()", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                let libraries = await loadLibraries();
                let authors = await loadAuthors(libraries[1], authorsData0);
                let invalidFirstName = "Foo Bar";
                let invalidLastName = "Baz Bop";

                try {
                    await AuthorServices.authorExact
                        (authors[0].libraryId, invalidFirstName, invalidLastName);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Author '${invalidFirstName} ${invalidLastName}'`);
                }

            });

            it("should succeed with valid name", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2];
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[1];

                try {
                    let result = await AuthorServices.authorExact
                        (libraryMatch.id, authorMatch.firstName, authorMatch.lastName);
                    expect(result.id).to.equal(authorMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#authorName()", () => {

        // WARNING:  sqlite3 does not understand ilike operator so we cannot test

    });

    describe("#find()", () => {

        context("all objects", () => {

            it("should fail with invalid id", async () => {

                let libraries = await loadLibraries();
                let authors = await loadAuthors(libraries[0], authorsData0);
                let invalidId = 9999;

                try {
                    await AuthorServices.find(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Author ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[1];
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[2];

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

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2];
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
                        expect.fail(`Should have thrown BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${duplicateNameAuthor.firstName} ${duplicateNameAuthor.lastName}' ` +
                            "is already in use within this Library");
                }

            });

            it("should fail with invalid libraryId", async () => {

                let invalidAuthor = {
                    ...authorsData0.author0Data,
                    libraryId: 9999
                }

                try {
                    await AuthorServices.insert(invalidAuthor);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidAuthor.libraryId}`);
                }

            });

            it("should fail with missing firstName", async () => {

                let libraries = await loadLibraries();
                let invalidAuthor = {
                    ...authorsData0.author1Data,
                    firstName: null,
                    libraryId: libraries[0].id
                }

                try {
                    await AuthorServices.insert(invalidAuthor);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("author.firstName cannot be null");
                }

            });

            it("should fail with missing lastName", async () => {

                let libraries = await loadLibraries();
                let invalidAuthor = {
                    ...authorsData0.author2Data,
                    lastName: null,
                    libraryId: libraries[1].id
                }

                try {
                    await AuthorServices.insert(invalidAuthor);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("author.lastName cannot be null");
                }

            });

            it("should fail with missing libraryId", async () => {

                let libraries = await loadLibraries();
                let invalidAuthor = {
                    ...authorsData0.author0Data,
                    libraryId: null
                }

                try {
                    await AuthorServices.insert(invalidAuthor);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("author.libraryId cannot be null");
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with valid arguments", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2];
                let validAuthor = {
                    ...authorsData0.author2Data,
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
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Author ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[1];
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0];

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

                let libraries = await loadLibraries();
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
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.firstName} ${invalidData.lastName}' ` +
                            "is already in use within this Library");
                }

            });

            it("should fail with invalid id", async () => {

                let libraries = await loadLibraries();
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
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Author ${invalidId}`);
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with no change", async () => {

                let libraries = await loadLibraries();
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

                let libraries = await loadLibraries();
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
