"use strict"

// EXPORTS FUNCTIONS TO CALCULATE SORT KEYS FOR MODEL OBJECTS

module.exports.authorKey = (author) => {
    return "|" + author.lastName + "|" + author.firstName + "|" + author.libraryId;
}

module.exports.libraryKey = (library) => {
    return library.name;
}

module.exports.seriesKey = (series) => {
    return "|" + series.libraryId + "|" + series.name;
}

module.exports.storyKey = (story) => {
    return "|" + story.libraryId + "|" + story.name;
}

module.exports.volumeKey = (volume) => {
    return "|" + volume.libraryId + "|" + volume.name;
}
