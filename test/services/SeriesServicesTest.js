"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author;
const Library = db.Library;
const Series = db.Series;
const SeriesServices = require("../../src/services/SeriesServices");
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
        notes: "Barney Series"
    },
    author1Data: {
        firstName: "Betty",
        lastName: "Rubble",
        notes: "Betty Series"
    },
    author2Data: {
        firstName: "Bam Bam",
        lastName: "Rubble",
        notes: "Bam Bam Series"
    }
}

// Must be seeded with valid libraryId
const authorsData1 = {
    author0Data: {
        firstName: "Fred",
        lastName: "Flintstone",
        notes: "Fred Series"
    },
    author1Data: {
        firstName: "Wilma",
        lastName: "Flintstone",
        notes: "Wilma Series"
    },
    author2Data: {
        firstName: "Pebbles",
        lastName: "Flintstone",
        notes: "Pebbles Series"
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

const seriesData1 = {
    series0Data: {
        name: "Another First Series",
        notes: "This is the first series"
    },
    series1Data: {
        name: "Another Second Series",
        notes: "This is the second series"
    },
    series2Data: {
        name: "Another Third Series",
        notes: "This is the third series"
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

// SeriesServices Tests ------------------------------------------------------

describe("SeriesServices Tests", () => {

    // Test Hooks ------------------------------------------------------------

    before("#init", async () => {
        await Author.sync({
            force: true
        });
        await Library.sync({
            force: true
        });
        await Series.sync({
            force: true
        });
    });

    beforeEach("#erase", async () => {
        await Author.destroy({
            cascade: true,
            truncate: true
        });
        await Series.destroy({
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
                await loadSeries(libraryMatch, seriesData0);

                let results = await SeriesServices.all();
                expect(results.length).to.equal(3);

            })

            it("should find all objects with includes", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[1].dataValues;
                await loadSeries(libraryMatch, seriesData0);

                let results = await SeriesServices.all({
                    withLibrary: ""
                });
                expect(results.length).to.equal(3);
                results.forEach(series => {
                    if (series.library) {
                        expect(series.library.id).to.equal(libraryMatch.id);
                    } else {
                        expect.fail("Should have included library");
                    }
                })

            })

            it("should find some objects with pagination", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;
                await loadSeries(libraryMatch, seriesData0);

                let results = await SeriesServices.all({
                    offset: 1
                });
                expect(results.length).to.equal(2);

            })

        });

        context("no objects", () => {

            it("should find no objects", async () => {

                let results = await SeriesServices.all();
                expect(results.length).to.equal(0);

            });

        });

    });

    describe("#find()", () => {

        context("all objects", () => {

            it("should fail with invalid id", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let invalidId = 9999;

                try {
                    await SeriesServices.find(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Series ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[1].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;

                try {
                    let result = await SeriesServices.find(seriesMatch.id);
                    expect(result.name).to.equal(seriesMatch.name);
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
                let libraryMatch = libraries[2].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[0].dataValues;
                let seriesDup = series[1].dataValues;
                let duplicateNameSeries = {
                    ...seriesMatch,
                    name: seriesDup.name,
                }

                try {
                    await SeriesServices.insert(duplicateNameSeries);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${duplicateNameSeries.name}' ` +
                            "is already in use within this Library");
                }

            });

            it("should fail with invalid libraryId", async () => {

                let invalidSeries = {
                    ...seriesData0.series0Data,
                    libraryId: 9999
                }

                try {
                    await SeriesServices.insert(invalidSeries);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidSeries.libraryId}`);
                }

            });

            it("should fail with missing name", async () => {

                let libraries = await loadLibraries();
                let invalidSeries = {
                    ...seriesData0.series1Data,
                    name: null,
                    libraryId: libraries[0].id
                }

                try {
                    await SeriesServices.insert(invalidSeries);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("name: Is required");
                }

            });

            it("should fail with missing libraryId", async () => {

                let libraries = await loadLibraries();
                let invalidSeries = {
                    ...seriesData0.series0Data,
                    libraryId: null
                }

                try {
                    await SeriesServices.insert(invalidSeries);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("libraryId: Is required");
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with valid arguments", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2].dataValues;
                let validSeries = {
                    ...seriesData0.series2Data,
                    libraryId: libraryMatch.id,
                    name: "Brand New Series",
                }

                try {
                    let result = await SeriesServices.insert(validSeries);
                    expect(result.name).to.equal(validSeries.name);
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
                    await SeriesServices.remove(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Series ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[1].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[0].dataValues;

                try {
                    let result = await SeriesServices.remove(seriesMatch.id);
                    expect(result.name).to.equal(seriesMatch.name);
                    let count = await Series.count({});
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
                    await SeriesServices.seriesAll(invalidId);
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
                    let complete = await SeriesServices.all();
                    expect(complete.length).to.equal(6);
                    let results = await SeriesServices.seriesAll(libraryFirst.id);
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
                    let complete = await SeriesServices.all();
                    expect(complete.length).to.equal(3);
                    let results = await SeriesServices.seriesAll(libraryFirst.id);
                    expect(results.length).to.equal(3);
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
                    })
                    results = await SeriesServices.seriesAll(librarySecond.id);
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
                    await SeriesServices.seriesExact
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
                    let result = await SeriesServices.seriesExact
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
                let libraryMatch = libraries[1].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[0].dataValues;
                let seriesDup = series[1].dataValues;
                let invalidData = {
                    ...seriesMatch,
                    name: seriesDup.name,
                }

                try {
                    await SeriesServices.update(invalidData.id, invalidData);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.name}' ` +
                            "is already in use within this Library");
                }

            });

            it("should fail with invalid id", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let invalidId = 9999;
                let invalidData = {
                    ...seriesMatch,
                    id: invalidId
                }

                try {
                    await SeriesServices.update(invalidId, invalidData);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`id: Missing Series ${invalidId}`);
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with no change", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[1].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[1].dataValues;
                let validData = {
                    ...seriesMatch
                }
                let validId = validData.id;

                try {
                    let result = await SeriesServices.update(validId, validData);
                    expect(result.id).to.equal(validData.id);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with other field change", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let validData = {
                    ...seriesMatch,
                    notes: "Brand New Notes"
                }
                let validId = validData.id;

                try {
                    let result = await SeriesServices.update(validId, validData);
                    expect(result.id).to.equal(validData.id);
                    expect(result.name).to.equal(validData.name);
                    expect(result.notes).to.equal(validData.notes);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

});
