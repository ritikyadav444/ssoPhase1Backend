const express = require('express');
const { getAllInvoices, createInvoice, updateInvoice, deleteInvoice, getInvoiceDetails } = require('../controller/invoiceController');
const { isAuthenticatedUser, checkRouteAccess, authorizeRoles } = require('../middleware/authentication');

const router = express.Router();


// router.route("/invoices").get(isAuthenticatedUser, getAllInvoices, checkRouteAccess());

router.route("/invoices").get(isAuthenticatedUser, authorizeRoles('User', 'SuperAdmin'), checkRouteAccess(), getAllInvoices);
router.route("/invoice/:id").get(isAuthenticatedUser, getInvoiceDetails);

router.route("/new/invoice").post(isAuthenticatedUser, createInvoice);
router.route("/invoice/delete/:id").delete(isAuthenticatedUser, deleteInvoice)
router.route("/invoice/update/:id").put(isAuthenticatedUser, updateInvoice)


module.exports = router