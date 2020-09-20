"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {

    // VolumeStory Model ----------------------------------------------------

    class VolumeStory extends Model {
    }

    VolumeStory.init({

/*
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },
*/

        storyId: {
            allowNull: false,
            field: "storyid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin", // TODO - do we need database enforcement?

        },

        volumeId: {
            allowNull: false,
            field: "volumeid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin", // TODO - do we need database enforcement?
            validate: { } // TODO - field level validations
        },

    }, {

        createdAt: "published",
        modelName: "volumestory",
        tableName: "volumesstories",
        timestamps: false,
        updatedAt: "updated",
        validate: { }, // TODO - class level validations
        version: false,

        sequelize

    });

    // VolumeStory Associations ---------------------------------------------

    VolumeStory.associate = (models) => {

        // Nothing further?

    }

    // Export Model ----------------------------------------------------------

    return VolumeStory;

}
