"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const StoryServices = require("../../src/services/StoryServices");

const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

const {
    librariesData0, librariesData1,
    seriesData0, seriesData1,
    storiesData0, storiesData1,
    loadLibraries, loadLibrariesSeries, loadLibrariesStories,
    loadStoriesSeries,
} = require("../util/SeedData");

const {
    seriesKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// StoryServices Series Children Tests ---------------------------------------

describe("StoryServices Series Children Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach()", async () => {
        await db.sequelize.sync({
            force: true,
            truncate: true,
        })
    });


    // Test Methods ----------------------------------------------------------

    // ***** Story-Series Relationships (Many:Many) *****

    describe("#seriesAdd()", () => {

        context("all objects", () => {

            it("should fail with duplicate seriesId", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    series, seriesMatch,
                ] = await loadStoriesSeries(librariesData0, 0,
                        storiesData0, 1,
                        seriesData0, 2);
                let seriesMatch0 = series[0].dataValues;
                let seriesMatch1 = series[0].dataValues; // Duplicate

                try {
                    await StoryServices.seriesAdd
                        (storyMatch.id, seriesMatch0.id);
                    await StoryServices.seriesAdd
                        (storyMatch.id, seriesMatch1.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`)
                    }
                    expect(err.message)
                        .includes(`seriesId: Series ${seriesMatch1.id} is already ` +
                            `associated with Story ${storyMatch.id}`);
                }

            });

            it("should fail with invalid seriesId", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    series, seriesMatch,
                ] = await loadStoriesSeries(librariesData0, 0,
                    storiesData0, 1,
                    seriesData0, 2);
                let invalidSeriesId = 9999;

                try {
                    await StoryServices.seriesAdd
                        (storyMatch.id, invalidSeriesId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (err instanceof NotFound) {
                        expect(err.message)
                            .includes(`seriesId: Missing Series ${invalidSeriesId}`);
                    } else {
                        expect.fail(`Should not have thrown '${err.message}'`);
                    }
                }

            });

            it("should fail with invalid storyId", async () => {

                let [
                    libraries, libraryMatch,
                    series, seriesMatch,
                ] = await loadLibrariesSeries(librariesData0, 0,
                    seriesData0, 2);
                let invalidStoryId = 9999;

                try {
                    await StoryServices.seriesAdd
                        (invalidStoryId, seriesMatch.id);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect (err.message)
                        .includes(`storyId: Missing Story ${invalidStoryId}`);
                }

            });

            it("should fail with mismatched libraryId", async () => {

                let [
                    libraries0, libraryMatch0,
                    stories0, storyMatch0,
                    series0, seriesMatch0,
                ] = await loadStoriesSeries(librariesData0, 0,
                    storiesData0, 1,
                    seriesData0, 2);
                let [
                    libraries1, libraryMatch1,
                    stories1, storyMatch1,
                    series1, seriesMatch1,
                ] = await loadStoriesSeries(librariesData1, 2,
                    storiesData1, 1,
                    seriesData1, 0);

                try {
                    await StoryServices.seriesAdd
                        (storyMatch0.id, seriesMatch1.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Story ${storyMatch0.id} belongs to ` +
                            `Library ${storyMatch0.libraryId} but Series ${seriesMatch1.id} ` +
                            `belongs to Library ${seriesMatch1.libraryId}`);
                }

            });

            it("should succeed with one series", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    series, seriesMatch,
                ] = await loadStoriesSeries(librariesData0, 2,
                    storiesData0, 0,
                    seriesData0, 1);

                try {
                    await StoryServices.seriesAdd
                        (storyMatch.id, seriesMatch.id);
                    let updated = await StoryServices.find(storyMatch.id, {
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

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    series, seriesMatch,
                ] = await loadStoriesSeries(librariesData0, 1,
                    storiesData0, 1,
                    seriesData0, 1);
                let seriesMatch0 = series[0].dataValues;
                let seriesMatch1 = series[1].dataValues;

                try {
                    await StoryServices.seriesAdd
                        (storyMatch.id, seriesMatch0.id);
                    await StoryServices.seriesAdd
                        (storyMatch.id, seriesMatch1.id);
                    let updated = await StoryServices.find(storyMatch.id, {
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

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    series, seriesMatch,
                ] = await loadStoriesSeries(librariesData0, 2,
                    storiesData0, 2,
                    seriesData0, 2);
                await StoryServices.seriesAdd(storyMatch.id, series[0].id);
                await StoryServices.seriesAdd(storyMatch.id, series[1].id);
                await StoryServices.seriesAdd(storyMatch.id, series[2].id);

                try {
                    let results = await StoryServices.seriesAll(storyMatch.id);
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

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 2,
                    storiesData0, 2);

                try {
                    let results = await StoryServices.seriesAll(storyMatch.id);
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

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    series, seriesMatch,
                ] = await loadStoriesSeries(librariesData0, 1,
                    storiesData0, 0,
                    seriesData0, 2);
                await StoryServices.seriesAdd(storyMatch.id, series[0].id);
                await StoryServices.seriesAdd(storyMatch.id, series[1].id);
                await StoryServices.seriesAdd(storyMatch.id, series[2].id);

                try {
                    let result = await StoryServices.seriesExact
                        (storyMatch.id, seriesMatch.name);
                    expect(result.id).to.equal(seriesMatch.id);
                    expect(result.name).to.equal(seriesMatch.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it ("should find no mismatches", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    series, seriesMatch,
                ] = await loadStoriesSeries(librariesData0, 2,
                    storiesData0, 0,
                    seriesData0, 1);
                await StoryServices.seriesAdd(storyMatch.id, series[0].id);
                await StoryServices.seriesAdd(storyMatch.id, series[1].id);
                await StoryServices.seriesAdd(storyMatch.id, series[2].id);
                let nameMismatch = series[2].name + " Updated";

                try {
                    await StoryServices.seriesExact
                         (storyMatch.id, nameMismatch);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Series '${nameMismatch}'`);
                }

            });

        });

    })

    describe("#seriesName()", () => {

        // WARNING:  sqlite3 does not understand ilike operator so we cannot test

    });

    describe("#seriesRemove()", () => {

        context("all objects", () => {

            // TODO - check case for valid seriesId that is not associated

            it("should fail on invalid id", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    series, seriesMatch,
                ] = await loadStoriesSeries(librariesData0, 1,
                    storiesData0, 2,
                    seriesData0, 0);
                await StoryServices.seriesAdd(storyMatch.id, series[0].id);
                await StoryServices.seriesAdd(storyMatch.id, series[1].id);
                await StoryServices.seriesAdd(storyMatch.id, series[2].id);
                let invalidId = 9999;

                try {
                    await StoryServices.seriesRemove(storyMatch.id, invalidId);
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

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    series, seriesMatch,
                ] = await loadStoriesSeries(librariesData0, 0,
                    storiesData0, 1,
                    seriesData0, 2);
                await StoryServices.seriesAdd(storyMatch.id, series[0].id);
                await StoryServices.seriesAdd(storyMatch.id, series[1].id);
                await StoryServices.seriesAdd(storyMatch.id, series[2].id);
                let validId = series[0].id;

                try {
                    await StoryServices.seriesRemove(storyMatch.id, validId);
                    let after = await StoryServices.seriesAll(storyMatch.id);
                    expect(after.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }
            });

        });

    });

});
