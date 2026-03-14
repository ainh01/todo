const User = require('../models/User');

const getAdminEmails = () => {
  const adminList = process.env.ADMIN_LIST || '';
  return adminList.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const adminEmails = getAdminEmails();
    const isUserAdmin = adminEmails.includes(user.email.toLowerCase());

    if (!isUserAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.checkAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const adminEmails = getAdminEmails();
    const isUserAdmin = adminEmails.includes(user.email.toLowerCase());

    return res.status(200).json({
      success: true,
      isAdmin: isUserAdmin
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
