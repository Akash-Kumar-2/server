const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
name: {
    type: String,
    required: [true, 'Please tell us your name!']
},
username: {
    type: String,
    required: [true, 'User must have a Username'],
    unique: true
},
email: {
  type: String,
  required: [true, 'User must have an Email'],
  validate: [validator.isEmail, 'Please enter a valid email'],
  unique: true,
  lowercase: true  
},
gender: {
    type: String,
    required: true,
    enum: ["male", "female","others"],
    default: ''
  },
  password: {
    type: String,
    required: [true, "A User must have a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    select:false,
    required: [true, "Please Confirm Your Password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password And Confirm Password Do not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
role: {
    type: String,
    enum:['user','admin'],
    default: 'user'
},
userType: {
  type:String,
  enum:['Recruiter','Job-Seeker'],
  default: 'Job-Seeker'
},
dob: {
  type: String,
},
profilePic: {
    type: String,
    deafult: ''
},
friends: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],

friend_requests: [
  {
    sent_by: {
      type: mongoose.Schema.Types.ObjectId, // Not necessary to add full details
      ref: "User"
    },
    sent_at: {
      type: Date,
      required: true
    },
    isSent: {
      type: Boolean,
      default: false
    }
  }
],
bio: {
    type: String,
    default: ''
},
verificationCode:{
  type:String,
  select:false,
},
notifications: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification"
  }
],
isFrozen :{
    type: Boolean,
    default: false
},
active: {
    type: Boolean,
    default: false
}
},
{
    timestamps: true
});


userSchema.pre('save', async function(next) {
    //check if password is mmodified or not
    if (!this.isModified('password')) return next();
  
    //encrpt password
    this.password = await bcrypt.hash(this.password, 12);
    //we only need for validation so after it remove it
    this.passwordConfirm = undefined;
  });

  
  userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });



  //Query Middleware
  // userSchema.pre(/^find/, function(next) {
  //   if(!this.verificationCode)
  //   this.find({ active: { $ne: false } });

  //   next();
  // });
   
  userSchema.methods.correctPassword = async function(
    CandidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(CandidatePassword,userPassword);
  };

  userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimeStamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      return JWTTimestamp < changedTimeStamp;
    }
  
    return false;
  };
  
  userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };
  userSchema.methods.createVerificationCode = function() {
    const verificationCode = crypto.randomBytes(32).toString('hex');
    this.verificationCode = crypto.createHash('sha256').update(verificationCode).digest('hex');
    return verificationCode;
  };

const User = mongoose.model('User', userSchema);
module.exports = User;