"use strict";

// Internal Modules ----------------------------------------------------------

let AuthorSeries; // Filled in by associate()
let AuthorStory;  // Filled in by associate()
let AuthorVolume; // Filled in by associate()
let Library;      // Filled in by associate()
let Series;       // Filled in by associate()
let Story;        // Filled in by associate()
let Volume;       // Filled in by associate()

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

module.exports = (sequelize) => {

    // Author Model ----------------------------------------------------------

    class Author extends Model {
    }

    Author.init({

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },

        firstName: {
            allowNull: false,
            field: "firstname",
            type: DataTypes.STRING,
            unique: "uniqueNameWithinLibrary",
            validate: {
                notNull: {
                    msg: "firstName: Is required"
                }
            }
        },

        lastName: {
            allowNull: false,
            field: "lastname",
            type: DataTypes.STRING,
            unique: "uniqueNameWithinLibrary",
            validate: {
                notNull: {
                    msg: "lastName: Is required"
                }
            }
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

        notes: {
            allowNull: true,
            type: DataTypes.STRING,
        }

    }, {

        createdAt: "published",
        modelName: "author",
        tableName: "authors",
        timestamps: true,
        updatedAt: "updated",
        validate: {
            isNameUniqueWithinLibrary: function(next) {
                let conditions = {
                    where: {
                        firstName: this.firstName,
                        lastName: this.lastName,
                        libraryId: this.libraryId,
                    }
                };
                if (this.id) {
                    conditions.where["id"] = { [Op.ne]: this.id };
                }
                Author.count(conditions)
                    .then(found => {
                        return (found !== 0)
                            ? next(
                                `name: Name '${this.firstName} ${this.lastName}' ` +
                                "is already in use within this Library")
                            : next();
                    })
                    .catch(next);
            }

        },
        version: true,

        sequelize

    });

    // Author Associations ---------------------------------------------------

    Author.associate = (models) => {

        AuthorSeries = models.AuthorSeries;
        AuthorStory = models.AuthorStory;
        AuthorVolume = models.AuthorVolume;
        Library = models.Library;
        Series = models.Series;
        Story = models.Story;
        Volume = models.Volume;

        Author.belongsToMany(Series, { through: AuthorSeries });

        Author.belongsToMany(Story, { through: AuthorStory });

        Author.belongsTo(Library, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });

        models.Author.belongsToMany(Story, { through: AuthorStory });

        models.Author.belongsToMany(Volume, { through: AuthorVolume });

    }

    // Export Model ----------------------------------------------------------

    return Author;

}
