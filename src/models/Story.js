"use strict";

// Internal Modules ----------------------------------------------------------

let Author;       // Filled in by associate()
let AuthorStory;  // Filled in by associate()
let Library;      // Filled in by associate()
let Series;       // Filled in by associate()
let SeriesStory;  // Filled in by associate()
let Volume;       // Filled in by associate()
let VolumeStory;  // Filled in by associate()

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

module.exports = (sequelize) => {

    // Story Model ----------------------------------------------------------

    class Story extends Model {
    }

    Story.init({

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
        modelName: "story",
        tableName: "stories",
        timestamps: false,
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
                Story.count(conditions)
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

    // Story Associations ---------------------------------------------------

    Story.associate = (models) => {

        Author = models.Author;
        AuthorStory = models.AuthorStory;
        Library = models.Library;
        Series = models.Series;
        SeriesStory = models.SeriesStory;
        Volume = models.Volume;
        VolumeStory = models.VolumeStory;

        Story.belongsToMany(Author, { through: AuthorStory });

        Story.belongsTo(Library, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });

        Story.belongsToMany(Series, { through: SeriesStory });

        Story.belongsToMany(Volume, { through: VolumeStory });

    }

    // Export Model ----------------------------------------------------------

    return Story;

}
