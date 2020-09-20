"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Author = db.Author;
const AuthorVolume = db.AuthorVolume;
const Library = db.Library;
const Story = db.Story;
const Volume = db.Volume;
const VolumeStory = db.VolumeStory;

const BadRequest = require("../util/BadRequest");
const NotFound = require("../util/NotFound");

const fields = [
    "isbn",
    "libraryId",
    "location",
    "media",
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
    if ("" === queryParameters["withStories"]) {
        include.push(Story);
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
    return await Volume.findAll(options);
}

exports.find = async (id, queryParameters) => {
    let options = appendQueryParameters({}, queryParameters);
    let result = await Volume.findByPk(id, options);
    if (!result) {
        throw new NotFound(`id: Missing Volume ${id}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Volume.create(data, {
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
    let result = await Volume.findByPk(id);
    if (!result) {
        throw new NotFound(`id: Missing Volume ${id}`);
    }
    let num = await Volume.destroy({
        where: { id: id }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Volume ${id}`);
    }
    return result;
}

exports.update = async (id, data) => {
    let original = await Volume.findByPk(id);
    if (!original) {
        throw new NotFound(`id: Missing Volume ${id}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Volume.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new BadRequest(`id: Cannot update Volume ${id}`);
        }
        await transaction.commit();
        transaction = null;
        return await Volume.findByPk(id);
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

exports.authorAdd = async (id, authorId) => {
    let volume = await Volume.findByPk(id);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${id}`);
    }
    let author = await Author.findByPk(authorId);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${authorId}`);
    }
    if (volume.libraryId !== author.libraryId) {
        throw new BadRequest(`libraryId: Volume ${id} belongs to ` +
            `Library ${volume.libraryId} but Author ${authorId} belongs to ` +
            `Library ${author.libraryId}`);
    }
    let count = await AuthorVolume.count({
        where: {
            authorId: authorId,
            volumeId: id
        }
    });
    if (count > 0) {
        throw new BadRequest(`authorId: Author ${authorId} is already ` +
            `associated with Volume ${id}`);
    }
    await volume.addAuthor(author); // returns instanceof AuthorVolume
    return author;
}

exports.authorAll = async (volumeId, queryParameters) => {
    let volume = await Volume.findByPk(volumeId);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${volumeId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
    }, queryParameters);
    return await volume.getAuthors(options);
}

exports.authorExact = async (id, firstName, lastName, queryParameters) => {
    let volume = await Volume.findByPk(volumeId);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
        where: {
            firstName: firstName,
            lastName: lastName,
        }
    }, queryParameters);
    let results = await volume.getAuthors(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Author '${firstName} ${lastName}'`);
    }
    return results[0];
}

exports.authorName = async (id, name, queryParameters) => {
    let volume = await Volume.findByPk(id);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${id}`);
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
    return await volume.getAuthors(options);
}

exports.exact = async (name, queryParameters) => {
    let options = appendQueryParameters({
        where: { name: name }
    }, queryParameters);
    let results = await Volume.findAll(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Volume '${name}'`);
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
    return await Volume.findAll(options);
}

exports.storyAdd = async (id, storyId) => {
    let volume = await Volume.findByPk(id);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${id}`);
    }
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    if (volume.libraryId !== story.libraryId) {
        throw new BadRequest(`libraryId: Volume ${id} belongs to ` +
            `Library ${volume.libraryId} but Story ${storyId} belongs to ` +
            `Library ${story.libraryId}`);
    }
    let count = await VolumeStory.count({
        where: {
            storyId: storyId,
            volumeId: id
        }
    });
    if (count > 0) {
        throw new BadRequest(`storyId: Story ${storyId} is already ` +
            `associated with Volume ${id}`);
    }
    await volume.addStory(story); // returns instanceof VolumeStory
    return story;
}

exports.storyAll = async (volumeId, queryParameters) => {
    let volume = await Volume.findByPk(volumeId);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${volumeId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
    }, queryParameters);
    return await volume.getStories(options);
}

exports.storyExact = async (id, name, queryParameters) => {
    let volume = await Volume.findByPk(volumeId);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
        where: {
            name: name
        }
    }, queryParameters);
    let results = await volume.getStories(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Story '${name}'`);
    }
    return results[0];
}

exports.storyName = async (id, name, queryParameters) => {
    let volume = await Volume.findByPk(id);
    if (!volume) {
        throw new NotFound(`volumeId: Missing Volume ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
        where: {
            name: { [Op.iLike]: `%${name}%` }
        }
    }, queryParameters);
    return await volume.getStories(options);
}
