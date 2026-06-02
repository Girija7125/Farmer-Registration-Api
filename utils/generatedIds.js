const Counter = require('../models/counter');

const generateFarmerId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'farmerId' },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return 1000 + counter.seq;
};

module.exports = generateFarmerId;