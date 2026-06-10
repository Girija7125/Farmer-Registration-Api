const express = require('express');
const router = express.Router();
const {
  createFarmer,
  getAllFarmers,
  searchFarmers,
  getFarmerById,
  updateFarmer,
  deleteFarmer,
  updateFarmerWithLand
} = require('../controllers/farmerController');
const { addLand, updateLand, deleteLand,getLandsByFarmer } =require('../controllers/landController')

router.post('/create', createFarmer);
router.get('/', getAllFarmers);
router.post('/search', searchFarmers); 
router.get('/:id', getFarmerById);
router.put('/:id', updateFarmerWithLand);
router.delete('/:id', deleteFarmer);

router.get('/:id/lands', getLandsByFarmer);
router.post('/:id/lands/add',addLand);
router.put('/:id/lands/:landId',updateLand);
router.delete('/:id/lands/:landId',deleteLand); 

module.exports = router;