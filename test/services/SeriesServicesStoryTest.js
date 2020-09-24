"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Library = db.Library;
const Series = db.Series;
const SeriesServices = require("../../src/services/SeriesServices");
const Story = db.Story;

const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

const {
    librariesData0, librariesData1, loadLibraries,
    seriesData0, seriesData1, loadSeries,
    storiesData0, storiesData1, loadStories,
} = require("../util/SeedData");

const {
    storyKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// SeriesServices Story Children Tests ---------------------------------------

describe("SeriesServices Story Children Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach()", async () => {
        await db.sequelize.sync({
            force: true,
            truncate: true,
        })
    });


    // Test Methods ----------------------------------------------------------

    // ***** Series-Story Relationships (Many:Many) *****

    describe("#storyAdd()", () => {

        context("all objects", () => {

            it("should fail with duplicate storyId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch0 = stories[0].dataValues;
                let storyMatch1 = stories[0].dataValues; // Duplicate

                try {
                    let result0 = await SeriesServices.storyAdd
                        (seriesMatch.id, storyMatch0.id);
                    let result1 = await SeriesServices.storyAdd
                        (seriesMatch.id, storyMatch1.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`)
                    }
                    expect(err.message)
                        .includes(`storyId: Story ${storyMatch1.id} is already ` +
                            `associated with Series ${seriesMatch.id}`);
                }

            });

            it("should fail with invalid storyId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let invalidStoryId = 9999;

                try {
                    await SeriesServices.storyAdd
                        (seriesMatch.id, invalidStoryId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (err instanceof NotFound) {
                        expect(err.message)
                            .includes(`storyId: Missing Story ${invalidStoryId}`);
                    } else {
                        expect.fail(`Should not have thrown '${err.message}'`);
                    }
                }

            });

            it("should fail with invalid seriesId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[1].dataValues;
                let invalidSeriesId = 9999;

                try {
                    await SeriesServices.storyAdd
                        (invalidSeriesId, storyMatch.id);
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
                let series = await loadSeries(libraryMatch0, seriesData0);
                let seriesMatch = series[2].dataValues;
                let stories = await loadStories(libraryMatch1, storiesData1);
                let storyMatch = stories[0].dataValues;

                try {
                    await SeriesServices.storyAdd
                        (seriesMatch.id, storyMatch.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Series ${seriesMatch.id} belongs to ` +
                            `Library ${seriesMatch.libraryId} but Story ${storyMatch.id} ` +
                            `belongs to Library ${storyMatch.libraryId}`);
                }

            });

            it("should succeed with one story", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[0].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[1].dataValues;

                try {
                    await SeriesServices.storyAdd
                        (seriesMatch.id, storyMatch.id);
                    let updated = await SeriesServices.find(seriesMatch.id, {
                        withStories: ""
                    });
                    if (!updated.stories) {
                        expect.fail("Should have included stories children");
                    }
                    expect(updated.stories.length).to.equal(1);
                    expect(updated.stories[0].id).to.equal(storyMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with two stories", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch0 = stories[0].dataValues;
                let storyMatch1 = stories[1].dataValues;

                try {
                    await SeriesServices.storyAdd
                        (seriesMatch.id, storyMatch0.id);
                    await SeriesServices.storyAdd
                        (seriesMatch.id, storyMatch1.id);
                    let updated = await SeriesServices.find(seriesMatch.id, {
                        withStories: ""
                    });
                    if (!updated.stories) {
                        expect.fail("Should have included stories children");
                    }
                    expect(updated.stories.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#storyAll()", () => {

        context("all objects", () => {

            it("should succeed finding all objects", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                await SeriesServices.storyAdd(seriesMatch.id, stories[0].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[1].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[2].id);

                try {
                    let results = await SeriesServices.storyAll
                        (seriesMatch.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = storyKey(result);
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
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[1].dataValues;

                try {
                    let results = await SeriesServices.storyAll
                        (seriesMatch.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#storyExact()", () => {

        context("all objects", () => {

            it("should find all matches", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                await SeriesServices.storyAdd(seriesMatch.id, stories[0].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[1].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[2].id);
                let storyMatch = stories[1];

                try {
                    let result = await SeriesServices.storyExact
                        (seriesMatch.id, storyMatch.name);
                    expect(result.id).to.equal(storyMatch.id);
                    expect(result.name).to.equal(storyMatch.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it ("should find no mismatches", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                await SeriesServices.storyAdd(seriesMatch.id, stories[0].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[1].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[2].id);
                let nameMismatch = stories[2].name + " Updated";

                try {
                    await SeriesServices.storyExact
                        (seriesMatch.id, nameMismatch);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Story '${nameMismatch}'`);
                }

            });

        });

    })

    // SQLITE3 does not like the iLike operator
    /*
        describe("#storyName()", () => {

            context("all objects", () => {

                it("should find all matches", async () => {

                });

                it("should find no mismatches", async () => {

                });

            });

        });
    */

    describe("#storyRemove()", () => {

        context("all objects", () => {

            // TODO - check case for valid storyId that is not associated

            it("should fail on invalid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                await SeriesServices.storyAdd(seriesMatch.id, stories[0].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[1].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[2].id);
                let invalidId = 9999;

                try {
                    await SeriesServices.storyRemove
                        (seriesMatch.id, invalidId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`storyId: Missing Story ${invalidId}`);
                }


            });

            it("should succeed on valid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let series = await loadSeries(libraryMatch, seriesData0);
                let seriesMatch = series[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                await SeriesServices.storyAdd(seriesMatch.id, stories[0].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[1].id);
                await SeriesServices.storyAdd(seriesMatch.id, stories[2].id);
                let validId = stories[0].id;

                try {
                    await SeriesServices.storyRemove
                        (seriesMatch.id, validId);
                    let after = await SeriesServices.storyAll(seriesMatch.id);
                    expect(after.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }
            });

        });

    });

});
