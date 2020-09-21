"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Author = db.Author;
const AuthorSeries = db.AuthorSeries;
const Library = db.Library;
const Series = db.Series;

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
    /*
        if ("" === queryParameters["withStories"]) {
            include.push(Story);
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
    return await Series.findAll(options);
}

exports.find = async (id, queryParameters) => {
    let options = appendQueryParameters({}, queryParameters);
    let result = await Series.findByPk(id, options);
    if (!result) {
        throw new NotFound(`id: Missing Series ${id}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Series.create(data, {
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
    let result = await Series.findByPk(id);
    if (!result) {
        throw new NotFound(`id: Missing Series ${id}`);
    }
    let num = await Series.destroy({
        where: { id: id }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Series ${id}`);
    }
    return result;
}

exports.update = async (id, data) => {
    let original = await Series.findByPk(id);
    if (!original) {
        throw new NotFound(`id: Missing Series ${id}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Series.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new BadRequest(`id: Cannot update Series ${id}`);
        }
        await transaction.commit();
        transaction = null;
        return await Series.findByPk(id);
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

// ***** Series Name Lookups *****

exports.exact = async (name, queryParameters) => {
    let options = appendQueryParameters({
        where: { name: name }
    }, queryParameters);
    let results = await Series.findAll(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Series '${name}'`);
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
    return await Series.findAll(options);
}

// ***** Series-Author Relationships (Many:Many) *****

exports.authorAdd = async (id, authorId) => {
    let series = await Series.findByPk(id);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${id}`);
    }
    let author = await Author.findByPk(authorId);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${authorId}`);
    }
    if (series.libraryId !== author.libraryId) {
        throw new BadRequest(`libraryId: Series ${id} belongs to ` +
            `Library ${series.libraryId} but Author ${authorId} belongs to ` +
            `Library ${author.libraryId}`);
    }
    let count = await AuthorSeries.count({
        where: {
            authorId: authorId,
            seriesId: id
        }
    });
    if (count > 0) {
        throw new BadRequest(`authorId: Author ${authorId} is already ` +
            `associated with Series ${id}`);
    }
    await series.addAuthor(author); // returns instanceof AuthorSeries
    return author;
}

exports.authorAll = async (seriesId, queryParameters) => {
    let series = await Series.findByPk(seriesId);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${seriesId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
    }, queryParameters);
    return await series.getAuthors(options);
}

exports.authorExact = async (id, firstName, lastName, queryParameters) => {
    let series = await Series.findByPk(seriesId);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
        where: {
            firstName: firstName,
            lastName: lastName,
        }
    }, queryParameters);
    let results = await series.getAuthors(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Author '${firstName} ${lastName}'`);
    }
    return results[0];
}

exports.authorName = async (id, name, queryParameters) => {
    let series = await Series.findByPk(id);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${id}`);
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
    return await series.getAuthors(options);
}

exports.authorRemove = async (id, authorId) => {
    let series = await Series.findByPk(id);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${id}`);
    }
    let author = await Author.findByPk(authorId);
    if (!author) {
        throw new NotFound(`authorId: Missing Author ${authorId}`);
    }
    if (series.libraryId !== author.libraryId) {
        throw new BadRequest(`libraryId: Series ${id} belongs to ` +
            `Library ${series.libraryId} but Author ${authorId} belongs to ` +
            `Library ${author.libraryId}`);
    }
    let count = await AuthorSeries.count({
        where: {
            authorId: authorId,
            seriesId: id
        }
    });
    if (count === 0) {
        throw new BadRequest(`authorId: Author ${authorId} is not ` +
            `associated with Series ${id}`);
    }
    await series.removeAuthor(author); // returns instanceof AuthorSeries
    return author;
}

// ***** Series-Story Relationships (Many:Many) *****

exports.storyAdd = async (id, storyId) => {
    let series = await Series.findByPk(id);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${id}`);
    }
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    if (series.libraryId !== story.libraryId) {
        throw new BadRequest(`libraryId: Series ${id} belongs to ` +
            `Library ${series.libraryId} but Story ${storyId} belongs to ` +
            `Library ${story.libraryId}`);
    }
    let count = await StorySeries.count({
        where: {
            storyId: storyId,
            seriesId: id
        }
    });
    if (count > 0) {
        throw new BadRequest(`storyId: Story ${storyId} is already ` +
            `associated with Series ${id}`);
    }
    await series.addStory(story); // returns instanceof StorySeries
    return story;
}

exports.storyAll = async (seriesId, queryParameters) => {
    let series = await Series.findByPk(seriesId);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${seriesId}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
    }, queryParameters);
    return await series.getStorys(options);
}

exports.storyExact = async (id, firstName, lastName, queryParameters) => {
    let series = await Series.findByPk(seriesId);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
        where: {
            firstName: firstName,
            lastName: lastName,
        }
    }, queryParameters);
    let results = await series.getStorys(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Story '${firstName} ${lastName}'`);
    }
    return results[0];
}

exports.storyName = async (id, name, queryParameters) => {
    let series = await Series.findByPk(id);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${id}`);
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
    return await series.getStorys(options);
}

exports.storyRemove = async (id, storyId) => {
    let series = await Series.findByPk(id);
    if (!series) {
        throw new NotFound(`seriesId: Missing Series ${id}`);
    }
    let story = await Story.findByPk(storyId);
    if (!story) {
        throw new NotFound(`storyId: Missing Story ${storyId}`);
    }
    if (series.libraryId !== story.libraryId) {
        throw new BadRequest(`libraryId: Series ${id} belongs to ` +
            `Library ${series.libraryId} but Story ${storyId} belongs to ` +
            `Library ${story.libraryId}`);
    }
    let count = await StorySeries.count({
        where: {
            storyId: storyId,
            seriesId: id
        }
    });
    if (count === 0) {
        throw new BadRequest(`storyId: Story ${storyId} is not ` +
            `associated with Series ${id}`);
    }
    await series.removeStory(story); // returns instanceof AuthorSeries
    return story;
}
