const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({

    type: {
        type: String,
        required: true
    },

    source: {
        type: String,
        required: true
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
    collection: 'contents'
}

);

ContentSchema.virtual('source_url').get(function() {

        if(this.type != "text")
            return `https://weblab-backend.herokuapp.com/files/${this.source}`
        else
            return `${this.source}`

})

module.exports = mongoose.model("Content", ContentSchema);