const AppError = require('../utils/AppError');
const Notification = require('../models/Notification');
const Alert = require('../models/Alert');

const buildNotificationPayload = (body) => {
  const payload = {};
  if (Object.prototype.hasOwnProperty.call(body, 'channel')) payload.channel = body.channel;
  if (Object.prototype.hasOwnProperty.call(body, 'status')) payload.status = body.status;
  if (Object.prototype.hasOwnProperty.call(body, 'content')) payload.content = body.content;
  if (Object.prototype.hasOwnProperty.call(body, 'providerResponse')) payload.providerResponse = body.providerResponse;
  if (Object.prototype.hasOwnProperty.call(body, 'retryCount')) payload.retryCount = body.retryCount;
  if (Object.prototype.hasOwnProperty.call(body, 'sentAt')) payload.sentAt = body.sentAt;
  return payload;
};

const getOwnedAlertOrThrow = async (alertId, userId) => {
  const alert = await Alert.findById(alertId).populate({ path: 'journey', match: { user: userId } });
  if (!alert || !alert.journey) throw new AppError('Alert not found', 404);
  return alert;
};

const createNotification = async (req, res, next) => {
  try {
    const alert = await getOwnedAlertOrThrow(req.body.alertId, req.user.id);
    const notification = await Notification.create({ alert: alert._id, ...buildNotificationPayload(req.body) });
    return res.status(201).json({ success: true, message: 'Notification created successfully', data: { notification } });
  } catch (error) { return next(error); }
};

const getNotifications = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const alerts = await Alert.find({ journey: { $in: await require('../models/Journey').find({ user: req.user.id }).distinct('_id') } }).select('_id');
    const alertIds = alerts.map((alert) => alert._id);
    const filter = { alert: { $in: alertIds } };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.channel) filter.channel = req.query.channel;
    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, message: 'Notifications fetched successfully', data: { notifications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } } });
  } catch (error) { return next(error); }
};

const getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id).populate({ path: 'alert', populate: { path: 'journey', match: { user: req.user.id } } });
    if (!notification || !notification.alert || !notification.alert.journey) throw new AppError('Notification not found', 404);
    return res.status(200).json({ success: true, message: 'Notification fetched successfully', data: { notification } });
  } catch (error) { return next(error); }
};

const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id).populate({ path: 'alert', populate: { path: 'journey', match: { user: req.user.id } } });
    if (!notification || !notification.alert || !notification.alert.journey) throw new AppError('Notification not found', 404);
    Object.assign(notification, buildNotificationPayload(req.body));
    await notification.save();
    return res.status(200).json({ success: true, message: 'Notification updated successfully', data: { notification } });
  } catch (error) { return next(error); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id).populate({ path: 'alert', populate: { path: 'journey', match: { user: req.user.id } } });
    if (!notification || !notification.alert || !notification.alert.journey) throw new AppError('Notification not found', 404);
    await Notification.deleteOne({ _id: notification._id });
    return res.status(200).json({ success: true, message: 'Notification deleted successfully', data: {} });
  } catch (error) { return next(error); }
};

module.exports = { createNotification, deleteNotification, getNotificationById, getNotifications, updateNotification };
