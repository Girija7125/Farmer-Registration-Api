const Farmer = require('../models/farmer');
const generateFarmerId=require('../utils/generatedIds');
exports.createFarmer = async (req, res) => {
    try {
        const body = req.body;
        const farmerId = body.farmerId || await generateFarmerId();
        const farmer = await Farmer.create({ ...body, farmerId });
        res.status(201).json({ success: true, data: farmer });
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
        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            data: farmers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFarmerById = async (req, res) => {
    try {
        const farmer = await Farmer.findOne({ farmerId: req.params.id })
        if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
        res.status(200).json({ success: true, data: farmer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.updateFarmer = async (req, res) => {
    try {
        const farmer = await Farmer.findOneAndUpdate({ farmerId: req.params.id },
            req.body,
            { returnDocument: 'after', runValidators: true }
        )
        if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
        res.status(200).json({ success: true, data: farmer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

exports.deleteFarmer = async (req, res) => {
    try {
        const farmer= await Farmer.findOneAndUpdate(
            {farmerId:req.params.id},
            {isActive:false},
            { returnDocument: 'after'}
        );
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.status(200).json({ success: true, message: 'Farmer deleted successfully' });

    } catch (error) {
    res.status(500).json({ success: false, message: error.message });
       
    }

}