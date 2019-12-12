const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorhandler = require('./middleware/error');

//load env vars
dotenv.config({ path: "./config/config.env" });

//connect to DB
connectDB();

//routes
const bootcamps = require('./routes/bootcamps')

const app = express();

//body-parser
app.use(express.json());

//logging middleware
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/api/v1/bootcamps',bootcamps)

app.use(errorhandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//handle unhandled promise rejection
process.on('unHandledRejection', (err, promise) => {
  console.log(`Error : ${err}`)

  //close server
  server.close(() => process.exit(1));
})
