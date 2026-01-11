import { broadcastEvent } from './websocket.service.js';

/**
 * Rules Engine - Evaluiert und führt Automation Rules aus
 */

// ===== CONDITION EVALUATORS =====

const operators = {
  equals: (a, b) => a === b,
  not_equals: (a, b) => a !== b,
  greater_than: (a, b) => Number(a) > Number(b),
  less_than: (a, b) => Number(a) < Number(b),
  greater_or_equal: (a, b) => Number(a) >= Number(b),
  less_or_equal: (a, b) => Number(a) <= Number(b),
  contains: (a, b) => String(a).includes(String(b)),
  not_contains: (a, b) => !String(a).includes(String(b)),
  starts_with: (a, b) => String(a).startsWith(String(b)),
  ends_with: (a, b) => String(a).endsWith(String(b)),
  in_list: (a, b) => Array.isArray(b) && b.includes(a),
  not_in_list: (a, b) => Array.isArray(b) && !b.includes(a),
  is_empty: (a) => !a || a === '' || (Array.isArray(a) && a.length === 0),
  is_not_empty: (a) => !!a && a !== '' && (!Array.isArray(a) || a.length > 0),
  matches_regex: (a, b) => new RegExp(b).test(String(a)),
};

/**
 * Evaluiert eine einzelne Condition
 */
const evaluateCondition = (condition, data) => {
  const { field, operator, value } = condition;

  // Get field value from data (supports nested paths like "user.level")
  const fieldValue = getNestedValue(data, field);

  const operatorFn = operators[operator];
  if (!operatorFn) {
    throw new Error(`Unknown operator: ${operator}`);
  }

  return operatorFn(fieldValue, value);
};

/**
 * Get nested value from object using dot notation
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Evaluiert alle Conditions einer Rule
 */
const evaluateConditions = (conditions, data) => {
  if (!conditions || conditions.length === 0) {
    return true; // No conditions = always true
  }

  // Support for AND/OR logic
  const logic = conditions.logic || 'AND';

  if (logic === 'AND') {
    return conditions.rules.every(condition => evaluateCondition(condition, data));
  } else if (logic === 'OR') {
    return conditions.rules.some(condition => evaluateCondition(condition, data));
  }

  return false;
};

// ===== ACTION EXECUTORS =====

/**
 * Führt eine einzelne Action aus
 */
const executeAction = async (action, data, db) => {
  const { type, params } = action;

  switch (type) {
    case 'send_email':
      return await sendEmail(params, data);

    case 'update_user_level':
      return await updateUserLevel(params, data, db);

    case 'assign_badge':
      return await assignBadge(params, data, db);

    case 'flag_transaction':
      return await flagTransaction(params, data, db);

    case 'block_ip':
      return await blockIP(params, data, db);

    case 'send_notification':
      return await sendNotification(params, data);

    case 'webhook':
      return await callWebhook(params, data);

    case 'create_audit_log':
      return await createAuditLog(params, data, db);

    case 'send_websocket_event':
      return await sendWebSocketEvent(params, data);

    case 'increment_counter':
      return await incrementCounter(params, data, db);

    default:
      throw new Error(`Unknown action type: ${type}`);
  }
};

// ===== ACTION IMPLEMENTATIONS =====

const sendEmail = async (params, data) => {
  console.log('📧 Sending email:', params.to, params.subject);
  // TODO: Integrate with email service (SendGrid, etc.)
  return { success: true, message: 'Email sent (simulated)' };
};

const updateUserLevel = async (params, data, db) => {
  const { user_id, new_level } = params;
  const userId = user_id || data.user?.id;

  if (!userId) {
    throw new Error('User ID not found');
  }

  await db.query(
    'UPDATE users SET level = $1 WHERE id = $2',
    [new_level, userId]
  );

  console.log(`✅ Updated user ${userId} to level ${new_level}`);
  return { success: true, message: `User level updated to ${new_level}` };
};

const assignBadge = async (params, data, db) => {
  const { user_id, badge } = params;
  const userId = user_id || data.user?.id;

  console.log(`🏆 Assigning badge "${badge}" to user ${userId}`);

  // TODO: Implement badge system
  return { success: true, message: `Badge "${badge}" assigned` };
};

const flagTransaction = async (params, data, db) => {
  const { transaction_id, reason } = params;
  const txId = transaction_id || data.transaction?.id;

  await db.query(
    `UPDATE transactions SET flagged = true, flag_reason = $1 WHERE id = $2`,
    [reason, txId]
  );

  console.log(`🚩 Flagged transaction ${txId}: ${reason}`);
  return { success: true, message: 'Transaction flagged' };
};

const blockIP = async (params, data, db) => {
  const { ip, reason } = params;
  const ipAddress = ip || data.ip;

  await db.query(
    `INSERT INTO blocked_ips (ip_address, reason, blocked_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (ip_address) DO NOTHING`,
    [ipAddress, reason]
  );

  console.log(`🚫 Blocked IP ${ipAddress}: ${reason}`);

  // Send security alert
  broadcastEvent.securityAlert({
    severity: 'high',
    message: `IP ${ipAddress} blocked`,
    source: 'rules_engine',
    details: { ip: ipAddress, reason }
  });

  return { success: true, message: 'IP blocked' };
};

const sendNotification = async (params, data) => {
  const { message, severity } = params;

  console.log(`🔔 Notification (${severity}): ${message}`);

  // Send via WebSocket
  broadcastEvent.alert({
    severity: severity || 'info',
    message: replaceVariables(message, data),
    source: 'rules_engine'
  });

  return { success: true, message: 'Notification sent' };
};

const callWebhook = async (params, data) => {
  const { url, method = 'POST', headers = {} } = params;

  console.log(`🔗 Calling webhook: ${method} ${url}`);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data)
    });

    return {
      success: response.ok,
      status: response.status,
      message: `Webhook called: ${response.status}`
    };
  } catch (error) {
    throw new Error(`Webhook failed: ${error.message}`);
  }
};

const createAuditLog = async (params, data, db) => {
  const { action, details } = params;

  await db.query(
    `INSERT INTO audit_log (action, username, details, timestamp)
     VALUES ($1, $2, $3, NOW())`,
    [action, data.user?.username || 'system', JSON.stringify(details || data)]
  );

  console.log(`📝 Audit log created: ${action}`);
  return { success: true, message: 'Audit log created' };
};

const sendWebSocketEvent = async (params, data) => {
  const { event_type, channel = 'all' } = params;

  broadcastEvent[event_type]?.(data) || broadcastEvent.alert({
    severity: 'info',
    message: `Rule triggered: ${event_type}`,
    source: 'rules_engine',
    details: data
  });

  return { success: true, message: 'WebSocket event sent' };
};

const incrementCounter = async (params, data, db) => {
  const { counter_name, increment = 1 } = params;

  await db.query(
    `INSERT INTO counters (name, value) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET value = counters.value + $2`,
    [counter_name, increment]
  );

  console.log(`📊 Incremented counter "${counter_name}" by ${increment}`);
  return { success: true, message: 'Counter incremented' };
};

// ===== HELPER FUNCTIONS =====

/**
 * Replace {{variables}} in strings with actual data
 */
const replaceVariables = (template, data) => {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    return getNestedValue(data, path.trim()) || match;
  });
};

// ===== MAIN RULE EVALUATION =====

/**
 * Evaluiert und führt eine Rule aus
 */
export const evaluateRule = async (rule, data, db) => {
  const startTime = Date.now();

  try {
    // Check if conditions are met
    const conditionsMet = evaluateConditions(rule.conditions, data);

    if (!conditionsMet) {
      return {
        success: true,
        executed: false,
        message: 'Conditions not met',
        duration: Date.now() - startTime
      };
    }

    // Execute all actions
    const actionResults = [];
    for (const action of rule.actions || []) {
      try {
        const result = await executeAction(action, data, db);
        actionResults.push({
          action: action.type,
          ...result
        });
      } catch (error) {
        actionResults.push({
          action: action.type,
          success: false,
          error: error.message
        });
      }
    }

    const allSuccessful = actionResults.every(r => r.success);

    return {
      success: true,
      executed: true,
      conditionsMet: true,
      actions: actionResults,
      allActionsSuccessful: allSuccessful,
      duration: Date.now() - startTime
    };

  } catch (error) {
    return {
      success: false,
      executed: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
};

/**
 * Evaluiert alle aktiven Rules für einen Trigger
 */
export const evaluateTrigger = async (trigger, data, db) => {
  try {
    // Get all active rules for this trigger
    const result = await db.query(
      `SELECT * FROM automation_rules
       WHERE status = 'active' AND trigger = $1
       ORDER BY priority DESC`,
      [trigger]
    );

    const rules = result.rows;
    const executions = [];

    for (const rule of rules) {
      const execution = await evaluateRule({
        ...rule,
        conditions: rule.conditions,
        actions: rule.actions
      }, data, db);

      // Log execution
      await db.query(
        `INSERT INTO rule_executions
         (rule_id, trigger_data, status, result, executed_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          rule.id,
          JSON.stringify(data),
          execution.allActionsSuccessful ? 'success' : 'failed',
          JSON.stringify(execution)
        ]
      );

      executions.push({
        rule_id: rule.id,
        rule_name: rule.name,
        ...execution
      });
    }

    return {
      success: true,
      trigger,
      rules_evaluated: rules.length,
      executions
    };

  } catch (error) {
    console.error('Error evaluating trigger:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ===== TRIGGER HELPERS =====

/**
 * Helper functions to trigger rules from different parts of the app
 */
export const triggerRules = {
  userCreated: (user, db) => evaluateTrigger('user.created', { user }, db),
  userLevelUp: (user, newLevel, db) => evaluateTrigger('user.level_up', { user, newLevel }, db),
  transactionCreated: (transaction, db) => evaluateTrigger('transaction.created', { transaction }, db),
  productCreated: (product, db) => evaluateTrigger('product.created', { product }, db),
  failedLogin: (data, db) => evaluateTrigger('security.failed_login', data, db),
  payoutRequested: (payout, db) => evaluateTrigger('payout.requested', { payout }, db),
  performanceAlert: (alert, db) => evaluateTrigger('performance.alert', { alert }, db),
};

export default {
  evaluateRule,
  evaluateTrigger,
  triggerRules
};
