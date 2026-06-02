const mongoose = require('mongoose');
const farmer = require('./farmer');

const landSchema = new mongoose.Schema({
    farmerId: { type: Number, required: true, ref: farmer },
    farmerType: { type: String, enum: ['Owner', 'Tenant'], required: true },


    landholdingSize: { type: Number },
    landholdingUnit: { type: String, enum: ['acres', 'sq.ft'] },
    landOwnershipProof: { type: String },


    landAcquiredArea: { type: Number },
    landAcquiredUnit: { type: String, enum: ['acres', 'sq.ft'] },
    leaseAgreementProof: { type: String },


    generatedCrops: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });


module.exports = mongoose.model('Land', landSchema);