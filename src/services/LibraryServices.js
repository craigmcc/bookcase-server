"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Library = db.Library;
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

// Standard CRUD Methods -----------------------------------------------------

exports.all = async () => {
    let conditions = {
        order: order
    }
    return await Library.findAll(conditions);
}

exports.find = async (id) => {
    let result = await Library.findByPk(id);
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

exports.exact = async (name) => {
    let conditions = {
        where: { name: name }
    }
    let results = await Library.findAll(conditions);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Library '${name}'`);
    }
    return results[0];
}

exports.name = async (name) => {
    let conditions = {
        order: order,
        where: {
            name: { [Op.iLike]: `%${name}%` }
        }
    }
    return await Library.findAll(conditions);
}
