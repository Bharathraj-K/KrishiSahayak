const mongoose = require('mongoose');
const MarketplaceListing = require('../models/MarketplaceListing');
const { catchAsync, createError, sendResponse } = require('../middleware/errorHandler');

class MarketplaceController {
  static createListing = catchAsync(async (req, res, next) => {
    const { title, crop, quantity, unit, expectedPrice, description, city, district, state, market, availableFrom, contactPhone } = req.body;

    if (!title || !crop || quantity === undefined || expectedPrice === undefined) {
      return next(createError('title, crop, quantity, and expectedPrice are required', 400, 'MISSING_FIELDS'));
    }

    const quantityValue = Number(quantity);
    const expectedPriceValue = Number(expectedPrice);
    if (!Number.isFinite(quantityValue) || quantityValue <= 0 || !Number.isFinite(expectedPriceValue) || expectedPriceValue < 0) {
      return next(createError('quantity and expectedPrice must be valid positive numbers', 400, 'INVALID_INPUT'));
    }

    const listing = await MarketplaceListing.create({
      seller: req.user._id,
      title: String(title).trim(),
      crop: String(crop).trim(),
      quantity: quantityValue,
      unit: unit || 'kg',
      expectedPrice: expectedPriceValue,
      description: description || '',
      location: {
        city: city || req.user?.profile?.location?.city || district || '',
        district: district || city || req.user?.profile?.location?.district || req.user?.profile?.location?.city || '',
        state: state || req.user?.profile?.location?.state || '',
        market: market || ''
      },
      availableFrom: availableFrom || new Date(),
      contactPhone: contactPhone || req.user?.profile?.phone || ''
    });

    sendResponse(res, 201, { listing }, 'Marketplace listing created successfully');
  });

  static getListings = catchAsync(async (req, res) => {
    const { crop, state, city, status = 'active', page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (crop) query.crop = new RegExp(String(crop).trim(), 'i');
    if (state) query['location.state'] = new RegExp(`^${String(state).trim()}$`, 'i');
    if (city) query['location.city'] = new RegExp(String(city).trim(), 'i');

    // For customers, hide listings that are already finalized/allocated.
    // (legacy data might still have status=active even after acceptance)
    const effectiveRole = req.user?.role || 'farmer';
    if (effectiveRole === 'customer') {
      query['interests.status'] = { $nin: ['accepted', 'completed'] };
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [items, total] = await Promise.all([
      MarketplaceListing.find(query)
        .populate('seller', 'profile.name profile.location.state profile.phone isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      MarketplaceListing.countDocuments(query)
    ]);

    sendResponse(res, 200, {
      listings: items,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber)
      }
    }, 'Marketplace listings fetched successfully');
  });

  static getMyListings = catchAsync(async (req, res) => {
    const listings = await MarketplaceListing.find({ seller: req.user._id })
      .populate('interests.buyer', 'profile.name profile.phone profile.location.state isVerified')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, {
      listings,
      count: listings.length
    }, 'My marketplace listings fetched successfully');
  });

  static getMyInterests = catchAsync(async (req, res) => {
    const userObjectId = new mongoose.Types.ObjectId(req.user._id);
    const rows = await MarketplaceListing.aggregate([
      { $match: { 'interests.buyer': userObjectId } },
      { $unwind: '$interests' },
      { $match: { 'interests.buyer': userObjectId } },
      { $sort: { 'interests.updatedAt': -1, 'interests.createdAt': -1 } },
      {
        $project: {
          listingId: '$_id',
          listingTitle: '$title',
          crop: '$crop',
          quantity: '$quantity',
          unit: '$unit',
          listingStatus: '$status',
          sellerId: '$seller',
          interest: '$interests'
        }
      }
    ]);

    const sellerIds = [...new Set(rows.map((row) => String(row.sellerId)).filter(Boolean))];
    const sellerDocs = await mongoose.model('User').find(
      { _id: { $in: sellerIds } },
      'profile.name profile.phone profile.location.state isVerified'
    );
    const sellerMap = new Map(sellerDocs.map((seller) => [String(seller._id), seller]));

    const interests = rows.map((row) => ({
      listingId: row.listingId,
      listingTitle: row.listingTitle,
      crop: row.crop,
      quantity: row.quantity,
      unit: row.unit,
      seller: sellerMap.get(String(row.sellerId)) || null,
      listingStatus: row.listingStatus,
      interest: row.interest
    }));

    sendResponse(res, 200, { interests, count: interests.length }, 'My interests fetched successfully');
  });

  static expressInterest = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { message, offeredPrice, quantityRequested } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError('Invalid listing id', 400, 'INVALID_LISTING_ID'));
    }

    const listing = await MarketplaceListing.findById(id);
    if (!listing) {
      return next(createError('Listing not found', 404, 'LISTING_NOT_FOUND'));
    }
    if (listing.status !== 'active') {
      return next(createError('Only active listings can receive interests', 400, 'LISTING_NOT_ACTIVE'));
    }
    if (listing.seller.toString() === req.user._id.toString()) {
      return next(createError('You cannot express interest in your own listing', 400, 'SELF_INTEREST_NOT_ALLOWED'));
    }

    const existingRequested = listing.interests.find(
      (interest) => interest.buyer.toString() === req.user._id.toString() && interest.status === 'requested'
    );
    if (existingRequested) {
      return next(createError('You already have a pending request for this listing', 400, 'DUPLICATE_INTEREST'));
    }

    listing.interests.push({
      buyer: req.user._id,
      message: message || '',
      offeredPrice: offeredPrice !== undefined ? Number(offeredPrice) : undefined,
      quantityRequested: quantityRequested !== undefined ? Number(quantityRequested) : undefined,
      currentOffer: offeredPrice !== undefined ? Number(offeredPrice) : listing.expectedPrice,
      lastOfferBy: 'buyer',
      bargainHistory: [{
        byUser: req.user._id,
        byRole: 'buyer',
        amount: offeredPrice !== undefined ? Number(offeredPrice) : listing.expectedPrice,
        message: message || 'Initial offer'
      }]
    });
    await listing.save();

    sendResponse(res, 201, { listingId: listing._id }, 'Interest request sent successfully');
  });

  static updateInterestStatus = catchAsync(async (req, res, next) => {
    const { listingId, interestId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return next(createError('Invalid status', 400, 'INVALID_STATUS'));
    }

    const listing = await MarketplaceListing.findById(listingId);
    if (!listing) {
      return next(createError('Listing not found', 404, 'LISTING_NOT_FOUND'));
    }
    if (listing.seller.toString() !== req.user._id.toString()) {
      return next(createError('Only seller can update interest status', 403, 'FORBIDDEN'));
    }

    const interest = listing.interests.id(interestId);
    if (!interest) {
      return next(createError('Interest request not found', 404, 'INTEREST_NOT_FOUND'));
    }

    interest.status = status;
    if (status === 'accepted' || status === 'completed') {
      listing.status = 'sold';

      // Close out other pending requests when seller accepts one buyer.
      listing.interests.forEach((entry) => {
        if (String(entry._id) !== String(interest._id) && entry.status === 'requested') {
          entry.status = 'rejected';
        }
      });
    }
    await listing.save();

    sendResponse(res, 200, { listingId, interestId, status }, 'Interest status updated successfully');
  });

  static bargain = catchAsync(async (req, res, next) => {
    const { listingId, interestId } = req.params;
    const { amount, message } = req.body;

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue < 0) {
      return next(createError('Valid bargain amount is required', 400, 'INVALID_BARGAIN_AMOUNT'));
    }

    const listing = await MarketplaceListing.findById(listingId);
    if (!listing) {
      return next(createError('Listing not found', 404, 'LISTING_NOT_FOUND'));
    }

    const interest = listing.interests.id(interestId);
    if (!interest) {
      return next(createError('Interest request not found', 404, 'INTEREST_NOT_FOUND'));
    }

    const isSeller = listing.seller.toString() === req.user._id.toString();
    const isBuyer = interest.buyer.toString() === req.user._id.toString();
    if (!isSeller && !isBuyer) {
      return next(createError('Only buyer or seller can bargain on this request', 403, 'FORBIDDEN'));
    }
    if (!['requested', 'accepted'].includes(interest.status)) {
      return next(createError('Bargain allowed only for requested/accepted interests', 400, 'BARGAIN_NOT_ALLOWED'));
    }

    interest.currentOffer = amountValue;
    interest.lastOfferBy = isSeller ? 'seller' : 'buyer';
    interest.bargainHistory.push({
      byUser: req.user._id,
      byRole: isSeller ? 'seller' : 'buyer',
      amount: amountValue,
      message: message || ''
    });
    await listing.save();

    sendResponse(res, 200, {
      listingId,
      interestId,
      currentOffer: interest.currentOffer,
      lastOfferBy: interest.lastOfferBy
    }, 'Bargain updated successfully');
  });

  static closeListing = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await MarketplaceListing.findById(id);
    if (!listing) {
      return next(createError('Listing not found', 404, 'LISTING_NOT_FOUND'));
    }
    if (listing.seller.toString() !== req.user._id.toString()) {
      return next(createError('Only seller can close listing', 403, 'FORBIDDEN'));
    }

    listing.status = 'closed';
    await listing.save();
    sendResponse(res, 200, { listingId: listing._id, status: listing.status }, 'Listing closed successfully');
  });
}

module.exports = MarketplaceController;
