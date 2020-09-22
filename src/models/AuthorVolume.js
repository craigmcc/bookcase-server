"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {

    // AuthorVolume Model ----------------------------------------------------

    class AuthorVolume extends Model {
    }

    AuthorVolume.init({

        authorId: {
            allowNull: false,
            field: "authorid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin",
//            validate: { } // TODO - field level validations
        },

        volumeId: {
            allowNull: false,
            field: "volumeid",
            type: DataTypes.BIGINT,
            unique: "uniqueJoin",
//            validate: { } // TODO - field level validations
        }

    }, {

        createdAt: "published",
        modelName: "authorvolume",
        tableName: "authors_volumes",
        timestamps: false,
        updatedAt: "updated",
//        validate: { }, // TODO - class level validations
        version: false,

        sequelize

    });

    // AuthorVolume Associations ---------------------------------------------

    AuthorVolume.associate = (models) => {

        // Nothing further

    }

    // Export Model ----------------------------------------------------------

    return AuthorVolume;

}
