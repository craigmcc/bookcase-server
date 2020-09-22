"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {

    // VolumeStory Model ----------------------------------------------------

    class VolumeStory extends Model {
    }

    VolumeStory.init({

        // Make the generated primary key volumeId then storyId

        volumeId: {
            allowNull: false,
            field: "volumeid",
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
        modelName: "volumestory",
        tableName: "volumes_stories",
        timestamps: false,
        updatedAt: "updated",
//        validate: { }, // TODO - class level validations
        version: false,

        sequelize

    });

    // VolumeStory Associations ---------------------------------------------

    VolumeStory.associate = (models) => {

        // Nothing further

    }

    // Export Model ----------------------------------------------------------

    return VolumeStory;

}
