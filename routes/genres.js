const express = require("express");
const router = express.Router();

const admin = require("../middlewares/admin");

const routeHandler = require("../middlewares/routeHandler");
const authMiddleware = require("../middlewares/authentication");

const mongoDBHandler = require("../mongoDB/mongoDBHandler");
const Joi = require("joi");
const { mongo } = require("mongoose");

// Defining requirements to match: we need the id with values between 1 to 1000 and its required field
// Title should have minimum 3 characters and maximum 10 chracters. It should be a required field with string value
const schema = Joi.object({
  _id: String,
  title: Joi.string().min(3).max(10).required(),
});

// Method for validating a given Genre object.
const validateSchema = async (updatedGenre, callback) => {
  const result = await schema.validate(updatedGenre);
  callback(result.error);
};

// endpoint for getting all current Genres
router.get("/", (req, res, next) => {
  console.log("/all");
  mongoDBHandler.findAll(req.params, (result, exception) => {
    return result ? res.send(result) : next(exception);
  });
});

// Endpoint for getting a specific Genre
router.get("/:id", (req, res, next) => {
  console.log("Inside get/:id00000----");
  if (!req.params.id) res.send("Specify the id of the required document ");
  else {
    mongoDBHandler.findOne({ _id: req.params.id }, (result, exception) => {
      return result ? res.send(result) : next(exception);
    });
  }
});

// Endpoint for adding a new genre after validating it against the scheme defined above
// Only the authentic users should be able to add a new genre
// authMiddlware checks the authorization
router.post("/add", authMiddleware, (req, res, next) => {
  console.log("/add endpoint called");
  validateSchema(req.body, (err) => {
    if (err) {
      res.send("Invalid Object definition: " + err);
    } else {
      mongoDBHandler.saveOne(req.body, (result, exception) => {
        return result ? res.send(result) : next(exception);
      });
    }
  });
});

// Endpoint for updating an existing Genre against the given id. The updated values are found in the body of the request object
// Only the authentic users should be able to update a genre
router.put("/update", authMiddleware, (req, res, next) => {
  console.log("/put endpoint called");
  validateSchema(req.body, (err) => {
    if (err) {
      res.send("Invalid Object definition: " + err);
    } else {
      mongoDBHandler.updateOne(req.body, (result, exception) => {
        console.log("sdfdfdf");
        console.log(result);
        return result ? res.send(result) : next(exception);
      });
    }
  });
});

//Endpoint for deleting a genre against the given id
// Only the authorized Admins should be able to delete the genre
// authMiddleware and admin are making sure the authorizationa and authentication
router.delete("/delete", [authMiddleware, admin], (req, res) => {
  console.log("/delete endpoint called");
  if (!req.body._id) res.send("_id cannot be undefined");
  else
    mongoDBHandler.deleteOne(req.body, (result, exception) => {
      return result ? res.send(result) : next(exception);
    });
});

module.exports = router;
