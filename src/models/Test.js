const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({

    question: {
        type: String,
        required: true
    },

    answers: {
        type: Array,
        required: true
    },

    correct_answer: {
        type: Number,
        required: true
    },

},

{
    timestamps: true
},

{
    collection: 'tests'
}

);

module.exports = mongoose.model("Test", TestSchema);