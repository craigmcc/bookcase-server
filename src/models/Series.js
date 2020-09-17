"use strict";

// Internal Modules ----------------------------------------------------------

let Author;       // Filled in by associate()
let AuthorSeries; // Filled in by associate()
let Library;      // Filled in by associate()

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

module.exports = (sequelize) => {

    // Series Model ----------------------------------------------------------

    class Series extends Model {
    }

    Series.init({

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },

        libraryId: {
            allowNull: false,
            field: "libraryid",
            type: DataTypes.BIGINT,
            unique: "uniqueNameWithinLibrary",
            validate: {
                isValidLibraryId: function (value, next) {
                    Library.findByPk(value)
                        .then(library => {
                            if (library) {
                                next();
                            } else {
                                next(`libraryId: Missing Library ${value}`);
                            }
                        })
                        .catch(next);
                }
            }
        },

        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: "uniqueNameWithinLibrary",
        },

        notes: {
            allowNull: true,
            type: DataTypes.STRING,
        }

    }, {

        createdAt: "published",
        modelName: "series",
        tableName: "series",
        timestamps: true,
        updatedAt: "updated",
        validate: { }, // TODO - class level validations

        sequelize

    });

    // Series Associations ---------------------------------------------------

    Series.associate = (models) => {

        Author = models.Author;
        AuthorSeries = models.AuthorSeries;
        Library = models.Library;

        Series.belongsToMany(Author, { through: AuthorSeries });

        Series.belongsTo(Library, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });

        // Series -> Story is really 1:N (but with ordinal in a join table?)

    }

    // Export Model ----------------------------------------------------------

    return Series;

}