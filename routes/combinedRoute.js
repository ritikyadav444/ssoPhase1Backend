const express = require('express');
const { activateToken, verifyTeamEmail, loginCombined, logoutCombined, register, invite, deleteMembers, updateTeam1, getTeamDetails, updatePassword, forgotPassword, resetPassword, getAllUser } = require('../controller/combinedController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/authentication');

const router = express.Router();


router.route("/combined/newUser").post(register);
router.route("/combined/confirm/:token").get(activateToken)

router.route("/combined/newTeam").post(isAuthenticatedUser, invite, authorizeRoles('SUPERADMIN'));





router.route("/combined/getAlluser").get(getAllUser)


router.route("/combined/verifyTeam/:token").put(verifyTeamEmail)
router.route("/team/update/:id").put(updateTeam1)
router.route("/get/team/:id").get(getTeamDetails)

router.route("/member/delete/:id").delete(deleteMembers)

router.route("/combined/login").post(loginCombined);
router.route("/combined/logout").get(logoutCombined);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:resetToken").put(resetPassword);

module.exports = router