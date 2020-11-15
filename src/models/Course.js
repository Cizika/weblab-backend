const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        text:true
    },

    description: {
        type: String,
        required:true
    },

    thumbnail:{
        type: String,
        required: true
    },

    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    modules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }],

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }

},
 {
    toJSON: {
      virtuals: true,
    },
},
{
    timestamps: true
},
{
    collection: 'courses'
});


CourseSchema.virtual('thumbnail_url').get(function() {
    return `https://weblab-backend.herokuapp.com/files/${this.thumbnail}`
  })

module.exports = mongoose.model("Course", CourseSchema);