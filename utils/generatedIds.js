const Counter = require('../models/counter');

const getFarmerId = async () => {
  const counter = await Counter.findOne({ name: 'farmerId' });
  return 1000 + ((counter?.seq || 0) + 1);
};

const incrementFarmerId = async () => {
  await Counter.findOneAndUpdate(
    { name: 'farmerId' },
    { $inc: { seq: 1 } },
    { upsert: true }
  );
};


module.exports = { getFarmerId, incrementFarmerId };