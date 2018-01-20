const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    title: {
        type: String
    },
    body: {
        type: String
    }
});

const Notes = mongoose.model("Notes", NoteSchema);

module.exports = Notes;