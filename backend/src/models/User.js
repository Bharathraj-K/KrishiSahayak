const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  profile: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    },
    avatar: {
      type: String, // URL to profile image
      default: null
    },
    location: {
      address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      },
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India'
      },
      pincode: {
        type: String,
        match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
      }
    },
    farmDetails: {
      farmSize: {
        type: String,
        enum: ['Small (< 2 acres)', 'Medium (2-10 acres)', 'Large (> 10 acres)', 'Commercial'],
        default: 'Small (< 2 acres)'
      },
      farmType: {
        type: String,
        enum: ['Organic', 'Conventional', 'Mixed'],
        default: 'Conventional'
      },
      cropsGrown: [{
        type: String,
        trim: true
      }],
      soilType: {
        type: String,
        enum: ['Clay', 'Sandy', 'Loamy', 'Silt', 'Chalky', 'Peaty']
      },
      irrigationType: {
        type: String,
        enum: ['Rain-fed', 'Drip', 'Sprinkler', 'Flood', 'Mixed']
      }
    }
  },
  settings: {
    notifications: {
      weather: {
        type: Boolean,
        default: true
      },
      priceAlerts: {
        type: Boolean,
        default: true
      },
      diseases: {
        type: Boolean,
        default: true
      },
      general: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    units: {
      temperature: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      },
      area: {
        type: String,
        enum: ['acre', 'hectare'],
        default: 'acre'
      }
    }
  },
  deviceInfo: {
    fcmToken: String, // For push notifications
    deviceType: {
      type: String,
      enum: ['android', 'ios', 'web']
    },
    lastLoginDevice: String
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    expiresAt: Date,
    features: [{
      type: String
    }]
  },
  stats: {
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    },
    diseaseScansCount: {
      type: Number,
      default: 0
    },
    chatMessagesCount: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ 'profile.location.coordinates': '2dsphere' });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function() {
  return {
    ...this.profile,
    email: this.email,
    isVerified: this.isVerified,
    memberSince: this.createdAt
  };
});

// Hash password before saving
userSchema.pre('save', async function() {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) return;
  
  // Hash password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Update lastLogin when user logs in
userSchema.pre('save', function() {
  if (this.isNew || this.isModified('stats.loginCount')) {
    this.stats.lastLogin = new Date();
  }
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to increment stats
userSchema.methods.incrementStat = async function(statName, value = 1) {
  if (this.stats[statName] !== undefined) {
    this.stats[statName] += value;
    return await this.save({ validateBeforeSave: false });
  }
  return this;
};

// Static method to find users by location (within radius)
userSchema.statics.findByLocation = function(coordinates, radiusInKm = 50) {
  return this.find({
    'profile.location.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates // [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    },
    isActive: true
  });
};

// Static method to get user stats
userSchema.statics.getGlobalStats = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
        totalLogins: { $sum: '$stats.loginCount' },
        totalDiseaseScans: { $sum: '$stats.diseaseScansCount' },
        totalChatMessages: { $sum: '$stats.chatMessagesCount' }
      }
    }
  ]);
};

const User = mongoose.model('User', userSchema);

module.exports = User;