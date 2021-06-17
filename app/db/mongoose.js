const mongoose = require('mongoose')

const {DATABASE} = require('../../config')

mongoose.connect(DATABASE.URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})
