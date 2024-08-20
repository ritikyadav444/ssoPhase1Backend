const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceId: {
        type: Number,
    },
    client_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Combined',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    country: {
        type: String,
        // required: [true, "Enter your Country"],
    },
    state: {
        type: String,
        // required: [true, "Enter your State"],
    },
    city: {
        type: String,
        // required: [true, "Enter your City"],
    },
    zip: {
        type: String,
        // required: [true, "Enter your ZipCode"],
    },
    currency: {
        type: String,
        default:'INR'
    },
    amount: {
        type: Number,
        required: true,
        default: 90
    },
    discount_percentage: {
        type: Number,
        required: true,
        default: 0
    },
    discount_amount: {
        type: Number,
        default: 0
    },
    paid_amount: {
        type: Number,
        // required: true,
        default: 0
    },
    due_amount: {
        type: Number,
        // required: true,
        default: 0
    },
    total_amount: {
        type: Number,
        // required: true,
        default: 0
    },
    status: {
        type: String,
        required: true,
        enum: ["Open", "Draft", "Paid", "Void", "Uncollectable"],
        default: "Open"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Combined',
    },
    workspace_name: {
        type: mongoose.Schema.Types.String,
        ref: 'Combined',
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

invoiceSchema.pre('save', async function (next) {
    if (!this.invoiceId) {
        try {
            const lastInvoice = await Invoice.findOne({}, {}, { sort: { invoiceId: -1 } });
            if (lastInvoice) {
                this.invoiceId = lastInvoice.invoiceId + 1;
            } else {
                this.invoiceId = 1;
            }
            console.log("In", lastInvoice, this.invoiceId, this.createdUnder);
        } catch (error) {
            console.error('Error finding last invoice:', error);
        }
    }
    next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;