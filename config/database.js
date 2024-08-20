const mongoose = require("mongoose");
const dotenv = require("dotenv").config()
const DB_URI = 'mongodb://localhost:27017/helloprints'
const connectDatabase = () => {
    mongoose.connect(DB_URI, {}).then(

        (data) => {
            console.log(`Mongodb connected server:${data.connection.host}`);

        });
};
module.exports = connectDatabase