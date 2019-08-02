const mongoose = require('mongoose')
const Party = require('../api/models/party')
const config = require('../nodemon.json')

const reset = async () => {
  mongoose.connect(config.env.MONGO_DB_CONNECTION, { 
    useNewUrlParser: true 
  })
  await Party.deleteMany() // Deletes all records
  return await Party.create([
    { name: 'Oooooontz' },
    { name: 'SPICY', exclusive: true }
  ])
}

reset().catch(console.error).then((response) => {
  console.log(`Seeds successful! ${response.length} records created.`)
  return mongoose.disconnect()
})