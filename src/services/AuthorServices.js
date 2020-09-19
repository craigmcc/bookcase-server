"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Author = db.Author;
const Library = db.Library;
const Series = db.Series;
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
