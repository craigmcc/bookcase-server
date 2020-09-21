"use strict";

// Internal Modules ----------------------------------------------------------

let Author;       // Filled in by associate()
let AuthorSeries; // Filled in by associate()
let Library;      // Filled in by associate()
let SeriesStory;  // Filled in by associate()
let Story;        // Filled in by associate()

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
                },
                notNull: {
                    msg: "libraryId: Is required"
                }
            }
        },

        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: "uniqueNameWithinLibrary",
            validate: {
                notNull: {
                    msg: "name: Is required"
                }
            }
        },

        notes: {
            allowNull: true,
            type: DataTypes.STRING,
        }

    }, {

        createdAt: "published",
        freezeTableName: true,
        modelName: "series",
        tableName: "series",
        timestamps: true,
        updatedAt: "updated",
        validate: {
            isNameUniqueWithinLibrary: function(next) {
                let conditions = {
                    where: {
                        libraryId: this.libraryId,
                        name: this.name
                    }
                };
                if (this.id) {
                    conditions.where["id"] = { [Op.ne]: this.id };
                }
                Series.count(conditions)
                    .then(found => {
                        return (found !== 0)
                            ? next(`name: Name '${this.name}' ` +
                                "is already in use within this Library")
                            : next();
                    })
                    .catch(next);
            }
        },
        version: true,

        sequelize

    });

    // Series Associations ---------------------------------------------------

    Series.associate = (models) => {

        Author = models.Author;
        AuthorSeries = models.AuthorSeries;
        Library = models.Library;
        SeriesStory = models.SeriesStory;
        Story = models.Story;

        Series.belongsToMany(Author, { through: AuthorSeries });

        Series.belongsTo(Library, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });

        Series.belongsToMany(Story, { through: SeriesStory });

    }

    // Export Model ----------------------------------------------------------

    return Series;

}
