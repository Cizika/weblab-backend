const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        text:true
    },

    email: {
        type: String,
        required:true
    },

    password: {
        type: String,
        required: true
    },

    title: String,

    avatar: String,

    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],

    achievements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievements'
    }],

    admin: {
        type:Boolean,
        required: true
    },

    completed_modules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }]

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
    collection: 'users'
}
);

UserSchema.virtual('avatar_url').get(function() {
    return `https://weblab-backend.herokuapp.com/files/${this.avatar}`
  })

UserSchema.pre('save', async function(next) {
    if(this.isNew){
        const hash = await bcrypt.hash(this.password, 8)
        this.password = hash
    }
    // console.log(hash)
    console.log('Hello from pre save')
    next()
})

UserSchema.pre('updateOne', async function(next) {
    
    const data = this.getUpdate()
    if(data.password){
        data.password = await bcrypt.hash(data.password, 8)
        await this.update({}, data).exec()
    }
    next()
})

module.exports = mongoose.model("User", UserSchema);