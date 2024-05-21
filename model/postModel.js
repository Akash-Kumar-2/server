const mongoose = require('mongoose');
const User = require('./userModel');

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
       type: String,
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    replies: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true,
            },
            userProfilePic: {
                type: String,
            },
            username: {
                type: String,
            },
    }],
},
{
    timestamps: true
});

const Post = mongoose.Mpdel('Post',postSchema);
module.exports = Post;