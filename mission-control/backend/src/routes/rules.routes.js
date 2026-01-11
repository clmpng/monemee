import express from 'express';

const router = express.Router();

// ===== RULES MANAGEMENT =====

// GET /api/v1/rules - Get all rules
router.get('/', async (req, res, next) => {
  try {
    const { status, category } = req.query;

    let query = 'SELECT * FROM automation_rules WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await req.db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/rules/:id - Get single rule
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(
      'SELECT * FROM automation_rules WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/rules - Create new rule
router.post('/', async (req, res, next) => {
  try {
    const { name, description, category, trigger, conditions, actions, priority } = req.body;

    const result = await req.db.query(
      `INSERT INTO automation_rules
       (name, description, category, trigger, conditions, actions, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING *`,
      [name, description, category, trigger, JSON.stringify(conditions), JSON.stringify(actions), priority || 0]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/rules/:id - Update rule
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, trigger, conditions, actions, priority, status } = req.body;

    const result = await req.db.query(
      `UPDATE automation_rules
       SET name = $1, description = $2, category = $3, trigger = $4,
           conditions = $5, actions = $6, priority = $7, status = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [name, description, category, trigger, JSON.stringify(conditions), JSON.stringify(actions), priority, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/rules/:id - Delete rule
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(
      'DELETE FROM automation_rules WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/rules/:id/toggle - Toggle rule status
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(
      `UPDATE automation_rules
       SET status = CASE
         WHEN status = 'active' THEN 'inactive'
         ELSE 'active'
       END,
       updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/rules/execution/history - Get execution history
router.get('/execution/history', async (req, res, next) => {
  try {
    const { rule_id, limit = 50 } = req.query;

    let query = 'SELECT * FROM rule_executions WHERE 1=1';
    const params = [];

    if (rule_id) {
      params.push(rule_id);
      query += ` AND rule_id = $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY executed_at DESC LIMIT $${params.length}`;

    const result = await req.db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/rules/stats - Get rule statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await req.db.query(`
      SELECT
        COUNT(*) as total_rules,
        COUNT(*) FILTER (WHERE status = 'active') as active_rules,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_rules
      FROM automation_rules
    `);

    const executions = await req.db.query(`
      SELECT
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE status = 'success') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE executed_at > NOW() - INTERVAL '24 hours') as last_24h
      FROM rule_executions
    `);

    res.json({
      success: true,
      data: {
        rules: stats.rows[0],
        executions: executions.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/rules/test - Test rule without saving
router.post('/test', async (req, res, next) => {
  try {
    const { trigger, conditions, actions, testData } = req.body;

    // Import rule engine
    const { evaluateRule } = await import('../services/rules.engine.js');

    const result = await evaluateRule({
      trigger,
      conditions,
      actions
    }, testData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
