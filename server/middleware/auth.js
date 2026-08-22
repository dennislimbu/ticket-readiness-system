const { CognitoJwtVerifier } = require("aws-jwt-verify");
require("dotenv").config();

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID
});

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required"
      });
    }

    const token = authHeader.substring(7);

    const payload = await verifier.verify(token);

    const groups = payload["cognito:groups"] || [];

    req.user = {
      sub: payload.sub,
      username: payload.username,
      clientId: payload.client_id,
      groups
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      error: "Invalid or expired authentication token"
    });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required"
      });
    }

    if (!req.user.groups.includes(role)) {
      return res.status(403).json({
        error: `Access denied. ${role} role required.`
      });
    }

    next();
  };
};

const requireAnyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required"
      });
    }

    const authorised = roles.some((role) =>
      req.user.groups.includes(role)
    );

    if (!authorised) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions."
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  requireAnyRole
};