// authAdminMiddlewares.js (اصلاح‌شده)
const jwt = require("jsonwebtoken");

module.exports.authAdminMiddlewares = async (req, res, next) => {
  const { adminToken } = req.cookies;

  if (!adminToken) {
    return res.status(401).json({ error: "🙅‍♂️ لطفا ابتدا وارد شوید" });
  }

  try {
    const deCodeToken = jwt.verify(adminToken, process.env.SECRET);
    req.role = deCodeToken.role;
    req.id = deCodeToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "🙅‍♂️ توکن نامعتبر است" });
  }
};