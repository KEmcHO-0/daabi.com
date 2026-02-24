const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'demand_status_update',
      'new_comment',
      'committee_response',
      'support_received',
      'demand_resolved',
      'demand_rejected',
      'new_demand',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  demand: {
    type: mongoose.Schema.ObjectId,
    ref: 'Demand'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
