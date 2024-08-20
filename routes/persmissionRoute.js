const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/authentication');

const { grantAccess, revokeAccess } = require('../controller/permissionController');

router.post('/grant-access', isAuthenticatedUser, authorizeRoles('SuperAdmin'), grantAccess);
router.post('/revoke-access', isAuthenticatedUser, authorizeRoles('SuperAdmin'), revokeAccess);


module.exports = router;