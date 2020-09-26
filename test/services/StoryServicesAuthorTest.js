"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const StoryServices = require("../../src/services/StoryServices");

const BadRequest = require("../../src/util/BadRequest");
const NotFound = require("../../src/util/NotFound");

const {
    authorsData0, authorsData1,
    librariesData0, librariesData1,
    storiesData0, storiesData1,
    loadLibraries, loadLibrariesAuthors, loadLibrariesStories,
    loadStoriesAuthors,
} = require("../util/SeedData");

const {
    authorKey,
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// StoryServices Author Children Tests ---------------------------------------

describe("StoryServices Author Children Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach()", async () => {
        await db.sequelize.sync({
            force: true,
            truncate: true,
        })
    });


    // Test Methods ----------------------------------------------------------

    // ***** Story-Author Relationships (Many:Many) *****

    describe("#authorAdd()", () => {

        context("all objects", () => {

            it("should fail with duplicate authorId", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    authors, authorMatch,
                ] = await loadStoriesAuthors(librariesData0, 0,
                        storiesData0, 2,
                        authorsData0, 1);
                let authorMatch0 = authors[0].dataValues;
                let authorMatch1 = authors[0].dataValues; // Duplicate

                try {
                    await StoryServices.authorAdd
                        (storyMatch.id, authorMatch0.id);
                    await StoryServices.authorAdd
                        (storyMatch.id, authorMatch1.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`)
                    }
                    expect(err.message)
                        .includes(`authorId: Author ${authorMatch1.id} is already ` +
                            `associated with Story ${storyMatch.id}`);
                }

            });

            it("should fail with invalid authorId", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 0,
                    storiesData0, 2);
                let invalidAuthorId = 9999;

                try {
                    await StoryServices.authorAdd
                        (storyMatch.id, invalidAuthorId);
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

            it("should fail with invalid storyId", async () => {

                let [
                    libraries, libraryMatch,
                    authors, authorMatch,
                ] = await loadLibrariesAuthors(librariesData0, 1,
                    authorsData0, 0);
                let invalidStoryId = 9999;

                try {
                    await StoryServices.authorAdd
                        (invalidStoryId, authorMatch.id);
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
                    authors0, authorMatch0,
                ] = await loadStoriesAuthors(librariesData0, 0,
                    storiesData0, 1,
                    authorsData0, 2);
                let [
                    libraries1, libraryMatch1,
                    stories1, storyMatch1,
                    authors1, authorMatch1,
                ] = await loadStoriesAuthors(librariesData1, 2,
                    storiesData1, 1,
                    authorsData1, 0);

                try {
                    await StoryServices.authorAdd
                        (storyMatch0.id, authorMatch1.id);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Story ${storyMatch0.id} belongs to ` +
                            `Library ${storyMatch0.libraryId} but Author ${authorMatch1.id} ` +
                            `belongs to Library ${authorMatch1.libraryId}`);
                }

            });

            it("should succeed with one author", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    authors, authorMatch,
                ] = await loadStoriesAuthors(librariesData0, 1,
                    storiesData0, 0,
                    authorsData0, 1);

                try {
                    await StoryServices.authorAdd
                        (storyMatch.id, authorMatch.id);
                    let updated = await StoryServices.find(storyMatch.id, {
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
                    stories, storyMatch,
                    authors, authorMatch,
                ] = await loadStoriesAuthors(librariesData0, 1,
                    storiesData0, 0,
                    authorsData0, 1);
                let authorMatch0 = authors[0].dataValues;
                let authorMatch1 = authors[1].dataValues;

                try {
                    await StoryServices.authorAdd
                        (storyMatch.id, authorMatch0.id);
                    await StoryServices.authorAdd
                        (storyMatch.id, authorMatch1.id);
                    let updated = await StoryServices.find(storyMatch.id, {
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
                    stories, storyMatch,
                    authors, authorMatch,
                ] = await loadStoriesAuthors(librariesData0, 2,
                    storiesData0, 2,
                    authorsData0, 2);
                await StoryServices.authorAdd(storyMatch.id, authors[0].id);
                await StoryServices.authorAdd(storyMatch.id, authors[1].id);
                await StoryServices.authorAdd(storyMatch.id, authors[2].id);

                try {
                    let results = await StoryServices.authorAll(storyMatch.id);
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
                    stories, storyMatch,
                ] = await loadLibrariesStories(librariesData0, 1,
                    storiesData0, 1);

                try {
                    let results = await StoryServices.authorAll(storyMatch.id);
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
                    stories, storyMatch,
                    authors, authorMatch,
                ] = await loadStoriesAuthors(librariesData0, 0,
                    storiesData0, 0,
                    authorsData0, 0);
                await StoryServices.authorAdd(storyMatch.id, authors[0].id);
                await StoryServices.authorAdd(storyMatch.id, authors[1].id);
                await StoryServices.authorAdd(storyMatch.id, authors[2].id);

                try {
                    let result = await StoryServices.authorExact
                        (storyMatch.id, authorMatch.firstName,
                         authorMatch.lastName);
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
                    stories, storyMatch,
                    authors, authorMatch,
                ] = await loadStoriesAuthors(librariesData0, 0,
                    storiesData0, 1,
                    authorsData0, 2);
                await StoryServices.authorAdd(storyMatch.id, authors[0].id);
                await StoryServices.authorAdd(storyMatch.id, authors[1].id);
                await StoryServices.authorAdd(storyMatch.id, authors[2].id);
                let firstNameMismatch = authors[2].firstName + " Updated";
                let lastNameMismatch = authors[2].lastName + " Updated";

                try {
                    await StoryServices.authorExact
                        (storyMatch.id, firstNameMismatch, lastNameMismatch);
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

    describe("#authorName()", () => {

        // WARNING:  sqlite3 does not understand ilike operator so we cannot test

    });

    describe("#authorRemove()", () => {

        context("all objects", () => {

            // TODO - check case for valid authorId that is not associated

            it("should fail on invalid id", async () => {

                let [
                    libraries, libraryMatch,
                    stories, storyMatch,
                    authors, authorMatch,
                ] = await loadStoriesAuthors(librariesData0, 1,
                    storiesData0, 2,
                    authorsData0, 0);
                await StoryServices.authorAdd(storyMatch.id, authors[0].id);
                await StoryServices.authorAdd(storyMatch.id, authors[1].id);
                await StoryServices.authorAdd(storyMatch.id, authors[2].id);
                let invalidId = 9999;

                try {
                    await StoryServices.authorRemove(storyMatch.id, invalidId);
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
                    stories, storyMatch,
                    authors, authorMatch,
                ] = await loadStoriesAuthors(librariesData0, 2,
                    storiesData0, 0,
                    authorsData0, 1);
                await StoryServices.authorAdd(storyMatch.id, authors[0].id);
                await StoryServices.authorAdd(storyMatch.id, authors[1].id);
                await StoryServices.authorAdd(storyMatch.id, authors[2].id);
                let validId = authors[0].id;

                try {
                    await StoryServices.authorRemove(storyMatch.id, validId);
                    let after = await StoryServices.authorAll(storyMatch.id);
                    expect(after.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }
            });

        });

    });

});
