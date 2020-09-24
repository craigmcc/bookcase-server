"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author;
const Library = db.Library;
const Series = db.Series;
const SeriesServices = require("../../src/services/SeriesServices");

const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

const {
    authorsData0, authorsData1, loadAuthors,
    librariesData0, librariesData1, loadLibraries,
    seriesData0, seriesData1, loadSeries,
} = require("../util/SeedData");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// SeriesServices Tests ------------------------------------------------------

describe("SeriesServices Tests", () => {

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

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                await loadSeries(libraryMatch, seriesData0);

                let results = await SeriesServices.all();
                expect(results.length).to.equal(3);

            })

            it("should find all objects with includes", async () => {

                let libraries = await loadLibraries(librariesData0);
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

                let libraries = await loadLibraries(librariesData0);
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

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let invalidId = 9999;

                try {
                    await SeriesServices.find(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`seriesId: Missing Series ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries(librariesData0);
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

            it("should succeed with valid id and nested authors", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[1].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch0 = authors[0].dataValues;
                let authorMatch1 = authors[1].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;

                try {
                    await SeriesServices.authorAdd(seriesMatch.id, authorMatch0.id);
                    await SeriesServices.authorAdd(seriesMatch.id, authorMatch1.id);
                    let result = await SeriesServices.find(seriesMatch.id, {
                        withAuthors: ""
                    });
                    expect(result.name).to.equal(seriesMatch.name);
                    if (result.authors) {
                        expect(result.authors.length).to.equal(2);
                    } else {
                        expect.fail("Should have included authors");
                    }
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

                let libraries = await loadLibraries(librariesData0);
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

                let libraries = await loadLibraries(librariesData0);
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

                let libraries = await loadLibraries(librariesData0);
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
                        .includes(`seriesId: Missing Series ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let libraries = await loadLibraries(librariesData0);
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

    // NOTE - individual validation errors got checked in #insert() tests
    describe("#update()", () => {

        context("invalid arguments", () => {

            it("should fail with duplicate name", async () => {

                let libraries = await loadLibraries(librariesData0);
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

                let libraries = await loadLibraries(librariesData0);
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
                        .includes(`seriesId: Missing Series ${invalidId}`);
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with no change", async () => {

                let libraries = await loadLibraries(librariesData0);
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

                let libraries = await loadLibraries(librariesData0);
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
