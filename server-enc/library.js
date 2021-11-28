const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const User = require("./User");

const savePayload = async (payload, socket) => {
  console.log("SAVE Payload Start:", payload.length);
  const decryptedPayload = decryptPayload(payload);
  console.log("DECRYPTED PAYLOAD:", decryptedPayload);
  const checkDataIntegrity = validateDataIntegrity(decryptedPayload);
  console.log("checkDataIntegrity:", checkDataIntegrity);
  if (checkDataIntegrity.integrity === true) {
    console.log("Data integrigity achieved");
    persistData(checkDataIntegrity.content, socket);
  } else {
    console.error("Data integrigity failed- reject payload");
  }
};
const decryptPayload = (encryptedPayload) => {
  console.log("Decrypt Payload:", encryptedPayload);

  // secret key generate 32 bytes
  const securityKey = crypto
    .createHash("sha256")
    .update(String("timeseries"))
    .digest("base64")
    .substr(0, 32);

  // the decipher function
  const decipher = crypto.createDecipheriv(
    algorithm,
    securityKey,
    Buffer.from(encryptedPayload.iv, "hex")
  );

  const decryptedPayload = Buffer.concat([
    decipher.update(Buffer.from(encryptedPayload.content, "hex")),
    decipher.final(),
  ]);
  console.log("Decrypted Payload: " + decryptedPayload.toString());
  return decryptedPayload.toString();
};
const validateDataIntegrity = (decryptedPayload) => {
  let resultObject = { integrity: false };
  console.log("Validating data integregity");
  // parse
  decryptedPayload = JSON.parse(decryptedPayload);
  const { name, origin, destination, secret_key } = decryptedPayload || {};
  let messageHash = crypto.createHash("sha256", "salt");
  console.log(name, origin, destination);
  messageHash.update(name + origin + destination);
  if (messageHash.digest("hex").length === secret_key.length) {
    console.log("match");
    resultObject.integrity = true;
  }
  console.log("result::", resultObject);
  return { ...resultObject, content: decryptedPayload };
};
const persistData = (userdata, socket) => {
  console.log("Persist data::", userdata);
  let result = null;
  let timeseries = {
    timeField: new Date().toISOString(),
    metaField: userdata,
    granularity: "minutes",
  };
  let newUser = new User({
    name: userdata.name,
    origin: userdata.origin,
    destination: userdata.destination,
    values: userdata,
    timeseries: timeseries,
  });
  delete newUser.values.secret_key;
  newUser.save((err, user) => {
    if (err) {
      console.log("Error Creating collection::", err);
      socket.emit("recieved", err.message);
    } else {
      console.log("User Created::", user);
      socket.emit("recieved", user);
    }
  });
};
const getAllData = async (res) => {
  User.find()
    .lean()
    .exec((err, users) => {
      if (err) {
        console.log("Error getting users data");
        let response = { status: "error", data: err.message };
        res.status(500).json(response);
      } else {
        console.log("users:::", users.length);
        let response = { status: "success", data: users };
        res.status(200).json(response);
      }
    });
};
const getFilterData = async (filter, res) => {
  const queryOptions = {
    $or: [
      { origin: { $regex: new RegExp(filter.toLowerCase(), "i") } },
      { name: { $regex: new RegExp(filter.toLowerCase(), "i") } },
      { destination: { $regex: new RegExp(filter.toLowerCase(), "i") } },
      { timeseries: { $regex: new RegExp(filter.toLowerCase(), "i") } },
    ],
  };
  return User.find(queryOptions, (err, users) => {
    if (err) {
      console.log("Error Retrieving collection::", err);
    } else {
      console.log("Users Found::", users);
      let response = { status: "success", data: users };
      res.status(200).json(response);
    }
  });
};
module.exports = {
  savePayload,
  decryptPayload,
  validateDataIntegrity,
  persistData,
  getAllData,
  getFilterData,
};
