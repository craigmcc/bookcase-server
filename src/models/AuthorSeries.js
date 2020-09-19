"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {

    // AuthorSeries Model ----------------------------------------------------

    class AuthorSeries extends Model {
    }

    AuthorSeries.init({

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },

        authorId: {
            allowNull: false,
            field: "authorid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin", // TODO - do we need database enforcement?
            validate: { } // TODO - field level validations
        },

        seriesId: {
            allowNull: false,
            field: "seriesid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin", // TODO - do we need database enforcement?

        }

    }, {

        createdAt: "published",
        modelName: "authorseries",
        tableName: "authorseries",
        timestamps: true,
        updatedAt: "updated",
        validate: { }, // TODO - class level validations

        sequelize

    });

    // AuthorSeries Associations ---------------------------------------------

    AuthorSeries.associate = (models) => {

        // Nothing further?

    }

    // Export Model ----------------------------------------------------------

    return AuthorSeries;

}
