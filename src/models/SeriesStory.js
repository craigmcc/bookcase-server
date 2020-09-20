"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {

    // SeriesStory Model ----------------------------------------------------

    class SeriesStory extends Model {
    }

    SeriesStory.init({

/*
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },
*/

        ordinal: {
            allowNull: true,    // TODO: should be false?
            type: DataTypes.SMALLINT,
            validate: { }       // TODO: must be positive
        },

        seriesId: {
            allowNull: false,
            field: "seriesid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin", // TODO - do we need database enforcement?
            validate: { } // TODO - field level validations
        },

        storyId: {
            allowNull: false,
            field: "storyid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin", // TODO - do we need database enforcement?

        },

    }, {

        createdAt: "published",
        modelName: "seriesstory",
        tableName: "seriesstories",
        timestamps: false,
        updatedAt: "updated",
        validate: { }, // TODO - class level validations
        version: false,

        sequelize

    });

    // SeriesStory Associations ---------------------------------------------

    SeriesStory.associate = (models) => {

        // Nothing further?

    }

    // Export Model ----------------------------------------------------------

    return SeriesStory;

}
