const Farmer = require('../models/farmer');
const land = require('../models/land');
const Land = require('../models/land')
const { getFarmerId, incrementFarmerId } = require('../utils/generatedIds');

exports.createFarmer = async (req, res) => {
    try {
        const { lands, ...farmerData } = req.body;

        if (!lands || !Array.isArray(lands) || lands.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one land is required' });
        }


        await Promise.all(lands.map(land => new Land({ ...land, farmerId: 0 }).validate()));


        const farmerId = farmerData.farmerId || await getFarmerId();
        const farmer = await Farmer.create({ farmerId, ...farmerData });
        await incrementFarmerId();

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
};

exports.getAllFarmers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        let query = { isActive: true };
        const skip = (page - 1) * Number(limit);
        const total = await Farmer.countDocuments(query);
        const farmersWithLands = await Farmer.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "lands",
                    localField: "farmerId",
                    foreignField: "farmerId",
                    as: "lands"
                }
            },
            {
                $addFields: {
                    lands: {
                        $filter: {
                            input: "$lands",
                            as: "land",
                            cond: { $eq: ["$$land.isActive", true] }
                        }
                    }
                }
            },
            { $skip: skip },
            { $limit: Number(limit) }
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

exports.searchFarmers = async (req, res) => {
    try {
        const { q, name, mobile, farmerId, page = 1, limit = 10 } = req.body;

        const filter = { isActive: true };

        if (name) {
            filter.farmerName = { $regex: name.trim(), $options: 'i' };
        }

        if (mobile) {
            filter.mobileNumber = { $regex: mobile.trim(), $options: 'i' };
        }

        if (farmerId) {
            filter.$expr = {
                $regexMatch: {
                    input: { $toString: "$farmerId" },
                    regex: String(farmerId).trim(),
                    options: "i"
                }
            };
        }

        if (q && q.trim()) {
            filter.$or = [
                { farmerName: { $regex: q.trim(), $options: 'i' } },
                { mobileNumber: { $regex: q.trim(), $options: 'i' } },
                { $expr: { $regexMatch: { input: { $toString: "$farmerId" }, regex: q.trim() } } }
            ];
        }

        const skip = (page - 1) * Number(limit);
        const total = await Farmer.countDocuments(filter);
        const results = await Farmer.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "lands",
                    localField: "farmerId",
                    foreignField: "farmerId",
                    as: "lands"
                }
            },
            {
                $addFields: {
                    lands: {
                        $filter: {
                            input: "$lands",
                            as: "land",
                            cond: { $eq: ["$$land.isActive", true] }
                        }
                    }
                }
            },
            { $skip: skip },
            { $limit: Number(limit) }
        ]);

        res.json({
            success: true,
            data: results,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
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

exports.updateFarmerWithLand = async (req, res) => {
    try {
        const { lands, ...farmerData } = req.body;

        if (lands && Array.isArray(lands) && lands.length > 0) {
            await Promise.all(lands.map(land => new Land(land).validate()));
        }
        const farmer = await Farmer.findOneAndUpdate(
            { farmerId: Number(req.params.id), isActive: true },
            farmerData,
            { returnDocument: 'after', runValidators: true }
        );
        if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });



        if (lands && Array.isArray(lands) && lands.length > 0) {
            const landIds = lands.filter(l => l._id).map(l => l._id);
            await Land.updateMany(
                { farmerId: farmer.farmerId, isActive: true, _id: { $nin: landIds } },
                { $set: { isActive: false } }
            );
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
                    const unsetFields = land.farmerType === 'Owner'
                        ? { landAcquiredArea: '', landAcquiredUnit: '', leaseAgreementProof: '' }
                        : { landholdingSize: '', landholdingUnit: '', landOwnershipProof: '' };
                    if (land._id) {
                        await Land.findOneAndUpdate(
                            { _id: land._id, farmerId: farmer.farmerId, isActive: true },
                            { $set: landData, $unset: unsetFields },
                            { returnDocument: 'after', runValidators: true }
                        );
                    } else {
                        await Land.create({ ...landData, farmerId: farmer.farmerId });
                    }
                })
            );
        }
        const updatedLands = await Land.find({ farmerId: farmer.farmerId, isActive: true });

        res.status(200).json({
            success: true,
            data: { ...farmer.toObject(), lands: updatedLands }
        });
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
        await Land.updateMany({ farmerId: Number(req.params.id) }, { isActive: false });
        res.status(200).json({ success: true, message: 'Farmer deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }

};

