import React, { useEffect } from "react";
import userdata from "./data";
import "./App.css";
import crypto from "crypto";
import io from "socket.io-client";
let interval = null;

function TimeSeries() {
  const url =
    process.env.NODE_ENV === "production"
      ? "https://encrypted-timeseries-app.herokuapp.com/enc"
      : "http://localhost:4242/enc";
  const [connSuccess, setConnSuccess] = React.useState([]);
  const [savedPayload, setSavedpayload] = React.useState([]);
  const [info, setInfo] = React.useState("");

  // effect
  useEffect(() => {
    setSavedpayload(savedPayload);
  }, [savedPayload]);

  let socket = io(url);
  // on connection
  socket.on("welcome", (data) => {
    console.log("welcome", data);
    setConnSuccess(data);
  });
  // saved data
  socket.on("recieved", (data) => {
    console.log("DATA SAVED TO DB::", data);
    setSavedpayload([...savedPayload, data]);
  });
  //payload tranfer logic
  const startPayloadTransfer = () => {
    console.log("startPayloadTransfer::", userdata);
    setInfo("Transfer Started");

    interval = setInterval(() => {
      periodicTransmission();
    }, 1000);

    //periodicTransmission();
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
    let messageHash = crypto.createHash("sha256", "salt");
    messageHash.update(name + origin + destination);
    console.log(
      "messageHash::",
      messageHash.digest("hex"),
      messageHash.digest("hex").length
    );
    return { ...data, secret_key: messageHash.digest("hex") };
  };

  const encryptPayloadFunction = (payload) => {
    console.log("Encrypting payload::", payload);
    // algorithm
    const algorithm = "aes-256-cbc";
    // initialization vector
    const iv = crypto.randomBytes(16);
    // security key
    const securityKey = crypto
      .createHash("sha256")
      .update(String("timeseries"))
      .digest("base64")
      .substr(0, 32);

    // the cipher function
    const cipher = crypto.createCipheriv(algorithm, securityKey, iv);
    console.log("strigify::payload::", JSON.stringify(payload));

    const encryptedData = Buffer.concat([
      cipher.update(JSON.stringify(payload)),
      cipher.final(),
    ]);

    return {
      iv: iv.toString("hex"),
      content: encryptedData.toString("hex"),
    };
  };
  // clear interval and stop payload transfer
  const stopPayloadTransfer = () => {
    // notify server about payload transfer termination
    console.log("STOP INTERVAL::", interval);
    setInfo("Transfer Stopped");
    clearInterval(interval);
  };
  // clear payload data
  const clearPayloadData = () => {
    setSavedpayload([]);
    setInfo("");
  };
  return (
    <div>
      <code className="connection__msg"> {connSuccess}</code>
      <br />
      <button onClick={startPayloadTransfer}>Start Transfer</button>
      <button style={{ color: "red" }} onClick={stopPayloadTransfer}>
        Stop Transfer
      </button>

      <div className="payload">
        {savedPayload.map((data, index) => {
          return (
            <div key={index}>
              <code>{`Data Saved for - ${data.name} - at ${data.timeseries.timeField}`}</code>
            </div>
          );
        })}
      </div>
      <p>{info}</p>
      <button
        style={{ color: "red" }}
        onClick={clearPayloadData}
        hidden={savedPayload.length < 1}
        on
      >
        Clear Payload Data
      </button>
    </div>
  );
}
export default TimeSeries;
