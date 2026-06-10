const Land = require('../models/land');
const Farmer = require('../models/farmer');


exports.getLandsByFarmer = async (req, res) => {
  try {
    const farmerId = Number(req.params.id);

    const farmer = await Farmer.findOne({ farmerId, isActive: true });
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });

    const lands = await Land.find({ farmerId, isActive: true });

    res.status(200).json({ success: true, data: lands });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.addLand = async (req, res) => {
  try {
    const farmerId = Number(req.params.id); 
    const { farmerType, ...rest } = req.body;

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

exports.updateLand = async (req, res) => {
    try {
        const farmer = await Farmer.findOne({ farmerId: Number(req.params.id), isActive: true });
        if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });

        const { farmerType, generatedCrops, ...rest } = req.body;

        let landData = { farmerType, generatedCrops };

        if (farmerType === 'Owner') {
            landData = {
                ...landData,
                landholdingSize:    rest.landholdingSize,
                landholdingUnit:    rest.landholdingUnit,
                landOwnershipProof: rest.landOwnershipProof
            };
        }

        
        if (farmerType === 'Tenant') {
            landData = {
                ...landData,
                landAcquiredArea:    rest.landAcquiredArea,
                landAcquiredUnit:    rest.landAcquiredUnit,
                leaseAgreementProof: rest.leaseAgreementProof
            };
        }

        const unsetFields = farmerType === 'Owner'
            ? { landAcquiredArea: '', landAcquiredUnit: '', leaseAgreementProof: '' }
            : { landholdingSize: '', landholdingUnit: '', landOwnershipProof: '' };

        const land = await Land.findOneAndUpdate(
            { _id: req.params.landId, farmerId: Number(farmer.farmerId), isActive: true },
            { $set: landData, $unset: unsetFields },
            { returnDocument: 'after', runValidators: true }
        );
        if (!land) return res.status(404).json({ success: false, message: 'Land not found' });

        res.status(200).json({ success: true, data: land });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteLand = async (req, res) => {
    try {
        const farmer = await Farmer.findOne({ farmerId: Number(req.params.id), isActive: true });
        if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });

        const land = await Land.findOneAndUpdate(
            { _id: req.params.landId, farmerId: farmer.farmerId, isActive: true },
            { isActive: false },
            { returnDocument: 'after'}
        );
        if (!land) return res.status(404).json({ success: false, message: 'Land not found' });

        res.status(200).json({ success: true, message: 'Land deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};