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
    authorsData0, authorsData1,
    librariesData0, librariesData1,
    seriesData0, seriesData1,
    loadLibraries, loadLibrariesSeries, loadSeriesAuthors
} = require("../util/SeedData");

const {
    authorKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// SeriesServices Author Children Tests --------------------------------------

describe("SeriesServices Author Children Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach()", async () => {
        await db.sequelize.sync({
            force: true,
            truncate: true,
        })
    });


    // Test Methods ----------------------------------------------------------

    // ***** Series-Author Relationships (Many:Many) *****

    describe("#authorAdd()", () => {

        context("all objects", () => {

            it("should fail with duplicate authorId", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                    authors, authorMatch
                ] = await loadSeriesAuthors(librariesData0, 2,
                    seriesData0, 1,
                    authorsData0, 0);
                let authorMatch0 = authors[0].dataValues;
                let authorMatch1 = authors[0].dataValues; // Duplicate

                try {
                    await SeriesServices.authorAdd
                        (seriesMatch.id, authorMatch0.id);
                    await SeriesServices.authorAdd
                        (seriesMatch.id, authorMatch1.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`)
                    }
                    expect(err.message)
                        .includes(`authorId: Author ${authorMatch1.id} is already ` +
                            `associated with Series ${seriesMatch.id}`);
                }

            });

            it("should fail with invalid authorId", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                ] = await loadLibrariesSeries(librariesData0, 1,
                    seriesData0, 2);
                let invalidAuthorId = 9999;

                try {
                    await SeriesServices.authorAdd
                        (seriesMatch.id, invalidAuthorId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (err instanceof NotFound) {
                        expect(err.message)
                            .includes(`authorId: Missing Author ${invalidAuthorId}`);
                    } else {
                        expect.fail(`Should not have thrown '${err.message}'`);
                    }
                }

            });

            it("should fail with invalid seriesId", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                    authors, authorMatch
                ] = await loadSeriesAuthors(librariesData0, 2,
                    seriesData0, 1,
                    authorsData0, 0);
                let invalidSeriesId = 9999;

                try {
                    await SeriesServices.authorAdd
                       (invalidSeriesId, authorMatch.id);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect (err.message)
                        .includes(`seriesId: Missing Series ${invalidSeriesId}`);
                }

            });

            it("should fail with mismatched libraryId", async () => {

                let [
                    libraries0, libraryMatch0,
                    series0, seriesMatch0,
                    authors0, authorMatch0,
                ] = await loadSeriesAuthors(librariesData0, 0,
                    seriesData0, 1,
                    authorsData0, 2);
                let [
                    libraries1, libraryMatch1,
                    series1, seriesMatch1,
                    authors1, authorMatch1,
                ] = await loadSeriesAuthors(librariesData1, 2,
                    seriesData1, 1,
                    authorsData1, 0);

                try {
                    await SeriesServices.authorAdd
                        (seriesMatch0.id, authorMatch1.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Series ${seriesMatch0.id} belongs to ` +
                            `Library ${seriesMatch0.libraryId} but Author ${authorMatch1.id} ` +
                            `belongs to Library ${authorMatch1.libraryId}`);
                }

            });

            it("should succeed with one author", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                    authors, authorMatch
                ] = await loadSeriesAuthors(librariesData0, 0,
                    seriesData0, 2,
                    authorsData0, 1);

                try {
                    await SeriesServices.authorAdd
                        (seriesMatch.id, authorMatch.id);
                    let updated = await SeriesServices.find(seriesMatch.id, {
                        withAuthors: ""
                    });
                    if (!updated.authors) {
                        expect.fail("Should have included authors children");
                    }
                    expect(updated.authors.length).to.equal(1);
                    expect(updated.authors[0].id).to.equal(authorMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with two authors", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                    authors, authorMatch
                ] = await loadSeriesAuthors(librariesData0, 1,
                    seriesData0, 0,
                    authorsData0, 1);
                let authorMatch0 = authors[0].dataValues;
                let authorMatch1 = authors[1].dataValues;

                try {
                    await SeriesServices.authorAdd
                        (seriesMatch.id, authorMatch0.id);
                    await SeriesServices.authorAdd
                        (seriesMatch.id, authorMatch1.id);
                    let updated = await SeriesServices.find(seriesMatch.id, {
                        withAuthors: ""
                    });
                    if (!updated.authors) {
                        expect.fail("Should have included authors children");
                    }
                    expect(updated.authors.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#authorAll()", () => {

        context("all objects", () => {

            it("should succeed finding all objects", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                    authors, authorMatch
                ] = await loadSeriesAuthors(librariesData0, 1,
                    seriesData0, 2,
                    authorsData0, 0);
                await SeriesServices.authorAdd(seriesMatch.id, authors[0].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[1].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[2].id);

                try {
                    let results = await SeriesServices.authorAll(seriesMatch.id);
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

            });

        });

        context("no objects", () => {

            it("should succeed finding no objects", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                ] = await loadSeriesAuthors(librariesData0, 1,
                    seriesData0, 2,
                    authorsData0, 0);
                try {
                    let results = await SeriesServices.authorAll(seriesMatch.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#authorExact()", () => {

        context("all objects", () => {

            it("should find all matches", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                    authors, authorMatch
                ] = await loadSeriesAuthors(librariesData0, 2,
                    seriesData0, 2,
                    authorsData0, 2);
                await SeriesServices.authorAdd(seriesMatch.id, authors[0].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[1].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[2].id);

                try {
                    let result = await SeriesServices.authorExact
                        (seriesMatch.id, authorMatch.firstName, authorMatch.lastName);
                    expect(result.id).to.equal(authorMatch.id);
                    expect(result.firstName).to.equal(authorMatch.firstName);
                    expect(result.lastName).to.equal(authorMatch.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it ("should find no mismatches", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                    authors, authorMatch
                ] = await loadSeriesAuthors(librariesData0, 1,
                    seriesData0, 1,
                    authorsData0, 1);
                await SeriesServices.authorAdd(seriesMatch.id, authors[0].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[1].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[2].id);
                let firstNameMismatch = authors[2].firstName + " Updated";
                let lastNameMismatch = authors[2].lastName + " Updated";

                try {
                    await SeriesServices.authorExact
                        (seriesMatch.id, firstNameMismatch, lastNameMismatch);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Author '${firstNameMismatch} ${lastNameMismatch}'`);
                }

            });

        });

    })

    // Warning - SQLITE3 does not like the iLike operator
    describe("#authorName()", () => {

    });

    describe("#authorRemove()", () => {

        context("all objects", () => {

            // TODO - check case for valid authorId that is not associated

            it("should fail on invalid id", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                    authors, authorMatch
                ] = await loadSeriesAuthors(librariesData0, 2,
                    seriesData0, 2,
                    authorsData0, 2);
                await SeriesServices.authorAdd(seriesMatch.id, authors[0].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[1].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[2].id);
                let invalidId = 9999;

                try {
                    await SeriesServices.authorRemove(seriesMatch.id, invalidId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`authorId: Missing Author ${invalidId}`);
                }


            });

            it("should succeed on valid id", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                    authors, authorMatch
                ] = await loadSeriesAuthors(librariesData0, 0,
                    seriesData0, 0,
                    authorsData0, 0);
                await SeriesServices.authorAdd(seriesMatch.id, authors[0].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[1].id);
                await SeriesServices.authorAdd(seriesMatch.id, authors[2].id);
                let validId = authors[0].id;

                try {
                    await SeriesServices.authorRemove(seriesMatch.id, validId);
                    let after = await SeriesServices.authorAll(seriesMatch.id);
                    expect(after.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }
            });

        });

    });

});
