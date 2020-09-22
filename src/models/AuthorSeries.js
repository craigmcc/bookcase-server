"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {

    // AuthorSeries Model ----------------------------------------------------

    class AuthorSeries extends Model {
    }

    AuthorSeries.init({

        authorId: {
            allowNull: false,
            field: "authorid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin",
//            validate: { } // TODO - field level validations
        },

        seriesId: {
            allowNull: false,
            field: "seriesid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin",
//            validate: { } // TODO - field level validations
        }

    }, {

        createdAt: "published",
        modelName: "authorseries",
        tableName: "authors_series",
        timestamps: false,
        updatedAt: "updated",
//        validate: { }, // TODO - class level validations
        version: false,

        sequelize

    });

    // AuthorSeries Associations ---------------------------------------------

    AuthorSeries.associate = (models) => {

        // Nothing further

    }

    // Export Model ----------------------------------------------------------

    return AuthorSeries;

}
