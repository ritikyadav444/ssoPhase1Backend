const Invoice = require("../models/invoiceModel");
const Combined = require('../models/combinedModel');
const ErrorHander = require("../utils/errorHander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
//create invoice
exports.createInvoice = (async (req, res, next) => {
    const body = req.body;
    const clientPresent = await Combined.exists({ _id: body.client_name });
    const orderPresent = await Order.exists({ _id: body.orderId });
    const combinedId = req.session.combinedId
    const combinedWorkSpaceName = req.session.combinedWorkSpaceName
    body.createdBy = combinedId
    body.workspace_name = combinedWorkSpaceName
    console.log(combinedId)
    console.log(combinedWorkSpaceName)

    if (!clientPresent || !orderPresent) {
        return res.status(400).json({
            success: false,
            message: 'Client or order not found. Unable to create the invoice.'
        });
    }
    var discountAmount = (req.body.amount * req.body.discount_percentage) / 100;
    var totalAmount = req.body.amount - discountAmount;
    var dueAmount = totalAmount;

    if (req.body.paid_amount == 0) {
        body.discount_amount = discountAmount;
        body.due_amount = dueAmount;
        body.total_amount = totalAmount;
    } else {
        dueAmount = totalAmount - req.body.paid_amount
        body.discount_amount = discountAmount;
        body.due_amount = dueAmount;
        body.total_amount = totalAmount;
    }
    // body.amount = Number(body.amount)
    // body.discount_percentage = Number(body.discount_percentage)
    // body.discount_amount = Number(body.discount_amount)
    // body.due_amount = Number(body.due_amount)
    // body.paid_amount = Number(body.paid_amount)
    // body.total_amount = Number(body.total_amount)




    console.log('--------------CreateInvoice--------------');
    const lastInvoice = await Invoice.findOne({}, {}, { sort: { invoiceId: -1 } });
    body.invoiceId = lastInvoice ? lastInvoice.invoiceId + 1 : 1;
    console.log("CIN", body.invoiceId)
    body.invoiceId = this.invoiceId;

    const invoice = await Invoice.create(body);
    res.status(201).json({
        success: true,
        invoice,
    })
});

//get Invoicedetails
exports.getInvoiceDetails = catchAsyncErrors(async (req, res, next) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        return next(new ErrorHander("Invoice not found", 404));
    }
    res.status(200).json({
        success: true,
        invoice,
    });
    console.log(invoice);
});


//getAll
exports.getAllInvoices = async (req, res) => {
    const combinedWorkSpaceName = req.session.combinedWorkSpaceName;
    const invoices = await Invoice.find({ workspace_name: combinedWorkSpaceName })
    res.status(200).json({
        success: true,
        invoices
    })
}

//update invoice
exports.updateInvoice = async (req, res, next) => {
    let invoice = await Invoice.findById(req.params.id)

    if (!invoice) {
        return res.status(500).json({
            success: false,
            message: "Invoice Not Found"
        })
    }
    invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        usefindAndModify: false
    });
    res.status(200).json({
        success: true,
        invoice
    })
}

//delete invoice
exports.deleteInvoice = async (req, res, next) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        return res.status(500).json({
            success: false,
            message: "Invoice Not found"
        })
    }
    console.log(invoice);
    await invoice.deleteOne();
    res.status(200).json({
        success: true,
        message: "Invoice Deleted Successfully"
    })
}