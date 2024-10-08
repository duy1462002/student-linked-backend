const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const OrganizationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId, //the owner of Organization
    ref: "User",
    required: true
  },
  members: [
    {
      user: { //the list of members
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
      }
    }
  ],
  posts: [
    {
      user: { //the list of post in the group
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Post"
      }
    }
  ],
  coverImage: {
    type: String,
    maxlength: 300,
    trim: true,
    default: "cover-page.png"
  },
  hashtag: {
    type: String,
    required: true,
    maxlength: 20,
    trim: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 128,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 250,
    trim: true
  },
  rules: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String
    },
    coordinates: { type: [], default: undefined },
    address: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OrganizationSchema.index({ hashtag: "text", name: "text"});

module.exports = mongoose.model("Organization", OrganizationSchema);
