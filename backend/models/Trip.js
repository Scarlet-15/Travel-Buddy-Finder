const mongoose = require('mongoose');

const transportStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  mode: { type: String, enum: ['Cab', 'Train', 'Flight', 'Bus', 'Metro', 'Auto'], required: true },
  from: { type: String, required: true, trim: true },
  to: { type: String, required: true, trim: true },
  transportName: { type: String, trim: true }, // train number, flight name, bus service
  departureTime: { type: String }, // stored as string e.g. "2024-08-15T14:30"
});

const tripSchema = new mongoose.Schema(
  {
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: String, required: true, trim: true },
    travelDate: { type: Date, required: true },
    preferredSex: { type: String, enum: ['Any', 'Male', 'Female'], default: 'Any' },
    companionUntilStep: { type: Number, default: null }, // null = all steps
    transportSteps: [transportStepSchema],
    additionalDetails: { type: String, trim: true },
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JoinRequest' }],
    // Future: status management
    status: { type: String, enum: ['open', 'full', 'completed', 'cancelled'], default: 'open' },
    maxCompanions: { type: Number, default: 4 },
    // Future: real-time chat room id
    chatRoomId: { type: String },
  },
  { timestamps: true }
);

// Index for search
tripSchema.index({ destination: 'text', 'transportSteps.from': 'text', 'transportSteps.to': 'text' });
tripSchema.index({ travelDate: 1 });
tripSchema.index({ organizerId: 1 });

module.exports = mongoose.model('Trip', tripSchema);
