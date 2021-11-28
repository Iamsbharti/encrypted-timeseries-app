const chai = require("chai");
const should = chai.should();
const dotenv = require("dotenv");
dotenv.config();
const library = require("../server-enc/library");
const { savePayload, decryptPayload, validateDataIntegrity, persistData } =
  library;
// init socket
const io = require("socket.io-client");

describe("Socket Connection Test", () => {
  let socketTest;
  let decryptedPayload = {
    name: "Morty",
    origin: "Greenland",
    destination: "Norway",
    secret_key:
      "bacc327af7631804f87ff538738132a4f5055c401189f85ab919f89fe744cb22",
  };
  let encryptedPayload = {
    content:
      "34183c79759f983c579b5e3345d8998c90bd5543a5f0c375adbc9a75023a503c41fd677614f7ced340146962feb11a0d8deac7c842fd0e2d4f37f52437fcfb2bdf25ffd03d3086d44b77aaa4fe1a7b22fb5eb52e6cb337c83bbd95cc5557294304905d6d54aec97738fa669cd8170df9e3d95a4ac35191591267e9459ccc14491effb14853b0a708b68950dd300012ea",
    iv: "7d3756282cae395e174d7a86dfcf133a",
  };
  beforeEach(function (done) {
    // Setup
    socketTest = io.connect("http://localhost:4242/enc", {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
    });
    socketTest.on("connect", function (data) {
      console.log("Socket Test connection success");
      done();
    });
  });

  context("decrypt payload", () => {
    it("should decrypt payload", () => {
      let decryptedPayloadTest = decryptPayload(encryptedPayload);

      decryptedPayloadTest.should.be.deep.equal(
        JSON.stringify(decryptedPayload)
      );
    });
  });
  context("validate data integretity", () => {
    it("should validate data ", () => {
      let resultObject = validateDataIntegrity(
        JSON.stringify(decryptedPayload)
      );
      resultObject.should.be.deep.equal({
        integrity: true,
        content: decryptedPayload,
      });
    });
  });
  context("persist data", () => {
    it("should persist data", () => {
      let result = persistData(decryptedPayload, socketTest);
      socketTest.on("recieved", function (data) {
        result.should.be.deep.equal(data);
      });
    });
  });
});
