const { pool } = require('../config/db');

// @GET /api/analytics/dashboard
const getDashboard = async (req, res) => {
  try {
    // Total counts
    const [[totals]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'Submitted') as submitted,
        SUM(status = 'Assigned') as assigned,
        SUM(status = 'In Progress') as in_progress,
        SUM(status = 'Resolved') as resolved,
        SUM(status = 'Closed') as closed,
        SUM(sla_deadline < NOW() AND status NOT IN ('Resolved','Closed')) as sla_breached
      FROM complaints
    `);

    // Category wise
    const [categoryStats] = await pool.query(`
      SELECT category, COUNT(*) as count,
             SUM(status IN ('Resolved','Closed')) as resolved_count
      FROM complaints GROUP BY category ORDER BY count DESC
    `);

    // Priority wise
    const [priorityStats] = await pool.query(`
      SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority
    `);

    // Hostel block wise
    const [blockStats] = await pool.query(`
      SELECT hostel_block, COUNT(*) as count FROM complaints
      WHERE hostel_block IS NOT NULL GROUP BY hostel_block ORDER BY count DESC
    `);

    // Monthly trend (last 6 months)
    const [monthlyTrend] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
             COUNT(*) as total,
             SUM(status IN ('Resolved','Closed')) as resolved
      FROM complaints
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month ASC
    `);

    // Average resolution time (hours)
    const [[resolutionTime]] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours
      FROM complaints WHERE resolved_at IS NOT NULL
    `);

    // Staff performance
    const [staffPerf] = await pool.query(`
      SELECT u.name, u.id,
             COUNT(c.id) as assigned_complaints,
             SUM(c.status IN ('Resolved','Closed')) as resolved_count,
             AVG(f.rating) as avg_rating
      FROM users u
      LEFT JOIN complaints c ON u.id = c.assigned_to
      LEFT JOIN feedback f ON c.id = f.complaint_id
      WHERE u.role = 'staff'
      GROUP BY u.id ORDER BY resolved_count DESC
    `);

    // Recent complaints
    const [recent] = await pool.query(`
      SELECT c.complaint_id, c.title, c.category, c.status, c.priority,
             c.created_at, u.name as student_name, c.hostel_block
      FROM complaints c JOIN users u ON c.student_id = u.id
      ORDER BY c.created_at DESC LIMIT 10
    `);

    res.json({
      success: true,
      totals,
      categoryStats,
      priorityStats,
      blockStats,
      monthlyTrend,
      avgResolutionHours: resolutionTime?.avg_hours || 0,
      staffPerformance: staffPerf,
      recentComplaints: recent,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/analytics/student
const getStudentDashboard = async (req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT COUNT(*) as total,
             SUM(status = 'Submitted') as submitted,
             SUM(status IN ('Assigned','In Progress')) as in_progress,
             SUM(status = 'Resolved') as resolved,
             SUM(status = 'Closed') as closed
      FROM complaints WHERE student_id = ?
    `, [req.user.id]);

    const [recent] = await pool.query(`
      SELECT c.*, s.name as staff_name
      FROM complaints c LEFT JOIN users s ON c.assigned_to = s.id
      WHERE c.student_id = ? ORDER BY c.created_at DESC LIMIT 5
    `, [req.user.id]);

    res.json({ success: true, stats, recentComplaints: recent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/analytics/staff
const getStaffDashboard = async (req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT COUNT(*) as total,
             SUM(status = 'Assigned') as assigned,
             SUM(status = 'In Progress') as in_progress,
             SUM(status = 'Resolved') as resolved
      FROM complaints WHERE assigned_to = ?
    `, [req.user.id]);

    const [pending] = await pool.query(`
      SELECT c.*, u.name as student_name, u.reg_no
      FROM complaints c JOIN users u ON c.student_id = u.id
      WHERE c.assigned_to = ? AND c.status NOT IN ('Resolved','Closed')
      ORDER BY c.priority DESC, c.created_at ASC
    `, [req.user.id]);

    res.json({ success: true, stats, pendingComplaints: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getStudentDashboard, getStaffDashboard };
