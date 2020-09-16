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
        },

        lastName: {
            allowNull: false,
            field: "lastname",
            type: DataTypes.STRING,
            unique: "uniqueNameWithinLibrary",
        },

        libraryId: {
            allowNull: false,
            field: "libraryid",
            type: DataTypes.INTEGER,
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
