const { validationResult } = require('express-validator');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { logActivity } = require('../services/activityService');

const createWorkspace = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, description, themeColor } = req.body;
    const workspace = await Workspace.create({
      name,
      description,
      themeColor,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedWorkspaces: workspace._id },
    });

    await logActivity({
      actor: req.user._id,
      action: 'created_workspace',
      details: `Created workspace "${name}"`,
      workspace: workspace._id,
    });

    await workspace.populate('members.user', 'name email avatar');
    res.status(201).json({ workspace });
  } catch (err) {
    next(err);
  }
};

const getUserWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ workspaces });
  } catch (err) {
    next(err);
  }
};

const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email');
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    res.json({ workspace });
  } catch (err) {
    next(err);
  }
};

const updateWorkspace = async (req, res, next) => {
  try {
    const { name, description, themeColor } = req.body;

    // only owner/admin can update
    const ws = req.workspace;
    const member = ws.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!['owner', 'admin'].includes(member?.role)) {
      return res.status(403).json({ message: 'Only admins can update workspace settings' });
    }

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.workspaceId,
      { name, description, themeColor },
      { new: true, runValidators: true }
    ).populate('members.user', 'name email avatar');

    res.json({ workspace });
  } catch (err) {
    next(err);
  }
};

const joinWorkspace = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ message: 'Invite code is required' });

    const workspace = await Workspace.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!workspace) return res.status(404).json({ message: 'Invalid invite code' });

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (alreadyMember) return res.status(409).json({ message: 'Already a member' });

    workspace.members.push({ user: req.user._id, role: 'member' });
    await workspace.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedWorkspaces: workspace._id },
    });

    await logActivity({
      actor: req.user._id,
      action: 'joined_workspace',
      details: `${req.user.name} joined the workspace`,
      workspace: workspace._id,
    });

    const io = req.app.get('io');
    io.to(`workspace:${workspace._id}`).emit('workspace:member_joined', {
      user: { _id: req.user._id, name: req.user.name },
    });

    await workspace.populate('members.user', 'name email avatar');
    res.json({ workspace });
  } catch (err) {
    next(err);
  }
};

const leaveWorkspace = async (req, res, next) => {
  try {
    const ws = req.workspace;
    if (ws.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Owner cannot leave their workspace' });
    }

    ws.members = ws.members.filter((m) => m.user.toString() !== req.user._id.toString());
    await ws.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedWorkspaces: ws._id },
    });

    res.json({ message: 'Left workspace' });
  } catch (err) {
    next(err);
  }
};

const regenerateInvite = async (req, res, next) => {
  try {
    const ws = req.workspace;
    const member = ws.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!['owner', 'admin'].includes(member?.role)) {
      return res.status(403).json({ message: 'Only admins can regenerate invite codes' });
    }
    await ws.regenerateInvite();
    res.json({ inviteCode: ws.inviteCode });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  updateWorkspace,
  joinWorkspace,
  leaveWorkspace,
  regenerateInvite,
};
