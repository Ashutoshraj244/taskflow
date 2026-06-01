const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const { logActivity } = require('../services/activityService');

const getTasks = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { status, priority, assignedTo, tag, search, sort } = req.query;

    const filter = { workspace: workspaceId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (tag) filter.tags = tag;
    if (search) filter.title = { $regex: search, $options: 'i' };

    let sortOption = { order: 1, createdAt: -1 };
    if (sort === 'dueDate') sortOption = { dueDate: 1 };
    else if (sort === 'priority') sortOption = { priority: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name')
      .sort(sortOption);

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('workspace', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { workspaceId } = req.params;
    const { title, description, priority, status, dueDate, assignedTo, tags, estimatedHours } =
      req.body;

    // set order to end of column
    const lastTask = await Task.findOne({ workspace: workspaceId, status: status || 'backlog' })
      .sort({ order: -1 })
      .select('order');
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo: assignedTo || null,
      tags: tags || [],
      estimatedHours,
      workspace: workspaceId,
      createdBy: req.user._id,
      order,
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name' },
    ]);

    await logActivity({
      actor: req.user._id,
      action: 'created_task',
      details: `Created task "${title}"`,
      taskRef: task._id,
      workspace: workspaceId,
    });

    const io = req.app.get('io');
    io.to(`workspace:${workspaceId}`).emit('task:created', { task });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const existing = await Task.findById(taskId);
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const prevStatus = existing.status;
    const updates = req.body;

    const task = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name' },
    ]);

    let details = `Updated task "${task.title}"`;
    if (updates.status && updates.status !== prevStatus) {
      details = `Moved "${task.title}" from ${prevStatus} to ${updates.status}`;
    }

    await logActivity({
      actor: req.user._id,
      action: updates.status && updates.status !== prevStatus ? 'moved_task' : 'updated_task',
      details,
      taskRef: task._id,
      workspace: task.workspace,
    });

    const io = req.app.get('io');
    io.to(`workspace:${task.workspace}`).emit('task:updated', { task });

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await logActivity({
      actor: req.user._id,
      action: 'deleted_task',
      details: `Deleted task "${task.title}"`,
      workspace: task.workspace,
    });

    await task.deleteOne();

    const io = req.app.get('io');
    io.to(`workspace:${task.workspace}`).emit('task:deleted', { taskId: req.params.taskId });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // [{ _id, order, status }]
    if (!Array.isArray(tasks)) return res.status(400).json({ message: 'tasks array required' });

    const ops = tasks.map(({ _id, order, status }) => ({
      updateOne: { filter: { _id }, update: { order, status } },
    }));
    await Task.bulkWrite(ops);

    const io = req.app.get('io');
    io.to(`workspace:${req.params.workspaceId}`).emit('task:reordered', { tasks });

    res.json({ message: 'Reordered' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, reorderTasks };
