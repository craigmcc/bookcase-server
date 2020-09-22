"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {

    // AuthorStory Model ----------------------------------------------------

    class AuthorStory extends Model {
    }

    AuthorStory.init({

        authorId: {
            allowNull: false,
            field: "authorid",
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
        }

    }, {

        createdAt: "published",
        modelName: "authorstory",
        tableName: "authors_stories",
        timestamps: false,
        updatedAt: "updated",
//        validate: { }, // TODO - class level validations
        version: false,

        sequelize

    });

    // AuthorStory Associations ---------------------------------------------

    AuthorStory.associate = (models) => {

        // Nothing further

    }

    // Export Model ----------------------------------------------------------

    return AuthorStory;

}
