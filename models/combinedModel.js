const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { roles } = require('../middleware/constant');

const combinedSchema = mongoose.Schema({
    fname: {
        type: String,
        // required: [true, "Please Enter First Name"],
        // default: "abc"

    },
    lname: {
        type: String,
        // required: [true, "Please Enter Last Name"],
        // default: "abc"
    },
    email: {
        type: String,
        // required: [true, 'Please Enter Email'],
        // default: "abc"

    },
    password: {
        type: String,
        // required: [true, 'Please Enter Password'],
        // default: "abc"

    },
    workspace_name: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Combined',
        // type: String,
        // required: [true, 'Please Enter Workspace'],
        // default: "abc"

    },
    allowedRoutes: {
        type: [String],
        default: []
    },
    role: {
        type: String,
        enum: ['SuperAdmin', 'User'],
        default: 'User'
    },

    //TEAM DETAILS
    isTeamMember: {
        type: Boolean,
        // default: false,
    },

    //CLIENT DETAILS
    isClient: {
        type: Boolean,
        // default: false,
    },

    country: {
        type: String,
        // required: [true, 'Please Enter country Name'],
    },
    state: {
        type: String,
        // required: [true, 'Please Enter state Name'],
    },
    city: {
        type: String,
        // required: [true, 'Please Enter city Name'],
    },
    postalCode: {
        type: Number,
        // required: [true, 'Please Enter postalCode Name'],
    },

    clientId: {
        type: Number,
    },

    verified: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

});
combinedSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};
combinedSchema.methods.comaprePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

combinedSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
    return token;
};

combinedSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

combinedSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(16).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

combinedSchema.pre('save', async function (next) {
    if (this.role === 'CLIENT' && !this.clientId) {
        try {
            const lastClient = await Combined.findOne({}, {}, { sort: { clientId: -1 } });
            if (lastClient) {
                this.clientId = lastClient.clientId + 1;
            } else {
                this.clientId = 1;
            }
            console.log("In", lastClient, this.clientId, this.client_createdUnder);
        } catch (error) {
            console.error('Error finding last client:', error);
        }
    }
    next();
});


const Combined = mongoose.model('Combined', combinedSchema);

module.exports = Combined;