"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author;
const Library = db.Library;
const LibraryServices = require("../../src/services/LibraryServices");
const Series = db.Series;
const Story = db.Story;
const Volume = db.Volume;
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

// LibraryServices Tests -----------------------------------------------------

describe("LibraryServices Children Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach()", async () => {
        await db.sequelize.sync({
            force: true,
            truncate: true,
        })
    });


    // Test Methods ----------------------------------------------------------

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

            });

            it("should succeed for all authors for library with", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadAuthors(libraryFirst, authorsData0);
                await loadAuthors(librarySecond, authorsData1);

                try {
                    let results = await LibraryServices.authorAll
                        (libraryFirst.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
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

            it("should succeed for no authors for library without", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadAuthors(libraryFirst, authorsData0);

                try {
                    let results = await LibraryServices.authorAll
                        (libraryFirst.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
                        let currentKey = authorKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                        }
                        previousKey = currentKey;
                    })
                    results = await LibraryServices.authorAll(librarySecond.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#authorExact()", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                let libraries = await loadLibraries(librariesData0);
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

                let libraries = await loadLibraries(librariesData0);
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

            });

            it("should succeed for all series for library with", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadSeries(libraryFirst, seriesData0);
                await loadSeries(librarySecond, seriesData1);

                try {
                    let results = await LibraryServices.seriesAll
                        (libraryFirst.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
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

            it("should succeed for no series for library without", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadSeries(libraryFirst, seriesData0);

                try {
                    let results = await LibraryServices.seriesAll
                        (libraryFirst.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
                        let currentKey = seriesKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                        }
                        previousKey = currentKey;
                    })
                    results = await LibraryServices.seriesAll(librarySecond.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#seriesExact()", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                let libraries = await loadLibraries(librariesData0);
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

                let libraries = await loadLibraries(librariesData0);
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

    describe("#storyAll()", () => {

        context("all objects", () => {

            it("should fail with invalid libraryId", async () => {

                let invalidId = 9999;

                try {
                    await LibraryServices.storyAll
                        (invalidId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidId}`);
                }

            });

            it("should succeed for all story for library with", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadStories(libraryFirst, storiesData0);
                await loadStories(librarySecond, storiesData1);

                try {
                    let results = await LibraryServices.storyAll
                        (libraryFirst.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
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

            it("should succeed for no story for library without", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadStories(libraryFirst, storiesData0);

                try {
                    let results = await LibraryServices.storyAll
                        (libraryFirst.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
                        let currentKey = storyKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                        }
                        previousKey = currentKey;
                    })
                    results = await LibraryServices.storyAll(librarySecond.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#storyExact()", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[1].dataValues;
                let story = await loadStories(libraryMatch, storiesData0);
                let invalidName = "Foo Bar";

                try {
                    await LibraryServices.storyExact
                        (story[0].libraryId, invalidName);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Story '${invalidName}'`);
                }

            });

            it("should succeed with valid name", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2];
                let story = await loadStories(libraryMatch, storiesData0);
                let storyMatch = story[1];

                try {
                    let result = await LibraryServices.storyExact
                        (libraryMatch.id, storyMatch.name);
                    expect(result.id).to.equal(storyMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            describe("#storyName()", () => {

                // WARNING:  sqlite3 does not understand iLike operator so we cannot test

            });

        });

    });

    describe("#volumeAll()", () => {

        context("all objects", () => {

            it("should fail with invalid libraryId", async () => {

                let invalidId = 9999;

                try {
                    await LibraryServices.volumeAll
                        (invalidId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`libraryId: Missing Library ${invalidId}`);
                }

            });

            it("should succeed for all volume for library with", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadVolumes(libraryFirst, volumesData0);
                await loadVolumes(librarySecond, volumesData1);

                try {
                    let results = await LibraryServices.volumeAll
                        (libraryFirst.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
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

            it("should succeed for no volume for library without", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryFirst = libraries[1].dataValues;
                let librarySecond = libraries[2].dataValues;
                await loadVolumes(libraryFirst, volumesData0);

                try {
                    let results = await LibraryServices.volumeAll
                        (libraryFirst.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        expect(result.libraryId).to.equal(libraryFirst.id);
                        let currentKey = volumeKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                        }
                        previousKey = currentKey;
                    })
                    results = await LibraryServices.volumeAll(librarySecond.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#volumeExact()", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[1].dataValues;
                let volume = await loadVolumes(libraryMatch, volumesData0);
                let invalidName = "Foo Bar";

                try {
                    await LibraryServices.volumeExact
                        (volume[0].libraryId, invalidName);
                    expect.fail("Should have thrown NotFound initially");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Volume '${invalidName}'`);
                }

            });

            it("should succeed with valid name", async () => {

                let libraries = await loadLibraries(librariesData0);
                let libraryMatch = libraries[2];
                let volume = await loadVolumes(libraryMatch, volumesData0);
                let volumeMatch = volume[1];

                try {
                    let result = await LibraryServices.volumeExact
                    (libraryMatch.id, volumeMatch.name);
                    expect(result.id).to.equal(volumeMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            describe("#volumeName()", () => {

                // WARNING:  sqlite3 does not understand iLike operator so we cannot test

            });

        });

    });

});
