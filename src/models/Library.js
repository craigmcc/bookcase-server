"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {

    // Library Model ---------------------------------------------------------

    class Library extends Model {
    }

    Library.init({

        // TODO - has many authors;

        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: { } // TODO - field level validations
        },

        notes: {
            allowNull: true,
            type: DataTypes.STRING,
        },

    }, {

        createdAt: "published",
        modelName: "library",
        tableName: "library",
        timestamps: true,
        updatedAt: "updated",
        validate: { }, // TODO - class level validations
        version: true,

        sequelize

    });

    // Library Associations --------------------------------------------------

    Library.associate = (models) => {

/*
        models.Library.hasMany(models.Author);

        models.Library.hasMany(models.Series);

        models.Library.hasMany(models.Volume);
*/

    }

    // Export Model ----------------------------------------------------------

    return Library;

}
