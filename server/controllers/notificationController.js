import Notification from '../models/Notification.js';
import { httpError } from '../middleware/errorHandler.js';

// GET /api/notifications/:agentId  -> all notifications (unread, read, responded), newest first
export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ agentId: req.params.agentId })
      .sort({ createdAt: -1 })
      .populate({ path: 'postId', populate: { path: 'agentId', select: 'name company' } });

    const unread = notifications.filter((n) => n.status === 'unread').length;
    res.json({ success: true, data: notifications, error: null, meta: { unread } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/:id -> mark as read (never downgrades 'responded')
export async function markRead(req, res, next) {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) throw httpError(404, 'Notification not found');

    if (notification.status === 'unread') {
      notification.status = 'read';
      await notification.save();
    }
    res.json({ success: true, data: notification, error: null });
  } catch (err) {
    next(err);
  }
}
