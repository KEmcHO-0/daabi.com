const Comment = require('../models/Comment');
const Demand = require('../models/Demand');
const Notification = require('../models/Notification');

// @desc    Add comment to demand
// @route   POST /api/demands/:demandId/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    const demandId = req.params.demandId;

    const demand = await Demand.findById(demandId);
    if (!demand) {
      return res.status(404).json({
        success: false,
        message: 'দাবি পাওয়া যায়নি'
      });
    }

    const comment = await Comment.create({
      demand: demandId,
      user: req.user._id,
      text,
      parentComment: parentComment || null,
      isCommitteeResponse: req.user.role === 'committee' || req.user.role === 'admin'
    });

    await comment.populate('user', 'name role avatar');

    // Notify demand owner (if not self)
    if (demand.submittedBy.toString() !== req.user._id.toString() && !demand.isAnonymous) {
      await Notification.create({
        user: demand.submittedBy,
        type: comment.isCommitteeResponse ? 'committee_response' : 'new_comment',
        title: comment.isCommitteeResponse ? 'কমিটির মন্তব্য' : 'নতুন মন্তব্য',
        message: `আপনার দাবি "${demand.title}" এ ${comment.isCommitteeResponse ? 'কমিটি' : 'কেউ'} মন্তব্য করেছে`,
        demand: demandId
      });
    }

    res.status(201).json({
      success: true,
      message: 'মন্তব্য যোগ হয়েছে!',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'মন্তব্য যোগ করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Get comments for a demand
// @route   GET /api/demands/:demandId/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      demand: req.params.demandId,
      parentComment: null 
    })
      .populate('user', 'name role avatar')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name role avatar' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'মন্তব্যগুলো লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (owner only)
exports.updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'মন্তব্য পাওয়া যায়নি'
      });
    }

    // Check ownership
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'এই মন্তব্য সম্পাদনা করার অনুমতি নেই'
      });
    }

    comment.text = req.body.text;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('user', 'name role avatar');

    res.json({
      success: true,
      message: 'মন্তব্য আপডেট হয়েছে!',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'মন্তব্য আপডেট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (owner or admin)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'মন্তব্য পাওয়া যায়নি'
      });
    }

    // Check ownership or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'এই মন্তব্য মুছে ফেলার অনুমতি নেই'
      });
    }

    // Delete all replies
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({
      success: true,
      message: 'মন্তব্য মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'মন্তব্য মুছে ফেলতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};
