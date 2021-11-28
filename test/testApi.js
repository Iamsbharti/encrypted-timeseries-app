const chai = require("chai");
const should = chai.should();
const dotenv = require("dotenv");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

dotenv.config();
const library = require("../server-enc/library");
const { savePayload, decryptPayload, validateDataIntegrity, persistData } =
  library;
const server = require("../server-enc/server");
describe("Socket Connection Test", () => {
  context("Get All Users", () => {
    it("all users should be retunred", (done) => {
      chai
        .request(server)
        .get("http://localhost:4242/payload")
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.a("object");
          res.should.have.property("status");
          res.should.have.property("data");
          res.should.have.property("data").to.be.an("array");
          done();
        });
    });
  });
  context("Get All Users based on a filter", () => {
    it("all users should be returned for a match", (done) => {
      chai
        .request(server)
        .get("http://localhost:4242/search/payload/?search=Goa")
        .end((err, res) => {
          console.log("RESPONSE::", res);
          res.should.have.status(200);
          res.should.be.a("object");
          res.should.have.property("status");
          res.should.have.property("data");
          res.should.have.property("data").to.be.an("array");
          done();
        });
    });
  });
});
