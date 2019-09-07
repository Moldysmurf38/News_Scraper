var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var noteSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
        
    }
    ,
    body: {
        type: String,
        required: true,
        unique: true
    }
});

var note = mongoose.model("notes", noteSchema);

module.exports = note;