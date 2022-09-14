const mongoose = require("mongoose");

const MONGO_URL =
  "mongodb+srv://adiperformion:Zysboc4wMcWuLXRi@performion.7syuejd.mongodb.net/bubu?retryWrites=true&w=majority";

mongoose.connection.once("open", () => {
  console.log("Mongo Db Connection is ready");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongo Db Connection  error:", err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect(){
    await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
