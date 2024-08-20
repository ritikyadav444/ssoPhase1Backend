const Combined = require('../models/combinedModel');
const ErrorHander = require('../utils/errorHander');

exports.grantAccess = async (req, res, next) => {
    try {
        const { userId, routeName } = req.body;

        const user = await Combined.findById(userId);
        if (!user.allowedRoutes.includes(routeName)) {
            user.allowedRoutes.push(routeName);
            await user.save();
            res.status(200).json({ message: `Access granted to ${routeName}` });
        } else {
            res.status(400).json({ message: `User already has access to ${routeName}` });
        }
    } catch (error) {
        return next(new ErrorHander("Error in granting access", 500));
    }
};

exports.revokeAccess = async (req, res, next) => {
    try {
        const { userId, routeName } = req.body;

        const user = await Combined.findById(userId);
        if (user.allowedRoutes.includes(routeName)) {
            user.allowedRoutes = user.allowedRoutes.filter(route => route !== routeName);
            await user.save();
            res.status(200).json({ message: `Access revoked from ${routeName}` });
        } else {
            res.status(400).json({ message: `User does not have access to ${routeName}` });
        }
    } catch (error) {
        return next(new ErrorHander("Error in revoking access", 500));
    }
};