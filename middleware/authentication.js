const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const ErrorHander = require("../utils/errorHander");
const Combined = require("../models/combinedModel");


exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    console.log('---------------------isAuthenticatedUser---------------------------')
    const userToken = req.cookies.jwt;
    console.log("authuser:" + userToken);
    if (!userToken) {
        return next(new ErrorHander("Please login to access this resource", 401));
    }
    try {
        const decodedData = jwt.verify(userToken, process.env.JWT_SECRET);
        req.combined = await Combined.findById(decodedData.id);

        req.session.combinedId = req.combined._id;
        req.session.combinedEmail = req.combined.email
        req.session.combinedWorkSpaceName = req.combined.workspace_name;
        console.log("Id and workspace name from auth", req.combined._id, req.combined.workspace_name)
        next();
    } catch (error) {
        return next(new ErrorHander("Invalid Token. Please Login again", 401));
    }
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (req.combined.role === 'SuperAdmin') {
            return next();
        }
        if (!roles.includes(req.combined.role)) {
            return next(
                new ErrorHander(
                    `Role: ${req.combined.role} is not allowed to access this resource`,
                    403
                )
            );
        }

        next();
    };
};

exports.checkRouteAccess = () => {
    return (req, res, next) => {
        if (req.combined.role === 'SuperAdmin') {
            return next();
        }
        const routeName = req.originalUrl;
        if (req.combined.allowedRoutes.includes(routeName)) {
            return next();
        } else {
            return next(new ErrorHander(`Access denied to the route ${routeName}`, 403));
        }
    };
};