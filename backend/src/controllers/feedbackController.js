const AppError = require('../utils/AppError');
const Feedback = require('../models/Feedback');
const Journey = require('../models/Journey');

const buildFeedbackPayload = (body) => {
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'rating')) payload.rating = body.rating;
  if (Object.prototype.hasOwnProperty.call(body, 'missedStop')) payload.missedStop = body.missedStop;
  if (Object.prototype.hasOwnProperty.call(body, 'alertTimeliness')) payload.alertTimeliness = body.alertTimeliness;
  if (Object.prototype.hasOwnProperty.call(body, 'comments')) payload.comments = body.comments;

  return payload;
};

const getOwnedJourneyOrThrow = async (journeyId, userId) => {
  const journey = await Journey.findOne({ _id: journeyId, user: userId });
  if (!journey) throw new AppError('Journey not found', 404);
  return journey;
};

const createFeedback = async (req, res, next) => {
  try {
    await getOwnedJourneyOrThrow(req.body.journeyId, req.user.id);

    const existingFeedback = await Feedback.findOne({ user: req.user.id, journey: req.body.journeyId });
    if (existingFeedback) {
      throw new AppError('Feedback already exists for this journey', 409);
    }

    const feedback = await Feedback.create({ user: req.user.id, journey: req.body.journeyId, ...buildFeedbackPayload(req.body) });

    return res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: { feedback },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Feedback already exists for this journey', 409));
    }
    return next(error);
  }
};

const getFeedbacks = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const filter = { user: req.user.id };

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feedback.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Feedbacks fetched successfully',
      data: {
        feedbacks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ _id: req.params.id, user: req.user.id });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback fetched successfully',
      data: { feedback },
    });
  } catch (error) {
    return next(error);
  }
};

const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ _id: req.params.id, user: req.user.id });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    Object.assign(feedback, buildFeedbackPayload(req.body));
    await feedback.save();

    return res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: { feedback },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Feedback already exists for this journey', 409));
    }
    return next(error);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      data: {},
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createFeedback,
  deleteFeedback,
  getFeedbackById,
  getFeedbacks,
  updateFeedback,
};
