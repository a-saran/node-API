const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

//Load env vars
dotenv.config({ path: "./config/config.env" });

const BootCamp = require("./model/Bootcamp");

//connect to db
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

//read JSON file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

//import into DB
const importData = async () => {
  try {
    await BootCamp.create(bootcamps);

    console.log("Data imported....");
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

//deleteData
const deleteData = async () => {
  try {
    await BootCamp.deleteMany();

    console.log("Data Destroyed....");
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
