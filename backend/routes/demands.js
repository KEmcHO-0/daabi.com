const express = require('express');
const router = express.Router();
const {
  createDemand,
  getDemands,
  getDemand,
  updateDemand,
  updateStatus,
  supportDemand,
  deleteDemand,
  getStats,
  getPublicStats
} = require('../controllers/demandController');
const { addComment, getComments } = require('../controllers/commentController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', optionalAuth, getDemands);
router.get('/stats', getPublicStats);  // Public stats for homepage
router.get('/stats/admin', protect, authorize('committee', 'admin'), getStats);  // Admin stats
router.get('/:id', optionalAuth, getDemand);

// Protected routes
router.post('/', protect, upload.array('attachments', 5), createDemand);
router.put('/:id', protect, upload.array('attachments', 5), updateDemand);
router.delete('/:id', protect, deleteDemand);

// Support/Vote
router.post('/:id/support', protect, supportDemand);

// Status update (Committee only)
router.put('/:id/status', protect, authorize('committee', 'admin'), updateStatus);

// Comments
router.post('/:demandId/comments', protect, addComment);
router.get('/:demandId/comments', getComments);

module.exports = router;
