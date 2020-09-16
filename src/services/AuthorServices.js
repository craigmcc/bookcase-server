"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Author = db.Author;
const Library = db.Library;
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

// Standard CRUD Methods -----------------------------------------------------

exports.all = async () => {
    let conditions = {
        order: order
    }
    return await Author.findAll(conditions);
}

exports.find = async (id) => {
    let result = await Author.findByPk(id);
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

exports.authorAll = async (libraryId) => {
    let library = await Library.findByPk(libraryId);
    if (!library) {
        throw new NotFound(`libraryId: Missing Library ${libraryId}`);
    }
    let conditions = {
        order: order,
        where: {
            libraryId : libraryId
        }
    }
    return await Author.findAll(conditions);
}

exports.authorExact = async (libraryId, firstName, lastName) => {
    let library = await Library.findByPk(libraryId);
    if (!library) {
        throw new NotFound(`libraryId: Missing Library ${libraryId}`);
    }
    let conditions = {
        where: {
            firstName: firstName,
            lastName: lastName,
            libraryId: libraryId,
        }
    }
    let results = await Author.findAll(conditions);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Author '${firstName} ${lastName}'`);
    }
    return results[0];
}

exports.authorName = async (libraryId, name) => {
    let library = await Library.findByPk(libraryId);
    if (!library) {
        throw new NotFound(`libraryId: Missing Library ${libraryId}`);
    }
    let conditions = {
        order: order,
        where: {
            facilityId: facilityId,
            [Op.or]: {
                firstName: {[Op.iLike]: `%${name}%`},
                lastName: {[Op.iLike]: `%${name}%`}
            }
        }
    }
    return await Author.findAll(conditions);
}
