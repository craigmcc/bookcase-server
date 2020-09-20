"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Author = db.Author;
const AuthorSeries = db.AuthorSeries;
const AuthorStory = db.AuthorStory;
const AuthorVolume = db.AuthorVolume;
const Library = db.Library;
const Series = db.Series;
const Story = db.Story;
const BadRequest = require("../util/BadRequest");
const NotFound = require("../util/NotFound");

const fields = [
    "firstName",
    "lastName",
    "libraryId",
    "notes"
];
const fieldsWithId = [...fields, "id"];
const order = [
    ["libraryId", "ASC"],
    ["lastName", "ASC"],
    ["firstName", "ASC"]
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
    if ("" === queryParameters["withLibrary"]) {
        include.push(Library);
    }
    if ("" === queryParameters["withSeries"]) {
        include.push(Series);
    }
/*
        if ("" === queryParameters["withStories"]) {
            include.push(Story);
        }
        if ("" === queryParameters["withVolumes"]) {
            include.push(Volume);
        }
*/
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
    return await Author.findAll(options);
}

exports.find = async (id, queryParameters) => {
    let options = appendQueryParameters({}, queryParameters);
    let result = await Author.findByPk(id, options);
    if (!result) {
        throw new NotFound(`id: Missing Author ${id}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Author.create(data, {
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

exports.remove = async (id) => {
    let result = await Author.findByPk(id);
    if (!result) {
        throw new NotFound(`id: Missing Author ${id}`);
    }
    let num = await Author.destroy({
        where: { id: id }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Author ${id}`);
    }
    return result;
}

exports.update = async (id, data) => {
    let original = await Author.findByPk(id);
    if (!original) {
        throw new NotFound(`id: Missing Author ${id}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Author.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new BadRequest(`id: Cannot update Author ${id}`);
        }
        await transaction.commit();
        transaction = null;
        return await Author.findByPk(id);
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

// ***** Author Name Lookups *****

exports.exact = async (firstName, lastName, queryParameters) => {
    let options = appendQueryParameters({
        where: {
            firstName: firstName,
            lastName: lastName
        }
    }, queryParameters);
    let results = await Author.findAll(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Author '${firstName} ${lastName}'`);
    }
    return results[0];
}

exports.name = async (name, queryParameters) => {
    let options = appendQueryParameters({
        order: order,
        where: {
            [Op.or]: {
                firstName: {[Op.iLike]: `%${name}%`},
                lastName: {[Op.iLike]: `%${name}%`}
            }
        }
    }, queryParameters);
    return await Author.findAll(options);
}

// ***** Author-Series Relationships *****

exports.seriesAdd = async (id, seriesId) => {
    let author = await Author.findByPk(id);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let series = await Series.findByPk(seriesId);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${seriesId}`);
    }
    if (author.libraryId !== series.libraryId) {
        throw new BadRequest(`libraryId: Author ${id} belongs to ` +
            `Library ${author.libraryId} but Series ${seriesId} belongs to ` +
            `Library ${series.libraryId}`);
    }
    let count = await AuthorSeries.count({
        where: {
            authorId: id,
            seriesId: seriesId,
        }
    });
    if (count > 0) {
        throw new BadRequest(`seriesId: Series ${seriesId} is already ` +
            `associated with Author ${id}`);
    }
    await author.addSeries(series); // returns instanceof AuthorSeries
    return series;
}

exports.seriesAll = async (id, queryParameters) => {
    let author = await Author.findByPk(id);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
    }, queryParameters);
    return await author.getSeries(options);
}

exports.seriesExact = async (id, name, queryParameters) => {
    let author = await Author.findByPk(id);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let options = appendQueryParameters({
        where: {
            name: name,
        }
    }, queryParameters);
    let results = await author.getSeries(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Series '${name}'`);
    }
    return results[0];
}

exports.seriesName = async (id, name, queryParameters) => {
    let author = await Author.findByPk(id);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let options = appendQueryParameters({
        order: [ ["name", "ASC" ]],
        where: {
            name: { [Op.iLike]: `%${name}%`},
        }
    }, queryParameters);
    return await author.getSeries(options);
}

// ***** Author-Story Relationships *****

exports.storyAdd = async (id, storyId) => {
    let author = await Author.findByPk(id);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    if (author.libraryId !== story.libraryId) {
        throw new BadRequest(`libraryId: Author ${id} belongs to ` +
            `Library ${author.libraryId} but Story ${storyId} belongs to ` +
            `Library ${story.libraryId}`);
    }
    let count = await AuthorStory.count({
        where: {
            authorId: id,
            storyId: storyId,
        }
    });
    if (count > 0) {
        throw new BadRequest(`storyId: Story ${storyId} is already ` +
            `associated with Author ${id}`);
    }
    await author.addStory(story); // returns instanceof AuthorStory
    return story;
}

exports.storyAll = async (authorId, queryParameters) => {
    let author = await Author.findByPk(authorId);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${authorId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
    }, queryParameters);
    return await author.getStories(options);
}

exports.storyExact = async (id, name, queryParameters) => {
    let author = await Author.findByPk(authorId);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
        where: {
            name: name
        }
    }, queryParameters);
    let results = await author.getStories(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Story '${name}'`);
    }
    return results[0];
}

exports.storyName = async (id, name, queryParameters) => {
    let author = await Author.findByPk(id);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
        where: {
            name: { [Op.iLike]: `%${name}%` }
        }
    }, queryParameters);
    return await author.getVolumes(options);
}

// ***** Author-Volume Relationships *****

exports.volumeAdd = async (id, volumeId) => {
    let author = await Author.findByPk(id);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let volume = await Volume.findByPk(volumeId);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${volumeId}`);
    }
    if (author.libraryId !== volume.libraryId) {
        throw new BadRequest(`libraryId: Author ${id} belongs to ` +
            `Library ${author.libraryId} but Volume ${volumeId} belongs to ` +
            `Library ${volume.libraryId}`);
    }
    let count = await AuthorVolume.count({
        where: {
            authorId: id,
            volumeId: volumeId,
        }
    });
    if (count > 0) {
        throw new BadRequest(`volumeId: Volume ${volumeId} is already ` +
            `associated with Author ${id}`);
    }
    await author.addVolume(volume); // returns instanceof AuthorVolume
    return volume;
}

exports.volumeAll = async (authorId, queryParameters) => {
    let author = await Author.findByPk(authorId);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${authorId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
    }, queryParameters);
    return await author.getVolumes(options);
}

exports.volumeExact = async (id, name, queryParameters) => {
    let author = await Author.findByPk(authorId);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
        where: {
            name: name
        }
    }, queryParameters);
    let results = await author.getVolumes(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Volume '${name}'`);
    }
    return results[0];
}

exports.volumeName = async (id, name, queryParameters) => {
    let author = await Author.findByPk(id);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
        where: {
            name: { [Op.iLike]: `%${name}%` }
        }
    }, queryParameters);
    return await author.getVolumes(options);
}
