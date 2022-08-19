const mongoose = require("mongoose")

const mongoURI = 'mongodb://localhost:27017';

mongoose.connect(mongoURI, {useNewUrlParser: true})

module.exports = mongoose