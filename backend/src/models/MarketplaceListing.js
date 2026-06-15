const mongoose = require('mongoose');

const marketplaceInterestSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  offeredPrice: {
    type: Number,
    min: 0
  },
  quantityRequested: {
    type: Number,
    min: 0
  },
  currentOffer: {
    type: Number,
    min: 0
  },
  lastOfferBy: {
    type: String,
    enum: ['buyer', 'seller'],
    default: 'buyer'
  },
  bargainHistory: [{
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    byRole: {
      type: String,
      enum: ['buyer', 'seller'],
      required: true
    },
    amount: {
      type: Number,
      min: 0,
      required: true
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['requested', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'requested'
  }
}, {
  timestamps: true
});

const marketplaceListingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  crop: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton'],
    default: 'kg'
  },
  expectedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: 800
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    market: {
      type: String,
      trim: true
    }
  },
  contactPhone: {
    type: String,
    trim: true
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'sold'],
    default: 'active'
  },
  interests: [marketplaceInterestSchema]
}, {
  timestamps: true
});

marketplaceListingSchema.index({ status: 1, crop: 1, createdAt: -1 });
marketplaceListingSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
