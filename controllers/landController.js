const Land = require('../models/land');
const Farmer = require('../models/farmer');

exports.addLand = async (req, res) => {
  try {
    const { farmerId, farmerType, ...rest } = req.body;

    if (!farmerType) return res.status(400).json({ success: false, message: 'farmerType is required' });

    const farmer = await Farmer.findOne({ farmerId, isActive: true });
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });

    let landData = { farmerId, farmerType };

    if (farmerType === 'Owner') {
      landData = {
        ...landData,
        landholdingSize: rest.landholdingSize,
        landholdingUnit: rest.landholdingUnit,
        landOwnershipProof: rest.landOwnershipProof,
        generatedCrops: rest.generatedCrops
      };
    }

    if (farmerType === 'Tenant') {
      landData = {
        ...landData,
        landAcquiredArea: rest.landAcquiredArea,
        landAcquiredUnit: rest.landAcquiredUnit,
        leaseAgreementProof: rest.leaseAgreementProof,
        generatedCrops: rest.generatedCrops
      };
    }

    const land = await Land.create(landData);
    res.status(201).json({ success: true, data: land });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};