"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author;
const Library = db.Library;
const LibraryServices = require("../../src/services/LibraryServices");
const Series = db.Series;
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

// Must be seeded with valid libraryId
const seriesData0 = {
    series0Data: {
        name: "First Series",
        notes: "This is the first series"
    },
    series1Data: {
        name: "Second Series",
        notes: "This is the second series"
    },
    series2Data: {
        name: "Third Series",
        notes: "This is the third series"
    }
}

// Must be seeded with valid libraryId
const seriesData1 = {
    series0Data: {
        name: "Another First Series",
        notes: "This is the first series again"
    },
    series1Data: {
        name: "Another Second Series",
        notes: "This is the second series again"
    },
    series2Data: {
        name: "Another Third Series",
        notes: "This is the third series again"
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

// Returns array of created Series objects
const loadSeries = async (library, seriesData) => {
    let data = [
        seriesData.series0Data,
        seriesData.series1Data,
        seriesData.series2Data
    ]
    data.forEach(datum => {
        datum.libraryId = library.id
    });
    try {
        return await Series.bulkCreate(data, {
            validate: true
        });
    } catch (err) {
        console.error("loadSeries() error: ", err);
        throw err;
    }
}

// LibraryServices Tests -----------------------------------------------------

describe("LibraryServices Tests", () => {

    // Test Hooks ------------------------------------------------------------

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

            it("should find all objects with includes", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[1].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

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

            })

            it("should find some objects with pagination", async () => {

                let libraries = await loadLibraries();

                let results = await LibraryServices.all({
                    offset: 1
                });
                expect(results.length).to.equal(2);

            })

        });

        context("no objects", () => {

            it("should find no objects", async () => {

                let results = await LibraryServices.all();
                expect(results.length).to.equal(0);

            });

        });

    });

    describe("#authorAll()", () => {

        context("all objects", () => {

            it("should fail with invalid libraryId", async () => {

                let invalidId = 9999;

                try {
                    await LibraryServices.authorAll(invalidId);
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
                    let results = await LibraryServices.authorAll(libraryFirst.id);
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
                    let results = await LibraryServices.authorAll(libraryFirst.id);
                    expect(results.length).to.equal(3);
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
                    })
                    results = await LibraryServices.authorAll(librarySecond.id);
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
                    await LibraryServices.authorExact
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
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[1].dataValues;

                try {
                    let result = await LibraryServices.authorExact
                    (libraryMatch.id, authorMatch.firstName, authorMatch.lastName);
                    expect(result.id).to.equal(authorMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#authorName()", () => {

        // WARNING:  sqlite3 does not understand iLike operator so we cannot test

    });

    describe("#exact()", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                await loadLibraries();
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

                let libraries = await loadLibraries();
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

                await loadLibraries();
                let invalidId = 9999;

                try {
                    await LibraryServices.find(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Library ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries();
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

                let libraries = await loadLibraries();
                let duplicateNameLibrary = {
                    name: libraries[2].name
                }

                try {
                    await LibraryServices.insert(duplicateNameLibrary);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}`);
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
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
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

                await loadLibraries();
                let invalidId = 9999;

                try {
                    await LibraryServices.remove(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Library ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries();
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

    describe("#seriesAll()", () => {

        context("all objects", () => {

            it("should fail with invalid libraryId", async () => {

                let invalidId = 9999;

                try {
                    await LibraryServices.seriesAll
                        (invalidId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidId}`);
                }

            })

            it("should succeed for all series for library with", async () => {

                let libraries = await loadLibraries();
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadSeries(libraryFirst, seriesData0);
                await loadSeries(librarySecond, seriesData1);

                try {
                    let results = await LibraryServices.seriesAll
                        (libraryFirst.id);
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
                await loadSeries(libraryFirst, seriesData0);

                try {
                    let results = await LibraryServices.seriesAll
                        (libraryFirst.id);
                    expect(results.length).to.equal(3);
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
                    })
                    results = await LibraryServices.seriesAll(librarySecond.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

        });

    })

    describe("#seriesExact()", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[1].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let invalidName = "Foo Bar";

                try {
                    await LibraryServices.seriesExact
                        (series[0].libraryId, invalidName);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Series '${invalidName}'`);
                }

            });

            it("should succeed with valid name", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2];
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[1];

                try {
                    let result = await LibraryServices.seriesExact
                        (libraryMatch.id, seriesMatch.name);
                    expect(result.id).to.equal(seriesMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#seriesName()", () => {

        // WARNING:  sqlite3 does not understand iLike operator so we cannot test

    });

    // NOTE - individual validation errors got checked in #insert() tests
    describe("#update()", () => {

        context("invalid arguments", () => {

            it("should fail with duplicate name", async () => {

                let libraries = await loadLibraries();
                let invalidData = {
                    ...libraries[0].dataValues,
                    name: libraries[1].dataValues.name,
                }

                try {
                    await LibraryServices.update(invalidData.id, invalidData);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.name}' is already in use`);
                }

            });

            it("should fail with invalid id", async () => {

                let libraries = await loadLibraries();
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
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Library ${invalidId}`);
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with no change", async () => {

                let libraries = await loadLibraries();
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

                let libraries = await loadLibraries();
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
