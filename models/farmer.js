const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  farmerId: { type: Number, required: true, unique: true },
  farmerName: { type: String, required: true },
  aadhaarNumber: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  address: { type: String },
  bankAccountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  bankName: { type: String, required: true },
  branchName: { type: String, required: true },
  belongsTo: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true }); 


module.exports = mongoose.model('farmer', farmerSchema);