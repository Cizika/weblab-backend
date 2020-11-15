const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },

    title: {
        type:String,
        required:true
    },

    description: {
        type: String,
        required:true
    },

    field: {
        type:String,
        required:true
    },
    
    value: {
        type:String,
        required:true
    },

    operator: {
        type:String,
        required:true
    }

},
{
    collection: 'achievements'
}
);

module.exports = mongoose.model("Achievement", AchievementSchema);