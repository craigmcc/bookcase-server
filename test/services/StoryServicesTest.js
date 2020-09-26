"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Story = db.Story;
const StoryServices = require("../../src/services/StoryServices");

const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

const {
    authorsData0, librariesData0, storiesData0,
    loadLibraries, loadLibrariesStories, loadStoriesAuthors,
} = require("../util/SeedData");

const {
    storyKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// StoryServices Tests -------------------------------------------------------

describe("StoryServices Tests", () => {

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

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 0,
                        storiesData0, 0);

                let results = await StoryServices.all();
                expect(results.length).to.equal(3);
                let previousKey;
                results.forEach(result => {
                    let currentKey = storyKey(result);
                    if (previousKey) {
                        if (currentKey < previousKey) {
                            expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`)
                        }
                    }
                    previousKey = currentKey;
                })

            })

            it("should find all objects with includes", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 1,
                        storiesData0, 1);

                let results = await StoryServices.all({
                    withLibrary: ""
                });
                expect(results.length).to.equal(3);
                let previousKey;
                results.forEach(result => {
                    if (result.library) {
                        expect(result.library.id).to.equal(libraryMatch.id);
                    } else {
                        expect.fail("Should have included library");
                    }
                    let currentKey = storyKey(result);
                    if (previousKey) {
                        if (currentKey < previousKey) {
                            expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`)
                        }
                    }
                    previousKey = currentKey;
                })

            })

            it("should find some objects with pagination", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 1,
                        storiesData0, 2);

                let results = await StoryServices.all({
                    offset: 1
                });
                expect(results.length).to.equal(2);

            })

        });

        context("no objects", () => {

            it("should find no objects", async () => {

                let results = await StoryServices.all();
                expect(results.length).to.equal(0);

            });

        });

    });

    describe("#exact()", () => {

        context("all objects", () => {

            it("should find exact on matches", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 2,
                        storiesData0, 1);

                try {
                    let result = await StoryServices.exact(storyMatch.name);
                    expect(result.id).to.equal(storyMatch.id);
                    expect(result.name).to.equal(storyMatch.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should find none on mismatches", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 1,
                        storiesData0, 0);
                let invalidName = "Invalid Name Match";

                try {
                    let result = await StoryServices.exact(invalidName);
                    expect.fail(`Should have thrown NotFound`);
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Story '${invalidName}'`);
                }

            });

        });

    });

    describe("#find()", () => {

        context("all objects", () => {

            it("should fail with invalid id", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 2,
                        storiesData0, 1);
                let invalidId = 9999;

                try {
                    await StoryServices.find(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`storyId: Missing Story ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 0,
                        storiesData0, 2);

                try {
                    let result = await StoryServices.find(storyMatch.id);
                    expect(result.name).to.equal(storyMatch.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with valid id and nested authors", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    authors, authorMatch,
                ] = await loadStoriesAuthors(librariesData0, 1,
                        storiesData0, 0,
                        authorsData0, 2);
                let authorMatch0 = authors[0].dataValues;
                let authorMatch1 = authors[1].dataValues;

                try {
                    await StoryServices.authorAdd(storyMatch.id, authorMatch0.id);
                    await StoryServices.authorAdd(storyMatch.id, authorMatch1.id);
                    let result = await StoryServices.find(storyMatch.id, {
                        withAuthors: ""
                    });
                    expect(result.name).to.equal(storyMatch.name);
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

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 2,
                        storiesData0, 0);
                let storyDup = stories[1].dataValues;
                let duplicateNameStory = {
                    ...storyMatch,
                    name: storyDup.name,
                }

                try {
                    await StoryServices.insert(duplicateNameStory);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${duplicateNameStory.name}' ` +
                            "is already in use within this Library");
                }

            });

            it("should fail with invalid libraryId", async () => {

                let invalidStory = {
                    ...storiesData0.story0Data,
                    libraryId: 9999
                }

                try {
                    await StoryServices.insert(invalidStory);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidStory.libraryId}`);
                }

            });

            it("should fail with missing name", async () => {

                let libraries = await loadLibraries(librariesData0);
                let invalidStory = {
                    ...storiesData0.story1Data,
                    name: null,
                    libraryId: libraries[0].id
                }

                try {
                    await StoryServices.insert(invalidStory);
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
                let invalidStory = {
                    ...storiesData0.story0Data,
                    libraryId: null
                }

                try {
                    await StoryServices.insert(invalidStory);
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
                let validStory = {
                    ...storiesData0.story2Data,
                    libraryId: libraryMatch.id,
                    name: "Brand New Story",
                }

                try {
                    let result = await StoryServices.insert(validStory);
                    expect(result.name).to.equal(validStory.name);
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

                let invalidId = 9999;

                try {
                    await StoryServices.remove(invalidId);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`storyId: Missing Story ${invalidId}`);
                }

            });

            it("should succeed with valid id", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 1,
                    storiesData0, 0);

                try {
                    let result = await StoryServices.remove(storyMatch.id);
                    expect(result.name).to.equal(storyMatch.name);
                    let count = await Story.count({});
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

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 2,
                        storiesData0, 0);
                let storyDup = stories[1].dataValues;
                let invalidData = {
                    ...storyMatch,
                    name: storyDup.name,
                }

                try {
                    await StoryServices.update(invalidData.id, invalidData);
                    expect.fail("Should have thrown BadRequest initially");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.name}' ` +
                            "is already in use within this Library");
                }

            });

            it("should fail with invalid id", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 2,
                        storiesData0, 2);
                let invalidId = 9999;
                let invalidData = {
                    ...storyMatch,
                    id: invalidId
                }

                try {
                    await StoryServices.update(invalidId, invalidData);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`storyId: Missing Story ${invalidId}`);
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with no change", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 1,
                        storiesData0, 1);
                let validData = {
                    ...storyMatch
                }
                let validId = validData.id;

                try {
                    let result = await StoryServices.update(validId, validData);
                    expect(result.id).to.equal(validData.id);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with other field change", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 0,
                        storiesData0, 0);
                let validData = {
                    ...storyMatch,
                    notes: "Brand New Notes"
                }
                let validId = validData.id;

                try {
                    let result = await StoryServices.update(validId, validData);
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
