const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    created_by: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
    },

    created_at: {
     type: String,
     required: true
    },
    post_text: {
        type: String,
        maxLength: 500,
    },
    post_img: {
        filename: String,
        url: String
      },
      category: {
        type: String,
        default: "Simple Post",
        enum: [
          "Simple Post",
          "Web Development",
          "Content Writing",
          "Full Stack Development",
          "Marketing",
          "Designing",
          "SEO Optimization",
          "Data Entry",
        ],
      },

      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
  {
    unique: true,
  }],
    Comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
    }],
},
);

// Create a compound index to enforce uniqueness of userId within the likes array
postSchema.index({ _id: 1, 'likes': 1 }, { unique: true });


const Post = mongoose.model('Post',postSchema);
module.exports = Post;