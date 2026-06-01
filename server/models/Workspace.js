const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    inviteCode: {
      type: String,
      unique: true,
      default: () => uuidv4().split('-')[0].toUpperCase(),
    },
    themeColor: {
      type: String,
      default: '#3b82f6',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'],
    },
  },
  { timestamps: true }
);

// regenerate invite code helper
workspaceSchema.methods.regenerateInvite = function () {
  this.inviteCode = uuidv4().split('-')[0].toUpperCase();
  return this.save();
};

module.exports = mongoose.model('Workspace', workspaceSchema);
