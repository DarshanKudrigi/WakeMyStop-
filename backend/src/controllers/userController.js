const AppError = require('../utils/AppError');
const User = require('../models/User');

const updateMe = async (req, res, next) => {
  try {
    const updateData = {};

    if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) {
      updateData.phone = req.body.phone;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'notificationPreferences')) {
      updateData.notificationPreferences = req.body.notificationPreferences;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  updateMe,
};
