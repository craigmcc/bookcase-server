"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Author = db.Author;
const AuthorStory = db.AuthorStory;
const Library = db.Library;
const Series = db.Series;
const SeriesStory = db.SeriesStory;
const Story = db.Story;
const Volume = db.Volume;
const VolumeStory = db.VolumeStory;

const BadRequest = require("../util/BadRequest");
const NotFound = require("../util/NotFound");

const fields = [
    "libraryId",
    "name",
    "notes"
];
const fieldsWithId = [...fields, "id"];
const order = [
    ["libraryId", "ASC"],
    ["name", "ASC"]
];

// External Modules ----------------------------------------------------------

const Op = db.Sequelize.Op;

// Private Methods -----------------------------------------------------------

let appendQueryParameters = (options, queryParameters) => {

    if (!queryParameters) {
        return options;
    }

    // Pagination parameters
    if (queryParameters["limit"]) {
        let value = parseInt(queryParameters.limit, 10);
        if (isNaN(value)) {
            throw new Error(`${queryParameters.limit} is not a number`);
        } else {
            options["limit"] = value;
        }
    }
    if (queryParameters["offset"]) {
        let value = parseInt(queryParameters.offset, 10);
        if (isNaN(value)) {
            throw new Error(`${queryParameters.offset} is not a number`);
        } else {
            options["offset"] = value;
        }
    }

    // Inclusion parameters
    let include = [];
    if ("" === queryParameters["withAuthors"]) {
        include.push(Author);
    }
    if ("" === queryParameters["withLibrary"]) {
        include.push(Library);
    }
    if ("" === queryParameters["withVolumes"]) {
        include.push(Volume);
    }
    if (include.length > 0) {
        options["include"] = include;
    }

    // Return result
    return options;

}

// Standard CRUD Methods -----------------------------------------------------

exports.all = async (queryParameters) => {
    let options = appendQueryParameters({
        order: order
    }, queryParameters);
    return await Story.findAll(options);
}

exports.find = async (storyId, queryParameters) => {
    let options = appendQueryParameters({}, queryParameters);
    let result = await Story.findByPk(storyId, options);
    if (!result) {
        throw new NotFound(`id: Missing Story ${storyId}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Story.create(data, {
            fields: fields,
            transaction: transaction
        });
        await transaction.commit();
        return result;
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        if (err instanceof db.Sequelize.ValidationError) {
            throw new BadRequest(err.message);
        } else {
            throw err;
        }
    }
}

exports.remove = async (storyId) => {
    let result = await Story.findByPk(storyId);
    if (!result) {
        throw new NotFound(`id: Missing Story ${storyId}`);
    }
    let num = await Story.destroy({
        where: { id: storyId }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Story ${storyId}`);
    }
    return result;
}

exports.update = async (storyId, data) => {
    let original = await Story.findByPk(storyId);
    if (!original) {
        throw new NotFound(`id: Missing Story ${storyId}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Story.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: storyId }
        });
        if (result[0] === 0) {
            throw new BadRequest(`id: Cannot update Story ${storyId}`);
        }
        await transaction.commit();
        transaction = null;
        return await Story.findByPk(storyId);
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        if (err instanceof db.Sequelize.ValidationError) {
            throw new BadRequest(err.message);
        } else {
            throw err;
        }
    }
}

// Model Specific Methods ----------------------------------------------------

exports.exact = async (name, queryParameters) => {
    let options = appendQueryParameters({
        where: { name: name }
    }, queryParameters);
    let results = await Story.findAll(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Story '${name}'`);
    }
    return results[0];
}

exports.name = async (name, queryParameters) => {
    let options = appendQueryParameters({
        order: order,
        where: {
            name: { [Op.iLike]: `%${name}%` }
        }
    }, queryParameters);
    return await Story.findAll(options);
}

// Relationship Specific Methods ---------------------------------------------

// ***** Author-Story Relationships (Many:Many) *****

exports.authorAdd = async (storyId, authorId) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let author = await Author.findByPk(authorId);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${authorId}`);
    }
    if (story.libraryId !== author.libraryId) {
        throw new BadRequest(`libraryId: Story ${storyId} belongs to ` +
            `Library ${story.libraryId} but Author ${authorId} belongs to ` +
            `Library ${author.libraryId}`);
    }
    let count = await AuthorStory.count({
        where: {
            authorId: authorId,
            storyId: storyId
        }
    });
    if (count > 0) {
        throw new BadRequest(`authorId: Author ${authorId} is already ` +
            `associated with Story ${storyId}`);
    }
    await story.addAuthor(author); // returns instanceof AuthorStory
    return author;
}

exports.authorAll = async (storyId, queryParameters) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
    }, queryParameters);
    return await story.getAuthors(options);
}

exports.authorExact = async (storyId, firstName, lastName, queryParameters) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
        where: {
            firstName: firstName,
            lastName: lastName,
        }
    }, queryParameters);
    let results = await story.getAuthors(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Author '${firstName} ${lastName}'`);
    }
    return results[0];
}

exports.authorName = async (storyId, name, queryParameters) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
        where: {
            [Op.or]: {
                firstName: {[Op.iLike]: `%${name}%`},
                lastName: {[Op.iLike]: `%${name}%`}
            }
        }
    }, queryParameters);
    return await story.getAuthors(options);
}

exports.authorRemove = async (storyId, authorId) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`seriesId: Missing Story ${storyId}`);
    }
    let author = await Author.findByPk(authorId);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${authorId}`);
    }
    if (story.libraryId !== author.libraryId) {
        throw new BadRequest(`libraryId: Story ${storyId} belongs to ` +
            `Library ${story.libraryId} ` +
            `but Author ${authorId} belongs to ` +
            `Library ${author.libraryId}`);
    }
    let count = await AuthorStory.count({
        where: {
            authorId: authorId,
            storyId: storyId,
        }
    });
    if (count === 0) {
        throw new BadRequest(`authorId: Author ${authorId} is not ` +
            `associated with Story ${storyId}`);
    }
    await story.removeAuthor(author); // returns instanceof AuthorStory
    return author;
}

// ***** Series-Story Relationships (Many:Many) *****

exports.seriesAdd = async (storyId, seriesId) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let series = await Series.findByPk(seriesId);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${seriesId}`);
    }
    if (story.libraryId !== series.libraryId) {
        throw new BadRequest(`libraryId: Story ${storyId} belongs to ` +
            `Library ${story.libraryId} but Series ${seriesId} belongs to ` +
            `Library ${series.libraryId}`);
    }
    let count = await SeriesStory.count({
        where: {
            seriesId: seriesId,
            storyId: storyId
        }
    });
    if (count > 0) {
        throw new BadRequest(`seriesId: Series ${seriesId} is already ` +
            `associated with Story ${storyId}`);
    }
    await story.addSeries(series); // returns instanceof SeriesStory
    return series;
}

exports.seriesAll = async (storyId, queryParameters) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: order,
    }, queryParameters);
    return await story.getSeries(options);
}

exports.seriesExact = async (storyId, name, queryParameters) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: order,
        where: {
            name: name,
        }
    }, queryParameters);
    let results = await story.getSeries(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Series '${firstName} ${lastName}'`);
    }
    return results[0];
}

exports.seriesName = async (storyId, name, queryParameters) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: order,
        where: {
            name: { [Op.ilike]: `%${name}%` }
        }
    }, queryParameters);
    return await story.getSeries(options);
}

exports.seriesRemove = async (storyId, seriesId) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`seriesId: Missing Story ${storyId}`);
    }
    let series = await Series.findByPk(seriesId);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${seriesId}`);
    }
    if (story.libraryId !== series.libraryId) {
        throw new BadRequest(`libraryId: Story ${storyId} belongs to ` +
            `Library ${story.libraryId} ` +
            `but Series ${seriesId} belongs to ` +
            `Library ${series.libraryId}`);
    }
    let count = await SeriesStory.count({
        where: {
            seriesId: seriesId,
            storyId: storyId,
        }
    });
    if (count === 0) {
        throw new BadRequest(`seriesId: Series ${seriesId} is not ` +
            `associated with Story ${storyId}`);
    }
    await story.removeSeries(series); // returns instanceof SeriesStory
    return series;
}

// ***** Volume-Story Relationships (Many:Many) *****

exports.volumeAdd = async (storyId, volumeId) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let volume = await Volume.findByPk(volumeId);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${volumeId}`);
    }
    if (story.libraryId !== volume.libraryId) {
        throw new BadRequest(`libraryId: Story ${storyId} belongs to ` +
            `Library ${story.libraryId} but Volume ${volumeId} belongs to ` +
            `Library ${volume.libraryId}`);
    }
    let count = await VolumeStory.count({
        where: {
            volumeId: volumeId,
            storyId: storyId
        }
    });
    if (count > 0) {
        throw new BadRequest(`volumeId: Volume ${volumeId} is already ` +
            `associated with Story ${storyId}`);
    }
    await story.addVolume(volume); // returns instanceof VolumeStory
    return volume;
}

exports.volumeAll = async (storyId, queryParameters) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: order,
    }, queryParameters);
    return await story.getVolumes(options);
}

exports.volumeExact = async (storyId, name, queryParameters) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let options = appendQueryParameters({
        where: {
            name: name,
        }
    }, queryParameters);
    let results = await story.getVolumes(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Volume '${name}'`);
    }
    return results[0];
}

exports.volumeName = async (storyId, name, queryParameters) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    let options = appendQueryParameters({
        order: order,
        where: {
            name: { [Op.iLike]: `%${name}%`},
        }
    }, queryParameters);
    return await story.getVolumes(options);
}

exports.volumeRemove = async (storyId, volumeId) => {
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`seriesId: Missing Story ${storyId}`);
    }
    let volume = await Volume.findByPk(volumeId);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${volumeId}`);
    }
    if (story.libraryId !== volume.libraryId) {
        throw new BadRequest(`libraryId: Story ${storyId} belongs to ` +
            `Library ${story.libraryId} ` +
            `but Volume ${volumeId} belongs to ` +
            `Library ${volume.libraryId}`);
    }
    let count = await VolumeStory.count({
        where: {
            volumeId: volumeId,
            storyId: storyId,
        }
    });
    if (count === 0) {
        throw new BadRequest(`volumeId: Volume ${volumeId} is not ` +
            `associated with Story ${storyId}`);
    }
    await story.removeVolume(volume); // returns instanceof VolumeStory
    return volume;
}
