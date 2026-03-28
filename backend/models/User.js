const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => v.endsWith('@nitt.edu'),
        message: 'Email must be an NIT Trichy email (@nitt.edu)',
      },
    },
    phone: { type: String, required: true, trim: true },
    registerNumber: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    // Future: OAuth fields
    googleId: { type: String },
    avatar: { type: String },
    createdTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    joinedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    // Future: notification preferences
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
