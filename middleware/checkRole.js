module.exports = function (requiredRole) {
    return (req, res, next) => {
      const user = req.user; // User object should be added by passport middleware
  
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const userRoles = user.roles || []; // Assume `roles` is an array in user schema
  
      // Check if user has the required role
      const hasRole = requiredRole.some(role => userRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ message: 'Forbidden: Insufficient Permissions' });
      }
  
      next();
    };
  };
  