const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  departure_station_id: { type: String, required: true, minlength: 3 },
  departure_station_name: { type: String, required: true, minlength: 3 },
  departure_time: { type: String, required: true, minlength: 3 },
  distance_m: { type: String, required: true },
  duration_s: { type: String, required: true },
  return_station_id: { type: String, required: true, minlength: 3 },
  return_station_name: { type: String, required: true, minlength: 3 },
  return_time: { type: String, required: true, minlength: 3 },
})

module.exports = mongoose.model('Trip', schema)
