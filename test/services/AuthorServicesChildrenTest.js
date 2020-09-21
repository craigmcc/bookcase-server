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

describe("AUthorServices Children Tests", () => {

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

});
