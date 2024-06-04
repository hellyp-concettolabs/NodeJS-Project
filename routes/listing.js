const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
// const multer = require("multer");
// const { storage } = require("../cloudConfig.js");
// const upload = multer({ storage: storage });

//index listing api & Create Route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    validateListing,
    wrapAsync(listingController.createNewListing)
  );

//New Route
router.get("/new", isLoggedIn, listingController.renderNewListingForm);

//show route & Update Route & Delete Route
router
  .route("/:id")
  .get(wrapAsync(listingController.showSingleListing))
  .put(
    validateListing,
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
