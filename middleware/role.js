// middleware/role.js

// For example, only Admins can add members update the FamilyRoute
// const role = require('../middleware/role');
//
// @route   POST /api/families/:familyId/members
// @desc    Add a member to a family
// @access  Private (Admin only)
// router.post(
//   '/:familyId/members',
//   [
//     auth,
//     role('Admin'),
//     [
//       check('email', 'Valid email is required to add member').isEmail(),
//     ],
//   ],
//   familyController.addMember
// );

module.exports = function(requiredRole) {
    return function(req, res, next) {
      const userRole = req.user.role;
  
      if (userRole !== requiredRole) {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      next();
    };
  };
  