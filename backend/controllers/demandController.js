const Demand = require('../models/Demand');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// Status translations
const statusBangla = {
  draft: 'খসড়া',
  pending: 'অপেক্ষমান',
  under_review: 'পর্যালোচনাধীন',
  in_progress: 'চলমান',
  resolved: 'সমাধান হয়েছে',
  rejected: 'প্রত্যাখ্যান'
};

// Category translations
const categoryBangla = {
  academic: 'একাডেমিক',
  accommodation: 'আবাসন',
  transport: 'পরিবহন',
  campus_facilities: 'ক্যাম্পাস সুবিধা',
  library: 'লাইব্রেরি',
  cafeteria: 'ক্যাফেটেরিয়া',
  medical: 'চিকিৎসা',
  sports: 'খেলাধুলা',
  security: 'নিরাপত্তা',
  administrative: 'প্রশাসনিক',
  other: 'অন্যান্য'
};

// @desc    Create new demand
// @route   POST /api/demands
// @access  Private
exports.createDemand = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      isAnonymous,
      tags,
      status
    } = req.body;

    // Handle file uploads
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    const demand = await Demand.create({
      title,
      description,
      category,
      priority: priority || 'medium',
      status: status === 'draft' ? 'draft' : 'pending',
      submittedBy: req.user._id,
      isAnonymous: isAnonymous || false,
      attachments,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      statusHistory: [{
        status: status === 'draft' ? 'draft' : 'pending',
        changedBy: req.user._id,
        comment: 'দাবি সাবমিট করা হয়েছে'
      }]
    });

    // Populate submittedBy
    await demand.populate('submittedBy', 'name email studentId department');

    res.status(201).json({
      success: true,
      message: status === 'draft' ? 'দাবি খসড়া হিসেবে সংরক্ষিত' : 'দাবি সফলভাবে সাবমিট হয়েছে!',
      demand
    });
  } catch (error) {
    console.error('Create demand error:', error);
    res.status(500).json({
      success: false,
      message: 'দাবি সাবমিট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Get all demands (with filters)
// @route   GET /api/demands
// @access  Public/Private
exports.getDemands = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      myDemands,
      isPublic
    } = req.query;

    // Build query
    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // Don't show drafts in public listing
      query.status = { $ne: 'draft' };
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // My demands filter
    if (myDemands === 'true' && req.user) {
      query.submittedBy = req.user._id;
      delete query.status; // Show all statuses including drafts for own demands
    }

    // Public only filter
    if (isPublic === 'true') {
      query.isPublic = true;
      query.status = 'resolved';
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const demands = await Demand.find(query)
      .populate('submittedBy', 'name studentId department batch')
      .populate('respondedBy', 'name role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Demand.countDocuments(query);

    // Hide submitter info for anonymous demands (unless it's the owner or committee)
    const processedDemands = demands.map(demand => {
      const demandObj = demand.toObject();
      if (demandObj.isAnonymous) {
        if (!req.user || 
            (req.user._id.toString() !== demandObj.submittedBy._id.toString() && 
             req.user.role === 'student')) {
          demandObj.submittedBy = { name: 'বেনামী', _id: null };
        }
      }
      return demandObj;
    });

    res.json({
      success: true,
      demands: processedDemands,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get demands error:', error);
    res.status(500).json({
      success: false,
      message: 'দাবিগুলো লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Get single demand
// @route   GET /api/demands/:id
// @access  Public/Private
exports.getDemand = async (req, res) => {
  try {
    const demand = await Demand.findById(req.params.id)
      .populate('submittedBy', 'name email studentId department batch')
      .populate('respondedBy', 'name role')
      .populate('supporters', 'name studentId')
      .populate({
        path: 'statusHistory.changedBy',
        select: 'name role'
      });

    if (!demand) {
      return res.status(404).json({
        success: false,
        message: 'দাবি পাওয়া যায়নি'
      });
    }

    // Increment view count
    demand.viewCount += 1;
    await demand.save();

    // Get comments
    const comments = await Comment.find({ demand: demand._id, parentComment: null })
      .populate('user', 'name role avatar')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name role avatar' }
      })
      .sort({ createdAt: -1 });

    // Hide submitter info for anonymous demands
    const demandObj = demand.toObject();
    if (demandObj.isAnonymous) {
      if (!req.user || 
          (req.user._id.toString() !== demandObj.submittedBy._id.toString() && 
           req.user.role === 'student')) {
        demandObj.submittedBy = { name: 'বেনামী', _id: null };
      }
    }

    res.json({
      success: true,
      demand: demandObj,
      comments
    });
  } catch (error) {
    console.error('Get demand error:', error);
    res.status(500).json({
      success: false,
      message: 'দাবি লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Update demand
// @route   PUT /api/demands/:id
// @access  Private (owner only for draft, committee for status)
exports.updateDemand = async (req, res) => {
  try {
    let demand = await Demand.findById(req.params.id);

    if (!demand) {
      return res.status(404).json({
        success: false,
        message: 'দাবি পাওয়া যায়নি'
      });
    }

    // Check ownership for student updates
    if (req.user.role === 'student') {
      if (demand.submittedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'এই দাবি আপডেট করার অনুমতি নেই'
        });
      }

      // Students can only update drafts
      if (demand.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'শুধুমাত্র খসড়া দাবি আপডেট করা যাবে'
        });
      }
    }

    const updates = req.body;

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      updates.attachments = [...demand.attachments, ...newAttachments];
    }

    // Update tags
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(tag => tag.trim());
    }

    demand = await Demand.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('submittedBy', 'name email studentId department');

    res.json({
      success: true,
      message: 'দাবি আপডেট হয়েছে!',
      demand
    });
  } catch (error) {
    console.error('Update demand error:', error);
    res.status(500).json({
      success: false,
      message: 'দাবি আপডেট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Update demand status (Committee only)
// @route   PUT /api/demands/:id/status
// @access  Private (Committee/Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status, comment, committeeResponse, isPublic } = req.body;

    let demand = await Demand.findById(req.params.id)
      .populate('submittedBy', 'name email');

    if (!demand) {
      return res.status(404).json({
        success: false,
        message: 'দাবি পাওয়া যায়নি'
      });
    }

    const oldStatus = demand.status;

    // Update status
    demand.status = status;
    
    // Add to status history
    demand.statusHistory.push({
      status,
      changedBy: req.user._id,
      comment: comment || `স্ট্যাটাস ${statusBangla[oldStatus]} থেকে ${statusBangla[status]} এ পরিবর্তন করা হয়েছে`
    });

    // Add committee response
    if (committeeResponse) {
      demand.committeeResponse = committeeResponse;
      demand.respondedBy = req.user._id;
      demand.respondedAt = Date.now();
    }

    // Set public visibility
    if (typeof isPublic === 'boolean') {
      demand.isPublic = isPublic;
    }

    // Set resolved date
    if (status === 'resolved') {
      demand.resolvedAt = Date.now();
      demand.isPublic = true; // Make resolved demands public by default
    }

    await demand.save();

    // Create notification for the submitter
    if (!demand.isAnonymous) {
      await Notification.create({
        user: demand.submittedBy._id,
        type: status === 'resolved' ? 'demand_resolved' : 
              status === 'rejected' ? 'demand_rejected' : 'demand_status_update',
        title: 'দাবির স্ট্যাটাস আপডেট',
        message: `আপনার দাবি "${demand.title}" এর স্ট্যাটাস "${statusBangla[status]}" এ পরিবর্তন হয়েছে`,
        demand: demand._id
      });

      // Send email notification
      try {
        await sendEmail({
          email: demand.submittedBy.email,
          subject: 'দাবি.com - দাবির স্ট্যাটাস আপডেট',
          html: emailTemplates.statusUpdate(
            demand.submittedBy.name,
            demand.title,
            status,
            statusBangla[status]
          )
        });
      } catch (emailError) {
        console.error('Status update email failed:', emailError);
      }
    }

    await demand.populate('respondedBy', 'name role');

    res.json({
      success: true,
      message: `দাবির স্ট্যাটাস "${statusBangla[status]}" এ পরিবর্তন হয়েছে`,
      demand
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Support/Vote for a demand
// @route   POST /api/demands/:id/support
// @access  Private
exports.supportDemand = async (req, res) => {
  try {
    const demand = await Demand.findById(req.params.id);

    if (!demand) {
      return res.status(404).json({
        success: false,
        message: 'দাবি পাওয়া যায়নি'
      });
    }

    // Check if already supported
    const alreadySupported = demand.supporters.includes(req.user._id);

    if (alreadySupported) {
      // Remove support
      demand.supporters = demand.supporters.filter(
        id => id.toString() !== req.user._id.toString()
      );
      demand.supportCount = Math.max(0, demand.supportCount - 1);
      await demand.save();

      return res.json({
        success: true,
        message: 'সমর্থন প্রত্যাহার করা হয়েছে',
        supportCount: demand.supportCount,
        isSupported: false
      });
    }

    // Add support
    demand.supporters.push(req.user._id);
    demand.supportCount += 1;
    await demand.save();

    // Notify demand owner (if not anonymous and not self)
    if (!demand.isAnonymous && demand.submittedBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: demand.submittedBy,
        type: 'support_received',
        title: 'নতুন সমর্থন',
        message: `আপনার দাবি "${demand.title}" এ কেউ সমর্থন দিয়েছে`,
        demand: demand._id
      });
    }

    res.json({
      success: true,
      message: 'সমর্থন দেওয়া হয়েছে!',
      supportCount: demand.supportCount,
      isSupported: true
    });
  } catch (error) {
    console.error('Support demand error:', error);
    res.status(500).json({
      success: false,
      message: 'সমর্থন দিতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Delete demand
// @route   DELETE /api/demands/:id
// @access  Private (owner for drafts, admin for all)
exports.deleteDemand = async (req, res) => {
  try {
    const demand = await Demand.findById(req.params.id);

    if (!demand) {
      return res.status(404).json({
        success: false,
        message: 'দাবি পাওয়া যায়নি'
      });
    }

    // Check permissions
    if (req.user.role === 'student') {
      if (demand.submittedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'এই দাবি মুছে ফেলার অনুমতি নেই'
        });
      }

      if (demand.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'শুধুমাত্র খসড়া দাবি মুছে ফেলা যাবে'
        });
      }
    }

    // Delete associated comments
    await Comment.deleteMany({ demand: demand._id });

    await demand.deleteOne();

    res.json({
      success: true,
      message: 'দাবি মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    console.error('Delete demand error:', error);
    res.status(500).json({
      success: false,
      message: 'দাবি মুছে ফেলতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Get demand statistics
// @route   GET /api/demands/stats
// @access  Private (Committee/Admin)
exports.getStats = async (req, res) => {
  try {
    // Total counts by status
    const statusStats = await Demand.aggregate([
      { $match: { status: { $ne: 'draft' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Total counts by category
    const categoryStats = await Demand.aggregate([
      { $match: { status: { $ne: 'draft' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Total counts by priority
    const priorityStats = await Demand.aggregate([
      { $match: { status: { $ne: 'draft' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Monthly submission trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Demand.aggregate([
      { 
        $match: { 
          status: { $ne: 'draft' },
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Total counts
    const totalDemands = await Demand.countDocuments({ status: { $ne: 'draft' } });
    const pendingDemands = await Demand.countDocuments({ status: 'pending' });
    const resolvedDemands = await Demand.countDocuments({ status: 'resolved' });
    const inProgressDemands = await Demand.countDocuments({ 
      status: { $in: ['under_review', 'in_progress'] } 
    });

    // Average resolution time
    const avgResolutionTime = await Demand.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      { $group: { _id: null, avgDays: { $avg: '$resolutionTime' } } }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalDemands,
        pending: pendingDemands,
        resolved: resolvedDemands,
        inProgress: inProgressDemands,
        avgResolutionDays: avgResolutionTime[0]?.avgDays?.toFixed(1) || 0,
        byStatus: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCategory: categoryStats.map(item => ({
          category: item._id,
          categoryBn: categoryBangla[item._id],
          count: item.count
        })),
        byPriority: priorityStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Get public statistics for homepage
// @route   GET /api/demands/stats/public
// @access  Public
exports.getPublicStats = async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Count total demands (excluding drafts)
    const total = await Demand.countDocuments({ status: { $ne: 'draft' } });
    
    // Count resolved demands
    const resolved = await Demand.countDocuments({ status: 'resolved' });
    
    // Count total users
    const users = await User.countDocuments({ isVerified: true });
    
    // Calculate satisfaction percentage (resolved / total non-draft demands)
    let satisfaction = 0;
    if (total > 0) {
      satisfaction = Math.round((resolved / total) * 100);
    }
    
    res.json({
      total,
      resolved,
      users,
      satisfaction
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};
