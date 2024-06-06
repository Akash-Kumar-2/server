const mongoose = require('mongoose');
const User = require('./userModel');
const Comment = require('./commentModel');

const postSchema = new mongoose.Schema({
    postedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
    },
    text: {
        type: String,
        maxLength: 500,
    },
    img: {
        filename: {
          type: String,
          default: "Post_Image",
        },
        url: String,
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    Comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
    }],
},
{
    timestamps: true
});

// Create a compound index to enforce uniqueness of userId within the likes array
postSchema.index({ _id: 1, 'likes': 1 }, { unique: true });


const Post = mongoose.model('Post',postSchema);
module.exports = Post;