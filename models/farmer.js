const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  farmerId: { type: Number, required: true, unique: true },
  farmerName: { type: String, required: true },
  aadhaarNumber: {
    type: String, required: true, unique: true,
    match: [/^\d{12}$/, 'Aadhaar number must be exactly 12 digits'],
  },
  mobileNumber: {
    type: String, required: true,
    match: [/^[6-9]\d{9}$/, 'Mobile number must be a valid 10-digit Indian number']
  },
  address: { type: String },
  bankAccountNumber: {
    type: String, required: true,
    match: [/^\d{9,18}$/, 'Bank account number must be between 9-18 digits']
  },
  ifscCode: { 
    type: String, required: true ,
    match:[/[^\s]{4}\d{7}$/,'Please enter a valid IFSC code.']
  },
  bankName: { type: String, required: true },
  branchName: { type: String, required: true },
  belongsTo: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });


module.exports = mongoose.model('farmer', farmerSchema);