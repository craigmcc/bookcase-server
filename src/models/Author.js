"use strict";

// Internal Modules ----------------------------------------------------------

let Library; // Filled in by associate()

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

module.exports = (sequelize) => {

    // Author Model ----------------------------------------------------------

    class Author extends Model {
    }

    Author.init({

        firstName: {
            allowNull: false,
            field: "firstname",
            type: DataTypes.STRING,
            unique: "uniqueNameWithinLibrary",
            validate: { } // TODO - field level validations
        },

        lastName: {
            allowNull: false,
            field: "lastname",
            type: DataTypes.STRING,
            unique: "uniqueNameWithinLibrary",
            validate: { } // TODO - field level validations
        },

        libraryId: {
            allowNull: false,
            field: "libraryid",
            type: DataTypes.INTEGER,
            unique: "uniqueNameWithinLibrary",
            validate: { } // TODO - field level validations
        },

        notes: {
            allowNull: true,
            type: DataTypes.STRING,
        }

    }, {

        createdAt: "published",
        modelName: "author",
        tableName: "author",
        timestamps: true,
        updatedAt: "updated",
        validate: { }, // TODO - class level validations
        version: true,

        sequelize

    });

    // Author Associations ---------------------------------------------------

    Author.associate = (models) => {

//        models.Author.belongsToMany(models.Series, { through: AuthorSeries });

        Library = models.Library;
        models.Author.belongsTo(models.Library, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });

//        models.Author.belongsToMany(models.Story, { through: AuthorStory });

//        models.Author.belongsToMany(models.Volume, { through: AuthorVolume });

    }

    // Export Model ----------------------------------------------------------

    return Author;

}
