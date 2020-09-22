"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author
const AuthorServices = require("../../src/services/AuthorServices");
const Library = db.Library;
const Series = db.Series;
const Story = db.Story;
const Volume = db.Volume;

const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

const {
    authorsData0, authorsData1, loadAuthors,
    librariesData0, librariesData1, loadLibraries,
    seriesData0, seriesData1, loadSeries,
    storiesData0, storiesData1, loadStories,
    volumesData0, volumesData1, loadVolumes
} = require("../util/SeedData");

const {
    authorKey, libraryKey, seriesKey, storyKey, volumeKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// AuthorServices Children Tests ---------------------------------------------

describe("AuthorServices Children Tests", () => {

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

    // ***** Author-Series Relationships (Many:Many) *****

    describe("#seriesAdd()", () => {

        context("all objects", () => {

            it("should fail with duplicate seriesId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch0 = series[1].dataValues;
                let seriesMatch1 = series[1].dataValues; // Duplicate

                try {
                    let result0 = await AuthorServices.seriesAdd
                        (authorMatch.id, seriesMatch0.id);
                    let result1 = await AuthorServices.seriesAdd
                        (authorMatch.id, seriesMatch1.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`)
                    }
                    expect(err.message)
                        .includes(`seriesId: Series ${seriesMatch1.id} is already ` +
                            `associated with Author ${authorMatch.id}`);
                }

            });

            it("should fail with invalid authorId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[1].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let invalidAuthorId = 9999;

                try {
                    await AuthorServices.seriesAdd
                    (invalidAuthorId, seriesMatch.id);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`authorId: Missing Author ${invalidAuthorId}`);
                }

            });

            it("should fail with invalid seriesId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let invalidSeriesId = 9999;

                try {
                    await AuthorServices.seriesAdd
                        (authorMatch.id, invalidSeriesId);
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

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch0 = libraries[0].dataValues;
                let libraryMatch1 = libraries[1].dataValues;
                let authors = await loadAuthors(libraryMatch1, authorsData1);
                let authorMatch = authors[1].dataValues;
                let series = await loadSeries(libraryMatch0, seriesData0);
                let seriesMatch = series[2].dataValues;

                try {
                    await AuthorServices.seriesAdd
                        (authorMatch.id, seriesMatch.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Author ${authorMatch.id} belongs to ` +
                            `Library ${authorMatch.libraryId} but Series ${seriesMatch.id} ` +
                            `belongs to Library ${seriesMatch.libraryId}`);
                }

            });

            it("should succeed with one series", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[1].dataValues;

                try {
                    await AuthorServices.seriesAdd
                        (authorMatch.id, seriesMatch.id);
                    let updated = await AuthorServices.find(authorMatch.id, {
                        withSeries: ""
                    });
                    if (!updated.series) {
                        expect.fail("Should have included series children");
                    }
                    expect(updated.series.length).to.equal(1);
                    expect(updated.series[0].id).to.equal(seriesMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with two series", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch0 = series[1].dataValues;
                let seriesMatch1 = series[2].dataValues;

                try {
                    await AuthorServices.seriesAdd
                        (authorMatch.id, seriesMatch0.id);
                    await AuthorServices.seriesAdd
                        (authorMatch.id, seriesMatch1.id);
                    let updated = await AuthorServices.find(authorMatch.id, {
                        withSeries: ""
                    });
                    if (!updated.series) {
                        expect.fail("Should have included series children");
                    }
                    expect(updated.series.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#seriesAll()", () => {

        context("all objects", () => {

            it("should succeed finding all objects", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                await AuthorServices.seriesAdd(authorMatch.id, series[0].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[1].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[2].id);

                try {
                    let results = await AuthorServices.seriesAll(authorMatch.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = seriesKey(result);
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

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;

                try {
                    let results = await AuthorServices.seriesAll(authorMatch.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#seriesExact()", () => {

        context("all objects", () => {

            it("should find all matches", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                await AuthorServices.seriesAdd(authorMatch.id, series[0].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[1].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[2].id);
                let seriesMatch = series[1];

                try {
                    let result = await AuthorServices.seriesExact
                        (authorMatch.id, seriesMatch.name);
                    expect(result.id).to.equal(seriesMatch.id);
                    expect(result.name).to.equal(seriesMatch.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should find no mismatches", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                await AuthorServices.seriesAdd(authorMatch.id, series[0].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[1].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[2].id);
                let nameMismatch = series[0].name + " Updated";

                try {
                    await AuthorServices.seriesExact
                        (authorMatch.id, nameMismatch);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Series '${nameMismatch}'`);
                }

            })

        });

    });

    // SQLITE3 does not like the iLike operator
/*
    describe("#seriesName()", () => {

        context("all objects", () => {

            it("should find all matches", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                await AuthorServices.seriesAdd(authorMatch.id, series[0].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[1].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[2].id);
                let nameMatch = "erie";

                try {
                    let results = await AuthorServices.seriesName
                        (authorMatch.id, nameMatch);
                    expect(results.length).to.equal(3);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should find no mismatches", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                await AuthorServices.seriesAdd(authorMatch.id, series[0].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[1].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[2].id);
                let nameMismatch = "foo";

                try {
                    let results = await AuthorServices.seriesName
                        (authorMatch.id, nameMismatch);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

        });

    });
*/

    describe("#seriesRemove()", () => {

        context("all objects", () => {

            // TODO - check case for valid seriesId that is not associated

            it("should fail on invalid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                await AuthorServices.seriesAdd(authorMatch.id, series[0].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[1].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[2].id);
                let invalidId = 9999;

                try {
                    await AuthorServices.seriesRemove(authorMatch.id, invalidId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`seriesId: Missing Series ${invalidId}`);
                }

            });

            it("should succeed on valid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let authors = await loadAuthors(libraryMatch, authorsData0);
                let authorMatch = authors[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                await AuthorServices.seriesAdd(authorMatch.id, series[0].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[1].id);
                await AuthorServices.seriesAdd(authorMatch.id, series[2].id);
                let validId = series[1].id;

                try {
                    await AuthorServices.seriesRemove(authorMatch.id, validId);
                    let after = await AuthorServices.seriesAll(authorMatch.id);
                    expect(after.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    // ***** Author-Story Relationships (Many:Many) *****

    describe("#storyAdd()", () => {
        // TODO
    });

    describe("#storyAll()", () => {
        // TODO
    });

    describe("#storyExact()", () => {
        // TODO
    });

    describe("#storyName()", () => {
        // TODO
    });

    describe("#storyRemove()", () => {
        // TODO
    });

    // ***** Author-Volume Relationships (Many:Many) *****

    describe("#volumeAdd()", () => {
        // TODO
    });

    describe("#volumeAll()", () => {
        // TODO
    });

    describe("#volumeExact()", () => {
        // TODO
    });

    describe("#volumeName()", () => {
        // TODO
    });

    describe("#volumeRemove()", () => {
        // TODO
    });

});
