require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    Task.deleteMany({}),
    Activity.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const users = await User.create([
    { name: 'Aman Verma', email: 'aman@example.com', password: 'password123' },
    { name: 'Priya Sharma', email: 'priya@example.com', password: 'password123' },
    { name: 'Rahul Mehta', email: 'rahul@example.com', password: 'password123' },
  ]);

  const workspace = await Workspace.create({
    name: 'Core Platform Team',
    description: 'Backend infrastructure and API work',
    owner: users[0]._id,
    themeColor: '#3b82f6',
    members: [
      { user: users[0]._id, role: 'owner' },
      { user: users[1]._id, role: 'admin' },
      { user: users[2]._id, role: 'member' },
    ],
  });

  await User.updateMany(
    { _id: { $in: users.map((u) => u._id) } },
    { $addToSet: { joinedWorkspaces: workspace._id } }
  );

  const tasks = await Task.create([
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment.',
      status: 'completed',
      priority: 'high',
      workspace: workspace._id,
      createdBy: users[0]._id,
      assignedTo: users[0]._id,
      tags: ['devops', 'infra'],
      order: 0,
    },
    {
      title: 'Implement JWT refresh token logic',
      description: 'Short-lived access tokens + long-lived refresh tokens stored in httpOnly cookie.',
      status: 'in-progress',
      priority: 'high',
      workspace: workspace._id,
      createdBy: users[0]._id,
      assignedTo: users[1]._id,
      tags: ['auth', 'security'],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      order: 0,
    },
    {
      title: 'Design task filtering API',
      description: 'Support filtering by status, priority, tag, and assignee with pagination.',
      status: 'review',
      priority: 'medium',
      workspace: workspace._id,
      createdBy: users[1]._id,
      assignedTo: users[2]._id,
      tags: ['api'],
      order: 0,
    },
    {
      title: 'Mobile responsive audit',
      description: 'Check all pages on 375px, 768px breakpoints and fix layout breaks.',
      status: 'backlog',
      priority: 'low',
      workspace: workspace._id,
      createdBy: users[2]._id,
      assignedTo: null,
      tags: ['frontend', 'ui'],
      order: 0,
    },
    {
      title: 'Rate limiting middleware',
      description: 'Add per-IP rate limiting on auth routes. 10 req/min on login.',
      status: 'backlog',
      priority: 'medium',
      workspace: workspace._id,
      createdBy: users[0]._id,
      assignedTo: users[0]._id,
      tags: ['security', 'infra'],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      order: 1,
    },
  ]);

  await Activity.create([
    {
      actor: users[0]._id,
      action: 'created_workspace',
      details: 'Created workspace "Core Platform Team"',
      workspace: workspace._id,
    },
    {
      actor: users[1]._id,
      action: 'joined_workspace',
      details: 'Priya Sharma joined the workspace',
      workspace: workspace._id,
    },
    {
      actor: users[0]._id,
      action: 'moved_task',
      details: 'Moved "Set up CI/CD pipeline" from in-progress to completed',
      taskRef: tasks[0]._id,
      workspace: workspace._id,
    },
    {
      actor: users[1]._id,
      action: 'created_task',
      details: 'Created task "Design task filtering API"',
      taskRef: tasks[2]._id,
      workspace: workspace._id,
    },
  ]);

  console.log('Seed complete');
  console.log('---');
  console.log('Login credentials:');
  users.forEach((u) => console.log(`  ${u.email} / password123`));
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
