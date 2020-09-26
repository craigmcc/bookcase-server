"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const StoryServices = require("../../src/services/StoryServices");

const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

const {
    librariesData0, librariesData1, loadLibraries,
    storiesData0, storiesData1, loadStories,
    volumesData0, volumesData1, loadVolumes,
} = require("../util/SeedData");

const {
    volumeKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// StoryServices Volume Children Tests ---------------------------------------

describe("StoryServices Volume Children Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach()", async () => {
        await db.sequelize.sync({
            force: true,
            truncate: true,
        })
    });


    // Test Methods ----------------------------------------------------------

    // ***** Story-Volume Relationships (Many:Many) *****

    describe("#volumeAdd()", () => {

        context("all objects", () => {

            it("should fail with duplicate volumeId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[2].dataValues;
                let volumes = await loadVolumes(libraryMatch, volumesData0);
                let volumeMatch0 = volumes[0].dataValues;
                let volumeMatch1 = volumes[0].dataValues; // Duplicate

                try {
                    await StoryServices.volumeAdd
                        (storyMatch.id, volumeMatch0.id);
                    await StoryServices.volumeAdd
                        (storyMatch.id, volumeMatch1.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`)
                    }
                    expect(err.message)
                        .includes(`volumeId: Volume ${volumeMatch1.id} is already ` +
                            `associated with Story ${storyMatch.id}`);
                }

            });

            it("should fail with invalid volumeId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[2].dataValues;
                let invalidVolumeId = 9999;

                try {
                    await StoryServices.volumeAdd
                        (storyMatch.id, invalidVolumeId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (err instanceof NotFound) {
                        expect(err.message)
                            .includes(`volumeId: Missing Volume ${invalidVolumeId}`);
                    } else {
                        expect.fail(`Should not have thrown '${err.message}'`);
                    }
                }

            });

            it("should fail with invalid storyId", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let volumes = await loadVolumes(libraryMatch, volumesData0);
                let volumeMatch = volumes[1].dataValues;
                let invalidStoryId = 9999;

                try {
                    await StoryServices.volumeAdd
                        (invalidStoryId, volumeMatch.id);
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

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch0 = libraries[0].dataValues;
                let libraryMatch1 = libraries[1].dataValues;
                let stories = await loadStories(libraryMatch0, storiesData0);
                let storyMatch = stories[2].dataValues;
                let volumes = await loadVolumes(libraryMatch1, volumesData1);
                let volumeMatch = volumes[0].dataValues;

                try {
                    await StoryServices.volumeAdd
                        (storyMatch.id, volumeMatch.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Story ${storyMatch.id} belongs to ` +
                            `Library ${storyMatch.libraryId} but Volume ${volumeMatch.id} ` +
                            `belongs to Library ${volumeMatch.libraryId}`);
                }

            });

            it("should succeed with one volume", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[0].dataValues;
                let volumes = await loadVolumes(libraryMatch, volumesData0);
                let volumeMatch = volumes[1].dataValues;

                try {
                    await StoryServices.volumeAdd
                        (storyMatch.id, volumeMatch.id);
                    let updated = await StoryServices.find(storyMatch.id, {
                        withVolumes: ""
                    });
                    if (!updated.volumes) {
                        expect.fail("Should have included volumes children");
                    }
                    expect(updated.volumes.length).to.equal(1);
                    expect(updated.volumes[0].id).to.equal(volumeMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with two volumes", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[0].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[2].dataValues;
                let volumes = await loadVolumes(libraryMatch, volumesData0);
                let volumeMatch0 = volumes[0].dataValues;
                let volumeMatch1 = volumes[1].dataValues;

                try {
                    await StoryServices.volumeAdd
                        (storyMatch.id, volumeMatch0.id);
                    await StoryServices.volumeAdd
                        (storyMatch.id, volumeMatch1.id);
                    let updated = await StoryServices.find(storyMatch.id, {
                        withVolumes: ""
                    });
                    if (!updated.volumes) {
                        expect.fail("Should have included volumes children");
                    }
                    expect(updated.volumes.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#volumeAll()", () => {

        context("all objects", () => {

            it("should succeed finding all objects", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[2].dataValues;
                let volumes = await loadVolumes(libraryMatch, volumesData0);
                await StoryServices.volumeAdd(storyMatch.id, volumes[0].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[1].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[2].id);

                try {
                    let results = await StoryServices.volumeAll(storyMatch.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = volumeKey(result);
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
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[1].dataValues;

                try {
                    let results = await StoryServices.volumeAll(storyMatch.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#volumeExact()", () => {

        context("all objects", () => {

            it("should find all matches", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[2].dataValues;
                let volumes = await loadVolumes(libraryMatch, volumesData0);
                await StoryServices.volumeAdd(storyMatch.id, volumes[0].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[1].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[2].id);
                let volumeMatch = volumes[1];

                try {
                    let result = await StoryServices.volumeExact
                        (storyMatch.id, volumeMatch.name);
                    expect(result.id).to.equal(volumeMatch.id);
                    expect(result.name).to.equal(volumeMatch.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it ("should find no mismatches", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[2].dataValues;
                let volumes = await loadVolumes(libraryMatch, volumesData0);
                await StoryServices.volumeAdd(storyMatch.id, volumes[0].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[1].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[2].id);
                let nameMismatch = volumes[2].name + " Updated";

                try {
                    await StoryServices.volumeExact
                        (storyMatch.id, nameMismatch);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Volume '${nameMismatch}'`);
                }

            });

        });

    })

    describe("#volumeName()", () => {

        // WARNING:  sqlite3 does not understand ilike operator so we cannot test

    });

    describe("#volumeRemove()", () => {

        context("all objects", () => {

            // TODO - check case for valid volumeId that is not associated

            it("should fail on invalid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[2].dataValues;
                let volumes = await loadVolumes(libraryMatch, volumesData0);
                await StoryServices.volumeAdd(storyMatch.id, volumes[0].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[1].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[2].id);
                let invalidId = 9999;

                try {
                    await StoryServices.volumeRemove(storyMatch.id, invalidId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`volumeId: Missing Volume ${invalidId}`);
                }


            });

            it("should succeed on valid id", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2].dataValues;
                let stories = await loadStories(libraryMatch, storiesData0);
                let storyMatch = stories[2].dataValues;
                let volumes = await loadVolumes(libraryMatch, volumesData0);
                await StoryServices.volumeAdd(storyMatch.id, volumes[0].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[1].id);
                await StoryServices.volumeAdd(storyMatch.id, volumes[2].id);
                let validId = volumes[0].id;

                try {
                    await StoryServices.volumeRemove(storyMatch.id, validId);
                    let after = await StoryServices.volumeAll(storyMatch.id);
                    expect(after.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }
            });

        });

    });

});
