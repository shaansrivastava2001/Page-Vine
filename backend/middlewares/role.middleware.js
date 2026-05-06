/**
 * Role-gating middleware. Use after tokenMiddleware so req.user is populated.
 *
 *   router.post("/users/create", tokenMiddleware, requireRole("Admin", "Super Admin"), ctrl.createUser);
 */
const requireRole = (...allowed) => (req, res, next) => {
  const role = req.user && req.user.role;
  if (!role || !allowed.includes(role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  return next();
};

module.exports = requireRole;
