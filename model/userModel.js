const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
name: {
    type: String,
    required: true
},
username: {
    type: String,
    required: true,
    unique: true
},
email: {
  type: String,
  required: true,
  unique: true  
},
password: {
  type: String,
  minLength: 8,
  required: true
},
role: {
    type: String,
    enum:['Job Seeker', 'Recruiter','admin'],
    default: 'Job Seeker'
},
profilePic: {
    type: String,
    deafult: ""
},
connections: {
    type:[String],
    default: []
},
bio: {
    type: String,
    default: ''
},
isFrozen :{
    type: Boolean,
    default: false
}
},
{
    timestamps: true
});

userSchema.pre('save',async function(next) {

    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
})

userSchema.methods.correctPassword = async function(
  CandidatePassword,
  userPassword
) {
  return await bcrypt.compare(CandidatePassword,userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;