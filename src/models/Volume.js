"use strict";

// Internal Modules ----------------------------------------------------------

let Library;      // Filled in by associate()
let Story;        // Filled in by associate()
let VolumeStory;  // Filled in by associate()

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

module.exports = (sequelize) => {

    // Volume Model ----------------------------------------------------------

    class Volume extends Model {
    }

    Volume.init({

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },

        isbn: {
            allowNull: true,
            type: DataTypes.STRING
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

        location: {
            allowNull: true,
            type: DataTypes.STRING,
        },

        media: {
            allowNull: true,
            type: DataTypes.STRING,
            validate: {
                isValidValue: function(value, next) {
                    if (value) {
                        if (validMediaValues.includes(value)) {
                            next();
                        } else {
                            next(`media: Value '${value}' is not one of ${validMediaValues}`);
                        }
                    } else {
                        next();
                    }
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
        },

        read: {
            allowNull: true,
            type: DataTypes.BOOLEAN
        }

    }, {

        createdAt: "published",
        freezeTableName: true,
        modelName: "volume",
        tableName: "volumes",
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
                Volume.count(conditions)
                    .then(found => {
                        return (found !== 0)
                            ? next(`name: Name '${this.name}' ` +
                                "is already in use within this Library")
                            : next();
                    })
                    .catch(next);
            },
        },
        version: true,

        sequelize

    });

    let validMediaValues = [
        "Book",      // Physical book
        "Kindle",    // Downloaded to Kindle app as purchased
        "Kobo",      // Downloaded to Kobo app
        "PDF",       // Downloaded as a PDF
        "Returned",  // Returned to Kindle Unlimited but available to reload
        "Unlimited", // Downloaded to Kindle app as Unlimited
        "Unknown",   // Unknown media type
        "Watch",     // Not yet purchased or downloaded
    ];

    // Volume Associations ---------------------------------------------------

    Volume.associate = (models) => {

        Library = models.Library;
        Story = models.Story;
        VolumeStory = models.VolumeStory;

        Volume.belongsTo(Library, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });

        Volume.belongsToMany(Story, { through: VolumeStory });

    }

    // Export Model ----------------------------------------------------------

    return Volume;

}
