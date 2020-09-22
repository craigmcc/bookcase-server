"use strict"

// EXPORTS SEED DATA AND LOAD FUNCTIONS

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Author = db.Author;
const AuthorServices = require("../../src/services/AuthorServices");
const Library = db.Library;
const Series = db.Series;
const Story = db.Story;
const Volume = db.Volume;

// External Modules ----------------------------------------------------------

// Test Data -----------------------------------------------------------------

// ***** Authors *****

// Must be seeded with valid libraryId
module.exports.authorsData0 = [
    {
        firstName: "Barney",
        lastName: "Rubble",
        notes: "Barney Author"
    },
    {
        firstName: "Betty",
        lastName: "Rubble",
        notes: "Betty Author"
    },
    {
        firstName: "Bam Bam",
        lastName: "Rubble",
        notes: "Bam Bam Author"
    }
]

// Must be seeded with valid libraryId
module.exports.authorsData1 = [
    {
        firstName: "Fred",
        lastName: "Flintstone",
        notes: "Fred Author"
    },
    {
        firstName: "Wilma",
        lastName: "Flintstone",
        notes: "Wilma Author"
    },
    {
        firstName: "Pebbles",
        lastName: "Flintstone",
        notes: "Pebbles Author"
    }
]

// ***** Libraries *****

module.exports.librariesData0 = [
    {
        name: "First Library",
        notes: "Special Notes about First Library"
    },
    {
        name: "Second Library",
        notes: "Other Notes about Second Library"
    },
    {
        name: "Third Library"
    }
]

module.exports.librariesData1 = [
    {
        name: "Fourth Library",
        notes: "Fourth Library Notes"
    },
    {
        name: "Fifth Library",
        notes: "Fifth Library Notes"
    },
    {
        name: "Sixth Library"
    }
]

// ***** Series *****

// Must be seeded with valid libraryId
module.exports.seriesData0 = [
    {
        name: "First Series",
        notes: "This is the first series"
    },
    {
        name: "Second Series",
        notes: "This is the second series"
    },
    {
        name: "Third Series",
        notes: "This is the third series"
    }
]

// Must be seeded with valid libraryId
module.exports.seriesData1 = [
    {
        name: "Another First Series",
        notes: "This is the first series again"
    },
    {
        name: "Another Second Series",
        notes: "This is the second series again"
    },
    {
        name: "Another Third Series",
        notes: "This is the third series again"
    }
]

// ***** Stories *****

// Must be seeded with valid libraryId
module.exports.storiesData0 = [
    {
        name: "First Story",
        notes: "First Story Notes"
    },
    {
        name: "Second Story",
        notes: "Second Story Notes"
    },
    {
        name: "Third Story",
        notes: "Third Story Notes"
    }
]

// Must be seeded with valid libraryId
module.exports.storiesData1 = [
    {
        name: "Fourth Story",
        notes: "Fourth Story Notes"
    },
    {
        name: "Fifth Story",
        notes: "Fifth Story Notes"
    },
    {
        name: "Sixth Story",
        notes: "Sixth Story Notes"
    }
]

// ***** Volumes *****

// Must be seeded with valid libraryId
module.exports.volumesData0 = [
    {
        name: "First Volume",
        notes: "First Volume Notes"
    },
    {
        name: "Second Volume",
        notes: "Second Volume Notes"
    },
    {
        name: "Third Volume",
        notes: "Third Volume Notes"
    }
]

// Must be seeded with valid libraryId
module.exports.volumesData1 = [
    {
        name: "Fourth Volume",
        notes: "Fourth Volume Notes"
    },
    {
        name: "Fifth Volume",
        notes: "Fifth Volume Notes"
    },
    {
        name: "Sixth Volume",
        notes: "Sixth Volume Notes"
    }
]

// Data Seeders --------------------------------------------------------------

// Returns array of created Author objects
module.exports.loadAuthors = async (library, data) => {
    data.forEach(datum => {
        datum.libraryId = library.id
    });
    try {
        return await Author.bulkCreate(data, {
            validate: true
        });
    } catch (err) {
        console.error("loadAuthors() error: ", err);
        throw err;
    }
}

// Returns array of created Library objects
module.exports.loadLibraries = async (data) => {
    try {
        return await Library.bulkCreate(data, {
            validate: true
        });
    } catch (err) {
        console.error("loadLibraries() error: ", err);
        throw err;
    }
}

// Returns array of created Series objects
module.exports.loadSeries = async (library, data) => {
    data.forEach(datum => {
        datum.libraryId = library.id
    });
    try {
        return await Series.bulkCreate(data, {
            validate: true
        });
    } catch (err) {
        console.error("loadSeries() error: ", err);
        throw err;
    }
}

// Returns array of created Story objects
module.exports.loadStories = async (library, data) => {
    data.forEach(datum => {
        datum.libraryId = library.id
    });
    try {
        return await Story.bulkCreate(data, {
            validate: true
        });
    } catch (err) {
        console.error("loadStories() error: ", err);
        throw err;
    }
}

// Returns array of created Volume objects
module.exports.loadVolumes = async (library, data) => {
    data.forEach(datum => {
        datum.libraryId = library.id
    });
    try {
        return await Volume.bulkCreate(data, {
            validate: true
        });
    } catch (err) {
        console.error("loadVolumes() error: ", err);
        throw err;
    }
}
