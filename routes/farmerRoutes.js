const express= require('express');

const router= express.Router();
const {
    createFarmer,
    getAllFarmers,
    getFarmerById,
    updateFarmer,
    deleteFarmer
}= require('../controllers/farmerController');

router.post('/',createFarmer);
router.get('/',getAllFarmers);
router.get('/:id',getFarmerById);
router.put('/:id',updateFarmer);
router.delete('/:id',deleteFarmer);



module.exports= router