const Farmer = require('../models/farmer');
const Land = require('../models/land')
const generateFarmerId = require('../utils/generatedIds');

exports.createFarmer = async (req, res) => {
    try {
        const { lands, ...farmerData } = req.body;

        if (!lands || !Array.isArray(lands) || lands.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one land is required' });
        }
        const farmerId = farmerData.farmerId || await generateFarmerId();
        const farmer = await Farmer.create({ ...farmerData, farmerId });
        const landRecords = lands.map((land) => {
            let landData = { farmerId, farmerType: land.farmerType };

            if (land.farmerType === 'Owner') {
                landData = {
                    ...landData,
                    landholdingSize: land.landholdingSize,
                    landholdingUnit: land.landholdingUnit,
                    landOwnershipProof: land.landOwnershipProof,
                    generatedCrops: land.generatedCrops
                };
            }

            if (land.farmerType === 'Tenant') {
                landData = {
                    ...landData,
                    landAcquiredArea: land.landAcquiredArea,
                    landAcquiredUnit: land.landAcquiredUnit,
                    leaseAgreementProof: land.leaseAgreementProof,
                    generatedCrops: land.generatedCrops
                };
            }

            return landData;
        });
        const createdLands = await Land.insertMany(landRecords);
        res.status(201).json({
            success: true,
            data: { ...farmer.toObject(), lands: createdLands }
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });

    }
}

exports.getAllFarmers = async (req, res) => {
    try {
        const { name, mobile, page = 1, limit = 10 } = req.query;
        let query = { isActive: true };
        if (name) query.farmerName = { $regex: name, $options: 'i' };
        if (mobile) query.mobileNumber = mobile
        const skip = (page - 1) * limit;
        const total = await Farmer.countDocuments(query);
        const farmers = await Farmer.find(query).skip(skip).limit(Number(limit));
        const farmersWithLands = await Farmer.aggregate([
            {
                $lookup: {
                    from: "lands",
                    localField: "farmerId",
                    foreignField: "farmerId",
                    as: "lands"
                }
            },
            {
                $match: {
                    "lands.isActive": true
                }
            }
        ]);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            data: farmersWithLands
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFarmerById = async (req, res) => {
    try {
        const farmer = await Farmer.aggregate([
            { $match: { farmerId: Number(req.params.id), isActive: true } },
            {
                $lookup: {
                    from: 'lands',
                    localField: 'farmerId',
                    foreignField: 'farmerId',
                    as: 'lands',
                    pipeline: [{ $match: { isActive: true } }]
                }
            }
        ]);

        if (!farmer.length) return res.status(404).json({ success: false, message: 'Farmer not found' });

        res.status(200).json({ success: true, data: farmer[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateFarmer = async (req, res) => {
    try {
        const { lands, ...farmerData } = req.body;

        const farmer = await Farmer.findOneAndUpdate(
            { farmerId: req.params.id, isActive: true },
            farmerData,
            { returnDocument: 'after', runValidators: true }
        );
        if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });

        if (Array.isArray(lands) && lands.length > 0) {
            await Promise.all(
                lands.map(async (land) => {
                    let landData = { farmerType: land.farmerType, generatedCrops: land.generatedCrops };

                    if (land.farmerType === 'Owner') {
                        landData = {
                            ...landData,
                            landholdingSize: land.landholdingSize,
                            landholdingUnit: land.landholdingUnit,
                            landOwnershipProof: land.landOwnershipProof
                        };
                    }

                    if (land.farmerType === 'Tenant') {
                        landData = {
                            ...landData,
                            landAcquiredArea: land.landAcquiredArea,
                            landAcquiredUnit: land.landAcquiredUnit,
                            leaseAgreementProof: land.leaseAgreementProof
                        };
                    }

                    if (land._id) {
                        const unsetFields =
                            land.farmerType === 'Owner'
                                ? { landAcquiredArea: '', landAcquiredUnit: '', leaseAgreementProof: '' }
                                : { landholdingSize: '', landholdingUnit: '', landOwnershipProof: '' };

                        await Land.findByIdAndUpdate(
                            land._id,
                            { ...landData, $unset: unsetFields },
                            { returnDocument: 'after', runValidators: true }
                        );
                    } else {
                        await Land.create({ ...landData, farmerId: farmer.farmerId });
                    }
                })
            );
        }

        const updatedLands = await Land.find({ farmerId: farmer.farmerId, isActive: true });
        res.status(200).json({ success: true, data: { ...farmer.toObject(), lands: updatedLands } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


exports.deleteFarmer = async (req, res) => {
    try {
        const farmer = await Farmer.findOneAndUpdate(
            { farmerId: req.params.id },
            { isActive: false },
            { returnDocument: 'after' }
        );
        if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
        await Land.updateMany({ farmerId: req.params.id }, { isActive: false });

        res.status(200).json({ success: true, message: 'Farmer deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }

}