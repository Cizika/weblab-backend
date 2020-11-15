const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'items.type'
        },
        type: {
            type: String,
            required: true,
            enum: ['Test', 'Content']
        }
    }]

},

{
    timestamps: true
},

{
    collection: 'modules'
}

);

module.exports = mongoose.model("Module", ModuleSchema);