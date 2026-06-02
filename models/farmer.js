const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    farmerId: { type: Number, required: true, unique: true },

    farmerName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    belongsTo: { type: String },
    aadhaarNumber: {
        type: String,
        required: true,
        match: [/^\d{12}$/, "Aadhaar number must be exactly 12 digits"]
    }
    ,
    mobileNumber: {
        type: String,
        required: [true, "Mobile number is required"],
        match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"]
    },


    address: { type: String },

    farmerType: { type: String, enum: ['Owner', 'Tenant'], required: true },

    landholdingSize: { type: Number },
    landholdingUnit: { type: String, enum: ['acres', 'sq.ft'] },
    landOwnershipProof: { type: String },

    landAcquiredArea: { type: Number },
    landAcquiredUnit: { type: String, enum: ['acres', 'sq.ft'] },
    leaseAggrementProof: { type: String },


    generatedCrops: [{ type: String }],

    bankAccountNumber: {
        type: String,
        required: [true, "Bank account number is required"],
        match: [/^\d{9,18}$/, "Bank account number must be 9 to 18 digits"]
    },
    ifscCode: {
        type: String,
        required: [true, "IFSC code is required"],
        uppercase: true,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"]
    },
    bankName: { type: String, required: true },
    branchName: { type: String, required: true }

}, { timestamps: true });


module.exports = mongoose.model('farmer', farmerSchema);