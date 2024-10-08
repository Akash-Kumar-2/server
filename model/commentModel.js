const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  creator_name: {
    type: String,
    required: true,
  },

  creator_profile_photo: {
    filename: {
      type: String,
      default: "Post_Image",
    },
    url: String,
  },

  creator_id: {
    type: String,
    required: true,
  },
  
  created_on: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },

  created_at: {
    type: String,
    required: true,
  },

  comment_text: String,

  comment_img: {
    filename: {
      type: String,
      default: "Post_Image",
    },
    url: String,
  },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// Adding an index to creator_id for faster querying
commentSchema.index({ creator_id: 1 });

let Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
