const mongoose = require('mongoose');

const demandSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'শিরোনাম আবশ্যক'],
    trim: true,
    maxlength: [200, 'শিরোনাম ২০০ অক্ষরের বেশি হতে পারবে না']
  },
  description: {
    type: String,
    required: [true, 'বিস্তারিত বিবরণ আবশ্যক'],
    maxlength: [5000, 'বিবরণ ৫০০০ অক্ষরের বেশি হতে পারবে না']
  },
  category: {
    type: String,
    required: [true, 'ক্যাটাগরি নির্বাচন করুন'],
    enum: [
      'academic',
      'accommodation',
      'transport',
      'campus_facilities',
      'library',
      'cafeteria',
      'medical',
      'sports',
      'security',
      'administrative',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'under_review', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  supportCount: {
    type: Number,
    default: 0
  },
  supporters: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    comment: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  committeeResponse: {
    type: String,
    maxlength: [3000, 'রেসপন্স ৩০০০ অক্ষরের বেশি হতে পারবে না']
  },
  respondedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  respondedAt: Date,
  resolvedAt: Date,
  viewCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments
demandSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'demand',
  justOne: false
});

// Index for search
demandSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Calculate days since submission
demandSchema.virtual('daysSinceSubmission').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Demand', demandSchema);
