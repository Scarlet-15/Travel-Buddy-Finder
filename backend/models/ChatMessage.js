const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
    {
        chatRoomId: { type: String, required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        message: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);