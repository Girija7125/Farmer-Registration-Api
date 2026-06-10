const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const farmerRoutes = require('./routes/farmerRoutes');
const cors=require("cors")

dotenv.config({ quiet: true });
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL||'http://localhost:4200'
}))


app.use('/api/farmers', farmerRoutes)


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});