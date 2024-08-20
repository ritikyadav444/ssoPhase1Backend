const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const verifyMail = require("../utils/jwtTokens");
const ErrorHander = require('../utils/errorHander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Token = require("../models/tokenUserModel");
const Combined = require('../models/combinedModel');
const { sendEmail } = require('../utils/emailService');
const verifyTeamMail = require("../utils/jwtTokensTeams");
const resetEmail = require("../utils/resetMail")

exports.invite = async (req, res, next) => {
    // try {
    const isTeamMember = req.body.isTeamMember;
    console.log(isTeamMember)
    if (isTeamMember) {
        try {
            const { email, role, team_createdUnder } = req.body;
            const existingTeam = await Combined.findOne({ email });
            if (existingTeam) {
                return res.status(400).json({ success: false, message: 'Team already exists.' });
            }
            const combinedEmail = req.session.combinedEmail
            const combinedWorkSpaceName = req.session.combinedWorkSpaceName
            req.body.workspace_name = combinedWorkSpaceName
            console.log(combinedWorkSpaceName)
            const newTeam = new Combined({
                email: req.body.email,
                role: req.body.role,
                isTeamMember: req.body.isTeamMember,
                workspace_name: req.body.workspace_name,
            });
            const team = await newTeam.save();
            const token = new Token({
                userId: team._id,
                token: crypto.randomBytes(16).toString('hex')
            });
            await token.save();
            const verificationLink = `http://localhost:3000/combined/verifyTeam/${token.token}`;
            console.log(token, email, combinedEmail)
            await verifyTeamMail(email, combinedEmail, role, verificationLink, combinedWorkSpaceName);
            res.status(201).json({
                success: true,
                message: 'Team invitation sent successfully.',
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
};


exports.register = async (req, res, next) => {

    try {
        let user = await Combined.findOne({ workspace_name: req.body.workspace_name, email: req.body.email });
        if (user) {
            return res.status(400).json({ success: false, message: "User with given workspace already exists!" });
        }
        console.log(req.body)
        user = new Combined({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            workspace_name: req.body.workspace_name,
            role: req.body.role,
            password: req.body.password

        });
        user = await user.save();
        const token = new Token({
            userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
        });
        console.log(token)
        await token.save();
        const link = `http://127.0.0.1:4001/test/v1/combined/confirm/${token.token}`;
        const email = user.email;
        await verifyMail(email, link);
        res.status(201).json({
            token: token,
            success: true,
            message: "Registration successful. Verification email sent.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.verifyTeamEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const tokenObj = await Token.findOne({ token });
        console.log(tokenObj)
        if (!tokenObj) {
            return res.status(404).json({ success: false, message: 'Token not found.' });
        }

        const team = await Combined.findById(tokenObj.userId);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found.' });
        }

        const { fname, lname, password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required." });
        }

        // Update team details
        team.fname = fname;
        team.lname = lname;
        team.password = password
        team.verified = true;

        await team.save();

        await Token.findByIdAndDelete(tokenObj._id);
        console.log(password)
        const jwtToken = team.generateAuthToken();
        res.cookie('jwt', jwtToken, {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: 'Email verified. You are now logged in.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
};

exports.activateToken = async (req, res, next) => {
    try {
        const token = await Token.findOne({ token: req.params.token });
        console.log(token)
        if (!token) {
            return res.status(404).json({ success: false, message: "Token not found" });
        }

        await Combined.updateOne({ _id: token.userId }, { $set: { verified: true } });
        await Token.findOneAndDelete({ _id: token._id });

        const user = await Combined.findOne({ _id: token.userId });
        const jwtToken = user.getJWTToken();

        res.cookie('jwt', jwtToken, {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "Email verified. You are now logged in.",
            isVerified: true

        });
        // res.redirect(`http://localhost:3000/combined/login?workspace_name=${user.workspace_name}`)


    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
};

exports.loginCombined = async (req, res, next) => {
    const { email, password, workspace_name, verified, role } = req.body;
    console.log("bodyLC", req.body)
    try {
        if (!email || !password || !workspace_name) {
            return next(new ErrorHander("Please Enter Email, Password, and Workspace Name", 400));
        }

        const user = await Combined.findOne({ email, workspace_name }).select("+password");

        if (!user) {
            return next(new ErrorHander("Invalid Email, Password, or Workspace Name", 401));
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {

            return next(new ErrorHander("Invalid Password", 401));
        }
        if (user.role === 'SUPERADMIN' && !user.verified) {
            return next(new ErrorHander("Please Verify First", 400));
        }

        req.session.user = user
        const jwtToken = user.getJWTToken();
        console.log("heh", req.session.user)
        res.cookie('jwt', jwtToken, {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 10 * 1000),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "Login successful.",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.logoutCombined = async (req, res, next) => {
    res.cookie("jwt", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out"
    });
    req.session.destroy()
};


exports.getTeamDetails = catchAsyncErrors(async (req, res, next) => {
    const combined = await Combined.findById(req.params.id);
    if (!combined) {
        return next(new ErrorHander("Team not foundaas", 404));
    }
    res.status(200).json({
        success: true,
        combined,
    });
});

exports.getAllUser = async (req, res, next) => {
    const combined = await Combined.find()
    res.status(200).json({
        success: true,
        combined
    })
}
exports.deleteMembers = async (req, res, next) => {
    try {
        const combined = await Combined.findById(req.params.id);
        console.log(combined._id, req.params.id)
        if (!combined) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        const memberRole = combined.role;
        console.log(memberRole)

        if (memberRole === 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Cannot delete a member with superAdmin role."
            });
        }

        await Combined.deleteOne({ _id: req.params.id });
        res.status(200).json({
            success: true,
            message: "Member deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}


exports.updateTeam1 = async (req, res, next) => {
    let combined = await Combined.findById(req.params.id)

    if (!combined) {
        return res.status(500).json({
            success: false,
            message: "Team Member Not Found"
        })
    }
    combined.role = req.body.role;
    if (req.body.role === "") {
        combined.changeAt = Date.now()
    }
    await combined.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
        combined
    })
}


//change password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const combined = await Combined.findById(req.combined.id).select("+password");
    const isPasswordMatched = await combined.comaprePassword(req.body.oldPassword)
    if (!isPasswordMatched) {
        return next(new ErrorHander("Old password is incorrect", 400));
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does not match", 400));
    }
    combined.password = req.body.newPassword;
    await combined.save();
    res.status(200).json({
        success: true,
        combined
    })
});


// reset password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const combined = await Combined.findOne({ email: req.body.email });
    if (!combined) {
        return next(new ErrorHander("Combined Not Found", 404))
    }
    const resetToken = combined.getResetPasswordToken();
    await combined.save({ validateBeforeSave: false });
    const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}`
    const message = `Your Password Reset Token is:- \n\n ${resetPasswordUrl} \n\n If You Have Not Requested This Email 
    Then , Please Ignore It.`;
    try {
        await resetEmail({
            email: combined.email,
            subject: ` Password Recovery`,
            message,
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${combined.email} Successfully`,
            resetToken,
            combined
        })

    } catch (error) {
        combined.resetPasswordToken = undefined;
        combined.resetPasswordExpire = undefined;

        await combined.save({ validateBeforeSave: false });
        return next(new ErrorHander(error.message, 500));

    };

});
//reset password

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");
    console.log(req.params.resetToken, resetPasswordToken)
    const combined = await Combined.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!combined) {
        return next(
            new ErrorHander(
                "Reset Password Token is invalid or has been expired",
                400,
            )
        );
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does not password", 400));
    }
    combined.password = req.body.password;
    combined.resetPasswordToken = undefined;
    combined.resetPasswordExpire = undefined;
    await combined.save();
    res.status(200).json({
        success: true,
        combined
    })
});