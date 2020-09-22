"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {

    // SeriesStory Model ----------------------------------------------------

    class SeriesStory extends Model {
    }

    SeriesStory.init({

        ordinal: {
            allowNull: true,    // TODO: should be false?
            type: DataTypes.SMALLINT,
            validate: { }       // TODO: must be positive
        },

        seriesId: {
            allowNull: false,
            field: "seriesid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin",
//            validate: { } // TODO - field level validations
        },

        storyId: {
            allowNull: false,
            field: "storyid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin",
//            validate: { } // TODO - field level validations
        },

    }, {

        createdAt: "published",
        modelName: "seriesstory",
        tableName: "series_stories",
        timestamps: false,
        updatedAt: "updated",
//        validate: { }, // TODO - class level validations
        version: false,

        sequelize

    });

    // SeriesStory Associations ---------------------------------------------

    SeriesStory.associate = (models) => {

        // Nothing further

    }

    // Export Model ----------------------------------------------------------

    return SeriesStory;

}
