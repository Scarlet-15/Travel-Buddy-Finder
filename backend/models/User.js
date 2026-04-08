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
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    registerNumber: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    googleId: { type: String },
    avatar: { type: String },
    createdTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    joinedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
