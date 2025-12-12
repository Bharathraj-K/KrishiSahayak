const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options that are no longer needed in newer versions
      // useNewUrlParser and useUnifiedTopology are defaults in Mongoose 6+
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown - commented out to prevent premature exit
    // process.on('SIGINT', async () => {
    //   try {
    //     await mongoose.connection.close();
    //     console.log('🛑 MongoDB connection closed through app termination');
    //     process.exit(0);
    //   } catch (err) {
    //     console.error('❌ Error closing MongoDB connection:', err);
    //     process.exit(1);
    //   }
    // });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Retry connection after 5 seconds
    console.log('🔄 Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Function to get connection status
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

module.exports = { connectDB, getConnectionStatus };