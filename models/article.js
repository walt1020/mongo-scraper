const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    summary: {
        type: String
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

const Articles = mongoose.model("Articles", ArticleSchema);

module.exports = Articles;