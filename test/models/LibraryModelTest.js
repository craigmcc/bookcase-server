"use strict"

// Tests for association and eager loading for Library objects

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author;
const Library = db.Library;

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// Test Data -----------------------------------------------------------------

// Must be seeded with valid libraryId
const authorsData0 = {
    author0Data: {
        firstName: "Barney",
        lastName: "Rubble",
        notes: "Barney Author"
    },
    author1Data: {
        firstName: "Betty",
        lastName: "Rubble",
        notes: "Betty Author"
    },
    author2Data: {
        firstName: "Bam Bam",
        lastName: "Rubble",
        notes: "Bam Bam Author"
    }
}

// Must be seeded with valid libraryId
/*
const authorsData1 = {
    author0Data: {
        firstName: "Fred",
        lastName: "Flintstone",
        notes: "Fred Author"
    },
    author1Data: {
        firstName: "Wilma",
        lastName: "Flintstone",
        notes: "Wilma Author"
    },
    author2Data: {
        firstName: "Pebbles",
        lastName: "Flintstone",
        notes: "Pebbles Author"
    }
}
*/

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
            logging: false,
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
            logging: false,
            validate: true
        });
    } catch (err) {
        console.error("loadLibraries() error: ", err);
        throw err;
    }
}

// LibraryModel Tests --------------------------------------------------------

describe("LibraryModel Tests", () => {

    // Test Hooks ------------------------------------------------------------

    before("#init", async () => {
        await Library.sync({
            force: true,
            logging: false
        });
        await Author.sync({
            force: true,
            logging: false
        });
    });

    beforeEach("#erase", async () => {
        await Author.destroy({
            cascade: true,
            logging: false,
            truncate: true
        });
        await Library.destroy({
            cascade: true,
            logging: false,
            truncate: true
        })
    });

    // Test Methods ----------------------------------------------------------

    // TODO - for some reason, author table gets deleted after
    // TODO - beforeEach() but before the first actual test
    describe.skip("#countAuthors()", () => {

        context("with nested authors", () => {

            it("should return all of all nested authors", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {

                    let library = await Library.findByPk(libraryMatch.id);

                    let count = await library.countAuthors();
                    expect(count).to.equal(3);

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should return matches of filtered nested authors", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {

                    let library = await Library.findByPk(libraryMatch.id);

                    let count = await library.countAuthors({
                        where: { firstName: "Bam Bam" }
                    });
                    expect(count).to.equal(1);

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

        context("without nested authors", () => {

            it("should return zero of no nested authors", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2].dataValues;

                try {

                    let library = await Library.findByPk(libraryMatch.id);

                    let count = await library.countAuthors();
                    expect(count).to.equal(0);

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

    });

    describe("#getAuthors()", () => {

        context("with nested authors", () => {

            it("should return all of all nested authors", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {

                    let library = await Library.findByPk(libraryMatch.id);

                    let authors = await library.getAuthors();
                    expect(authors.length).to.equal(3);
                    authors.forEach(author => {
                        expect(author.libraryId).to.equal(library.id);
                    })

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should return matches of filtered nested authors", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {

                    let library = await Library.findByPk(libraryMatch.id);

                    let authors = await library.getAuthors({
                        where: { firstName: "Bam Bam" }
                    });
                    expect(authors.length).to.equal(1);
                    authors.forEach(author => {
                        expect(author.libraryId).to.equal(library.id);
                    })

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

        context("without nested authors", () => {

            it("should return zero of no nested authors", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[2].dataValues;

                try {

                    let library = await Library.findByPk(libraryMatch.id);

                    let authors = await library.getAuthors();
                    expect(authors.length).to.equal(0);

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

    });

    describe("#include", () => {

        context("with 1:N inner join requests", () => {

            it("should return all with nested objects", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {

                    let libraries = await Library.findAll({
                        include: {
                            model: Author,
                            required: true
                        },
                        where: { id: libraryMatch.id }
                    });
                    expect(libraries.length).to.equal(1);
                    let library = libraries[0];

                    if (library.authors) {
                        let authors = library.authors;
                        expect(authors.length).to.equal(3);
                        authors.forEach(author => {
                            expect(author.libraryId).to.equal(library.id);
                        })
                    } else {
                        expect.fail("Should have had 'authors' field");
                    }

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should return nothing with no nested objects", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;

                try {

                    let libraries = await Library.findAll({
                        include: {
                            model: Author,
                            required: true
                        },
                        where: { id: libraryMatch.id }
                    });

                    expect(libraries.length).to.equal(0);

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

        context("with 1:N outer join requests", () => {

            it("should return all with nested objects", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {

                    let libraries = await Library.findAll({
                        include: Author,
                        where: { id: libraryMatch.id }
                    });
                    expect(libraries.length).to.equal(1);
                    let library = libraries[0];

                    if (library.authors) {
                        let authors = library.authors;
                        expect(authors.length).to.equal(3);
                        authors.forEach(author => {
                            expect(author.libraryId).to.equal(library.id);
                        })
                    } else {
                        expect.fail("Should have had 'authors' field");
                    }

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should return filtered with nested objects", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {

                    let libraries = await Library.findAll({
                        include: {
                            model: Author,
                            where: { firstName: "Betty" }
                        },
                        where: { id: libraryMatch.id }
                    });
                    expect(libraries.length).to.equal(1);
                    let library = libraries[0];

                    if (library.authors) {
                        let authors = library.authors;
                        expect(authors.length).to.equal(1);
                        authors.forEach(author => {
                            expect(author.libraryId).to.equal(library.id);
                        })
                    } else {
                        expect.fail("Should have had 'authors' field");
                    }

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should return zero with no nested objects", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[1].dataValues;

                try {

                    let libraries = await Library.findAll({
                        include: Author,
                        where: { id: libraryMatch.id }
                    });
                    expect(libraries.length).to.equal(1);
                    let library = libraries[0];

                    if (library.authors) {
                        let authors = library.authors;
                        expect(authors.length).to.equal(0);
                        authors.forEach(author => {
                            expect(author.libraryId).to.equal(library.id);
                        })

                    } else {
                        expect.fail("Should have had 'authors' field");
                    }
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

        context("without 1:N include requests", () => {

            it("should return none with all nested objects", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;
                await loadAuthors(libraryMatch, authorsData0);

                try {

                    let libraries = await Library.findAll({
                        where: { id: libraryMatch.id }
                    });
                    expect(libraries.length).to.equal(1);
                    let library = libraries[0];

                    if (library.authors) {
                        expect.fail("Should not have had 'authors' field");
                    }

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should return none with no nested objects", async () => {

                let libraries = await loadLibraries();
                let libraryMatch = libraries[0].dataValues;

                try {

                    let libraries = await Library.findAll({
                        where: { id: libraryMatch.id }
                    });
                    expect(libraries.length).to.equal(1);
                    let library = libraries[0];

                    if (library.authors) {
                        expect.fail("Should not have had 'authors' field");
                    }

                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

    });

});
