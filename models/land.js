const mongoose = require('mongoose');
const farmer = require('./farmer');

const landSchema = new mongoose.Schema({
    farmerId: { type: Number, required: true, ref: farmer },
    farmerType: { type: String, enum: ['Owner', 'Tenant'], required: true },

    
    landholdingSize: {
        type: Number,
        required: function () { return this.farmerType === 'Owner'; },
        message: 'landholdingSize is required for Owner'
    },
    landholdingUnit: {
        type: String,
        enum: ['acres', 'sq.ft'],
        required: function () { return this.farmerType === 'Owner'; },
        message: 'landholdingUnit is required for Owner'
    },
    landOwnershipProof: {
        type: String,
        required: function () { return this.farmerType === 'Owner'; },
        message: 'landOwnershipProof is required for Owner'
    },

    
    landAcquiredArea: {
        type: Number,
        required: function () { return this.farmerType === 'Tenant'; },
        message: 'landAcquiredArea is required for Tenant'
    },
    landAcquiredUnit: {
        type: String,
        enum: ['acres', 'sq.ft'],
        required: function () { return this.farmerType === 'Tenant'; },
        message: 'landAcquiredUnit is required for Tenant'
    },
    leaseAgreementProof: {
        type: String,
        required: function () { return this.farmerType === 'Tenant'; },
        message: 'leaseAgreementProof is required for Tenant'
    },

    generatedCrops: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Land', landSchema);