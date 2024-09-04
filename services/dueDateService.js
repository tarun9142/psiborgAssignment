// scheduler.js

const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendSmsNotification,sendEmailNotification } = require('./notificationService');

// Schedule job to run every day at 9 AM
cron.schedule('0 0 9 * * * *', async () => {
    try {
        console.log('Running due date reminder job...');

        const tasksDueSoon = await Task.find({
          dueDate: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) }, // Due within the next 24 hours
          status: { $ne: 'completed' }
        });
      
        for (const task of tasksDueSoon) {
          const user = await User.findById(task.assignedTo);
          if (user ) {
            if (user.notificationPreferences === 'sms') {
                sendSmsNotification(user.number,"Task Due", `Task Due on ${task.dueDate}, Title: ${task.title}`);
              } else {
                sendEmailNotification(user.email,"Task Due", `Task Due on ${task.dueDate}, Title: ${task.title}`);
            }
          }
        }
    } catch (error) {
        console.log("error runnimg dueDateService..",error);
    }

});
