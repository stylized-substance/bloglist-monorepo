require('dotenv').config();
const express = require("express");
const backend = require(__dirname + '/backend/app.js')
const frontendBuild = "./frontend/build/";
const PORT = process.env.PORT || 3003

const app = express();

app.use(express.static(frontendBuild))

app.use('/api', backend)

app.get('/', (req, res) => res.sendFile(frontendBuild))

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`)
})
