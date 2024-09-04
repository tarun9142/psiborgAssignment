const Task = require("../models/Task");
const User = require("../models/User");

const { sendSmsNotification, sendEmailNotification } = require('../services/notificationService');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      createdBy: req.user._id, // Associate the task with the user
    });

    await newTask.save();
    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { priority, status, sortBy = "dueDate" } = req.query;

    // Build the query object
    let query = {assignedTo:req.user.id};
    if (priority) {
      query.priority = { $in: priority.split(",") };
    }
    if (status) {
      query.status = { $in: status.split(",") };
    }

    // Define sorting options
    const sortOptions = {};
    if (sortBy === "priority") {
      sortOptions.priority = 1; // Ascending
    } else if (sortBy === "status") {
      sortOptions.status = 1; // Ascending
    } else {
      sortOptions.dueDate = 1; // Default sorting by dueDate
    }

    // Fetch tasks from the database
    const tasks = await Task.find(query).sort(sortOptions);

    // Send response
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, dueDate, priority, status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { title, description, dueDate, priority, status },
      { new: true } // Return the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Assign a task to a user
exports.assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Assign task to the user
    if(task.assignedTo){
      return res.status(400).json({ message: "Cannot assign, This task is already assigned to someone." });
    }
    task.assignedTo = userId;
    task.assignedBy = req.user.id;
    await task.save();

    // Find the assignee to get their notification preference
    const assignee = await User.findById(userId);

    // Send notification based on user preference
    if (assignee.notificationPreferences === 'sms') {
      sendSmsNotification(assignee.number, `You have been assigned a new task: ${task.title}`);
    } else {
      sendEmailNotification(assignee.email, 'New Task Assigned', `You have been assigned a new task: ${task.title}`);
    }

    res.status(200).json({ message: "Task assigned successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// View assigned tasks for a user
exports.viewAssignedTasksByManager = async (req, res) => {
  try {
    const managerId = req.user._id; // Assuming req.user contains the authenticated manager's ID

    // Fetch tasks assigned by the logged-in manager
    const tasks = await Task.find({ assignedBy: managerId }).populate('assignedTo', 'username email'); // Optionally populate assigned user details

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateTaskAssignment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const assignee = await User.findById(userId);
    if(!assignee){
      return res.status(404).json({ message: "User not found" });
    }

    // Assign task to the user
    task.assignedTo = userId;
    await task.save();

    // Find the assignee to get their notification preference
    
    // Send notification based on user preference
    if (assignee.notificationPreferences === 'sms') {
      sendSmsNotification(assignee.number, `You have been assigned a new task: ${task.title}`);
    } else {
      sendEmailNotification(assignee.email, 'New Task Assigned', `You have been assigned a new task: ${task.title}`);
    }

    res.status(200).json({ message: "Task assigned successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.updateTaskStatus = async (req, res) => {
  try {
    const userId = req.user._id; // The authenticated user's ID from the JWT middleware
    const { taskId, status } = req.body; // Extracting taskId and new status from request body

    // Find the task by ID
    const task = await Task.findById(taskId);

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the task is assigned to the authenticated user
    if (!task.assignedTo || task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this task status' });
    }

    // Update the task status
    task.status = status;
    await task.save();

    // Find the assignee to get their notification preference
    const assignee = await User.findById(task.assignedBy);

    // Send notification based on user preference
    if (assignee.notificationPreferences === 'sms') {
      sendSmsNotification(assignee.phoneNumber, `You have been assigned a new task: ${task.title}`);
    } else {
      sendEmailNotification(assignee.email, 'Task Status Updated', `Status updated for: ${task.title}`);
    }

    res.status(200).json({ message: 'Task status updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task status' });
  }
};

