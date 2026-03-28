const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    joinUntilStep: { type: Number, required: true },
    finalDestination: { type: String, required: true, trim: true },
    travelDate: { type: Date, required: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'withdrawn'], default: 'pending' },
  },
  { timestamps: true }
);

joinRequestSchema.index({ tripId: 1 });
joinRequestSchema.index({ userId: 1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
