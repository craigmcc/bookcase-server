"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Author = db.Author;
const Library = db.Library;
const Series = db.Series;
const Story = db.Story;
const BadRequest = require("../util/BadRequest");
const NotFound = require("../util/NotFound");

const fields = [
    "name",
    "notes"
];
const fieldsWithId = [...fields, "id"];
const order = [
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
    if ("" === queryParameters["withSeries"]) {
        include.push(Series);
    }
    if ("" === queryParameters["withStories"]) {
        include.push(Story);
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
    return await Library.findAll(options);
}

exports.find = async (id, queryParameters) => {
    let options = appendQueryParameters({}, queryParameters);
    let result = await Library.findByPk(id, options);
    if (!result) {
        throw new NotFound(`id: Missing Library ${id}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Library.create(data, {
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
    let result = await Library.findByPk(id);
    if (!result) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let num = await Library.destroy({
        where: { id: id }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Library ${id}`);
    }
    return result;
}

exports.update = async (id, data) => {
    let original = await Library.findByPk(id);
    if (!original) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Library.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new BadRequest(`id: Cannot update Library ${id}`);
        }
        await transaction.commit();
        transaction = null;
        return await Library.findByPk(id);
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

// ***** Library-Author Relationships (One:Many) *****

exports.authorsAll = async (id, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ]
    }, queryParameters);
    return await library.getAuthors(options);
}

exports.authorsExact = async (id, firstName, lastName, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["lastName", "ASC"], ["firstName", "ASC"] ],
        where: {
            firstName: firstName,
            lastName: lastName,
        }
    }, queryParameters);
    let results = await library.getAuthors(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Author '${firstName} ${lastName}'`);
    }
    return results[0];
}

exports.authorsName = async (id, name, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
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
    return await library.getAuthors(options);
}

// ***** Library Name Lookups *****

exports.exact = async (name, queryParameters) => {
    let options = appendQueryParameters({
        where: { name: name }
    }, queryParameters);
    let results = await Library.findAll(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Library '${name}'`);
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
    return await Library.findAll(options);
}

// ***** Library-Series Relationships (One:Many) *****

exports.seriesAll = async (id, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
    }, queryParameters);
    return await library.getSeries(options);
}

exports.seriesExact = async (id, name, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        where: {
            name: name,
        }
    }, queryParameters);
    let results = await library.getSeries(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Series '${name}'`);
    }
    return results[0];
}

exports.seriesName = async (id, name, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        order: [ ["name", "ASC" ]],
        where: {
            name: { [Op.iLike]: `%${name}%`},
        }
    }, queryParameters);
    return await library.getSeries(options);
}

// ***** Library-Story Relationships (One:Many) *****

exports.storiesAll = async (id, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
    }, queryParameters);
    return await library.getStories(options);
}

exports.storiesExact = async (id, name, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        where: {
            name: name,
        }
    }, queryParameters);
    let results = await library.getStories(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Story '${name}'`);
    }
    return results[0];
}

exports.storiesName = async (id, name, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        order: [ ["name", "ASC" ]],
        where: {
            name: { [Op.iLike]: `%${name}%`},
        }
    }, queryParameters);
    return await library.getStories(options);
}

// ***** Library-Volume Relationships (One:Many) *****

exports.volumesAll = async (id, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        joinTableAttributes: [ ], // attribute names from join table
        order: [ ["name", "ASC"] ],
    }, queryParameters);
    return await library.getVolumes(options);
}

exports.volumesExact = async (id, name, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        where: {
            name: name,
        }
    }, queryParameters);
    let results = await library.getVolumes(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Volume '${name}'`);
    }
    return results[0];
}

exports.volumesName = async (id, name, queryParameters) => {
    let library = await Library.findByPk(id);
    if (!library) {
        throw new NotFound(`id: Missing Library ${id}`);
    }
    let options = appendQueryParameters({
        order: [ ["name", "ASC" ]],
        where: {
            name: { [Op.iLike]: `%${name}%`},
        }
    }, queryParameters);
    return await library.getVolumes(options);
}
