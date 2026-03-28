const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Trip = require('./models/Trip');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Trip.deleteMany({});

  const users = await User.create([
    { name: 'Samiksha Pathare', email: '206125019@nitt.edu', phone: '9876543210', registerNumber: '206125019', password: 'password123' },
    { name: 'Rohan Kailash', email: '206125017@nitt.edu', phone: '9876543211', registerNumber: '206125017', password: 'password123' },
    { name: 'Muhmmad Abrar', email: '205124016@nitt.edu', phone: '9876543212', registerNumber: '205124016', password: 'password123' },
  ]);

  await Trip.create([
    {
      organizerId: users[0]._id,
      destination: 'Chennai',
      travelDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      preferredSex: 'Any',
      companionUntilStep: 2,
      transportSteps: [
        { stepNumber: 1, mode: 'Cab', from: 'NIT Trichy', to: 'Trichy Railway Station', transportName: 'OLA/Uber', departureTime: '08:00' },
        { stepNumber: 2, mode: 'Train', from: 'Trichy Railway Station', to: 'Chennai Central', transportName: 'Rockfort Express 12671', departureTime: '09:30' },
      ],
      additionalDetails: 'Looking for someone to share cab cost to station.',
    },
    {
      organizerId: users[1]._id,
      destination: 'Bangalore',
      travelDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      preferredSex: 'Female',
      transportSteps: [
        { stepNumber: 1, mode: 'Cab', from: 'NIT Trichy', to: 'Trichy Airport', transportName: 'OLA', departureTime: '14:00' },
        { stepNumber: 2, mode: 'Flight', from: 'Trichy Airport', to: 'Kempegowda International Airport', transportName: 'IndiGo 6E-234', departureTime: '17:00' },
      ],
    },
  ]);

  console.log('✅ Seed data inserted successfully!');
  console.log('Test credentials: 206125019@nitt.edu / password123');
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });
