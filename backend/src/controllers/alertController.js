const AppError = require('../utils/AppError');
const Alert = require('../models/Alert');
const Journey = require('../models/Journey');

const buildAlertPayload = (body) => {
  const payload = {};
  if (Object.prototype.hasOwnProperty.call(body, 'type')) payload.type = body.type;
  if (Object.prototype.hasOwnProperty.call(body, 'message')) payload.message = body.message;
  if (Object.prototype.hasOwnProperty.call(body, 'triggeredAt')) payload.triggeredAt = body.triggeredAt;
  if (Object.prototype.hasOwnProperty.call(body, 'status')) payload.status = body.status;
  if (Object.prototype.hasOwnProperty.call(body, 'metadata')) payload.metadata = body.metadata;
  return payload;
};

const getOwnedJourneyOrThrow = async (journeyId, userId) => {
  const journey = await Journey.findOne({ _id: journeyId, user: userId });
  if (!journey) throw new AppError('Journey not found', 404);
  return journey;
};

const createAlert = async (req, res, next) => {
  try {
    await getOwnedJourneyOrThrow(req.body.journeyId, req.user.id);
    const alert = await Alert.create({ journey: req.body.journeyId, ...buildAlertPayload(req.body) });
    return res.status(201).json({ success: true, message: 'Alert created successfully', data: { alert } });
  } catch (error) { return next(error); }
};

const getAlerts = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const filter = { journey: { $in: await Journey.find({ user: req.user.id }).distinct('_id') } };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    const [alerts, total] = await Promise.all([
      Alert.find(filter).sort({ triggeredAt: -1, createdAt: -1 }).skip(skip).limit(limit),
      Alert.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, message: 'Alerts fetched successfully', data: { alerts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } } });
  } catch (error) { return next(error); }
};

const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id).populate({ path: 'journey', match: { user: req.user.id } });
    if (!alert || !alert.journey) throw new AppError('Alert not found', 404);
    return res.status(200).json({ success: true, message: 'Alert fetched successfully', data: { alert } });
  } catch (error) { return next(error); }
};

const updateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id).populate({ path: 'journey', match: { user: req.user.id } });
    if (!alert || !alert.journey) throw new AppError('Alert not found', 404);
    Object.assign(alert, buildAlertPayload(req.body));
    await alert.save();
    return res.status(200).json({ success: true, message: 'Alert updated successfully', data: { alert } });
  } catch (error) { return next(error); }
};

const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id).populate({ path: 'journey', match: { user: req.user.id } });
    if (!alert || !alert.journey) throw new AppError('Alert not found', 404);
    await Alert.deleteOne({ _id: alert._id });
    return res.status(200).json({ success: true, message: 'Alert deleted successfully', data: {} });
  } catch (error) { return next(error); }
};

module.exports = { createAlert, deleteAlert, getAlertById, getAlerts, updateAlert };
