"use strict"

// EXPORTS FUNCTIONS TO CALCULATE SORT KEYS FOR MODEL OBJECTS

module.exports.authorKey = (author) => {
    return "|" + author.libraryId + "|" + author.lastName + "|" + author.firstName;
}

module.exports.libraryKey = (library) => {
    return library.name;
}

module.exports.seriesKey = (series) => {
    return "|" + series.libraryId + "|" + series.name;
}

module.exports.storyKey = (story) => {
    return "|" + series.libraryId + "|" + series.storyKey + "|" + story.name;
}

module.exports.volumeKey = (volume) => {
    return "|" + volume.libraryId + "|" + volume.name;
}
