const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  demand: {
    type: mongoose.Schema.ObjectId,
    ref: 'Demand',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'মন্তব্য লিখুন'],
    maxlength: [1000, 'মন্তব্য ১০০০ অক্ষরের বেশি হতে পারবে না']
  },
  isCommitteeResponse: {
    type: Boolean,
    default: false
  },
  parentComment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

module.exports = mongoose.model('Comment', commentSchema);
