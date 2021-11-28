import React from "react";
import userdata from "./data";
import "./App.css";
import crypto from "crypto";
import io from "socket.io-client";

function TimeSeries() {
  const url =
    process.env.NODE_ENV === "production" ? "" : "http://localhost:4242/enc";
  const [connSuccess, setConnSuccess] = React.useState([]);

  let socket = io(url);
  // on connection
  socket.on("welcome", (data) => {
    console.log("welcome", data);
    setConnSuccess(data);
  });

  //payload tranfer logic
  let interval = null;
  const startPayloadTransfer = () => {
    console.log("startPayloadTransfer::", userdata);
    interval = setInterval(() => {
      periodicTransmission();
    }, 1000);
  };
  const periodicTransmission = () => {
    let randomUser = Math.floor(Math.random() * userdata.length);
    console.log(randomUser, userdata[randomUser]);
    const payloadWithSecretKey = computeSecurityKey(userdata[randomUser]);
    console.log("payloadWithSecretKey::", payloadWithSecretKey);
    // encrypt payload
    let encryptedPayload = encryptPayloadFunction(payloadWithSecretKey);
    console.log("Final encrypted payload::", encryptedPayload);
    // emit payload transfer over socket
    socket.emit("payloadTransfer", encryptedPayload);
  };
  const computeSecurityKey = (data) => {
    const { name, origin, destination } = data;
    let messageHash = crypto.createHash("sha256");
    messageHash.update(name + origin + destination);
    return { ...data, secret_key: messageHash.digest("hex") };
  };

  const encryptPayloadFunction = (payload) => {
    console.log("Encrypting payload::", payload);
    // algorithm
    const algorithm = "aes-256-cbc";
    // initialization vector
    const iv = crypto.randomBytes(16);
    // security key
    const securitykey = crypto.randomBytes(32);
    // the cipher function
    const cipher = crypto.createCipheriv(algorithm, securitykey, iv);

    let encryptedData = cipher.update(JSON.stringify(payload), "utf-8", "hex");
    encryptedData += cipher.final("hex");
    console.log("Encrypted message: " + encryptedData);
    return encryptedData;
  };
  // clear interval and stop payload transfer
  const stopPayloadTransfer = () => {
    // notify server about payload transfer termination
    clearInterval(interval);
  };

  return (
    <div>
      <code className="connection__msg"> {connSuccess}</code>
      <br />
      <button onClick={startPayloadTransfer}>Start Transfer</button>
      <button style={{ color: "red" }} onClick={stopPayloadTransfer}>
        Stop Transfer
      </button>
      <div className="payload"></div>
    </div>
  );
}
export default TimeSeries;
