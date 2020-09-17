"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Author = db.Library;
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

exports.seriesAll = async (libraryId, queryParameters) => {
    let library = await Library.findByPk(libraryId);
    if (!library) {
        throw new NotFound(`libraryId: Missing Library ${libraryId}`);
    }
    let options = appendQueryParameters({
        order: order,
        where: {
            libraryId: libraryId
        }
    }, queryParameters);
    return await Series.findAll(options);
}

exports.seriesExact = async (libraryId, name, queryParameters) => {
    let library = await Library.findByPk(libraryId);
    if (!library) {
        throw new NotFound(`libraryId: Missing Library ${libraryId}`);
    }
    let options = appendQueryParameters({
        where: {
            libraryId: libraryId,
            name: name,
        }
    }, queryParameters);
    let results = await Series.findAll(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Series '${name}'`);
    }
    return results[0];
}

exports.seriesName = async (libraryId, name, queryParameters) => {
    let library = await Library.findByPk(libraryId);
    if (!library) {
        throw new NotFound(`libraryId: Missing Library ${libraryId}`);
    }
    let options = appendQueryParameters({
        order: order,
        where: {
            libraryId: libraryId,
            name: { [Op.iLike]: `%${name}%`},
        }
    }, queryParameters);
    return await Series.findAll(options);
}
