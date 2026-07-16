const AppError = require('../utils/AppError');
const Journey = require('../models/Journey');

const buildJourneyUpdatePayload = (body) => {
  const updateData = {};

  if (Object.prototype.hasOwnProperty.call(body, 'trainNumber')) {
    updateData.trainNumber = body.trainNumber;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'trainName')) {
    updateData.trainName = body.trainName;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'sourceStation')) {
    updateData.sourceStation = body.sourceStation;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'destinationStation')) {
    updateData.destinationStation = body.destinationStation;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'journeyDate')) {
    updateData.journeyDate = body.journeyDate;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    updateData.status = body.status;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'alertPreferences')) {
    updateData.alertPreferences = body.alertPreferences;
  }

  return updateData;
};

const createJourney = async (req, res, next) => {
  try {
    const journey = await Journey.create({
      user: req.user.id,
      trainNumber: req.body.trainNumber,
      trainName: req.body.trainName,
      sourceStation: req.body.sourceStation,
      destinationStation: req.body.destinationStation,
      journeyDate: req.body.journeyDate,
      status: req.body.status,
      alertPreferences: req.body.alertPreferences,
    });

    return res.status(201).json({
      success: true,
      message: 'Journey created successfully',
      data: { journey },
    });
  } catch (error) {
    return next(error);
  }
};

const getJourneys = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { user: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [journeys, total] = await Promise.all([
      Journey.find(filter).sort({ journeyDate: 1, createdAt: -1 }).skip(skip).limit(limit),
      Journey.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Journeys fetched successfully',
      data: {
        journeys,
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

const getJourneyById = async (req, res, next) => {
  try {
    const journey = await Journey.findOne({ _id: req.params.id, user: req.user.id });

    if (!journey) {
      throw new AppError('Journey not found', 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Journey fetched successfully',
      data: { journey },
    });
  } catch (error) {
    return next(error);
  }
};

const updateJourney = async (req, res, next) => {
  try {
    const updateData = buildJourneyUpdatePayload(req.body);

    const journey = await Journey.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!journey) {
      throw new AppError('Journey not found', 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Journey updated successfully',
      data: { journey },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!journey) {
      throw new AppError('Journey not found', 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Journey deleted successfully',
      data: {},
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createJourney,
  deleteJourney,
  getJourneyById,
  getJourneys,
  updateJourney,
};
