const jwt = require("jsonwebtoken");
require("dotenv").config();

const fetchuser = (req, res, next) => {

  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Please Authenticate using correct Credentials" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SIGNATURE);
    req.user = data.user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Please Authenticate using correct Credentials" });
  }
};
module.exports = fetchuser;
