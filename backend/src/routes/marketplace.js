const express = require('express');
const MarketplaceController = require('../controllers/marketplaceController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/listings', MarketplaceController.getListings);
router.post('/listings', restrictTo('farmer'), MarketplaceController.createListing);
router.get('/my-listings', restrictTo('farmer'), MarketplaceController.getMyListings);
router.get('/my-interests', restrictTo('customer'), MarketplaceController.getMyInterests);
router.post('/listings/:id/interests', restrictTo('customer'), MarketplaceController.expressInterest);
router.patch('/listings/:listingId/interests/:interestId', restrictTo('farmer'), MarketplaceController.updateInterestStatus);
router.patch('/listings/:listingId/interests/:interestId/bargain', MarketplaceController.bargain);
router.patch('/listings/:id/close', restrictTo('farmer'), MarketplaceController.closeListing);

module.exports = router;
