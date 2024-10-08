const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Friend Request", "Commented", "Liked", "Posted"],
    required: true,
  },
  sent_by: {
    type: mongoose.Schema.Types.ObjectId, //Not necessary to add full details
    ref: "User",
  },
  sent_at: {
    type: String,
    required: true,
  },
  url: {
    type: "String",
    required: true,
  },
});

const Notification = mongoose.Model("Notification", notificationSchema);

module.exports = Notification;
