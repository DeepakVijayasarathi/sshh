const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const log = async (userId, action, entity, entityId, details = null, ip = null) => {
  try {
    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [uuidv4(), userId, action, entity, entityId, details ? JSON.stringify(details) : null, ip]
    );
  } catch {
    // Non-critical — don't propagate audit failures
  }
};

const auditMiddleware = (action, entity) => (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (res.statusCode < 400) {
      const entityId = req.params.id || data?.id || null;
      log(req.user?.id, action, entity, entityId, null, req.ip);
    }
    return originalJson(data);
  };
  next();
};

module.exports = { log, auditMiddleware };
