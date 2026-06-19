const { pool } = require('../config/db');

// @POST /api/feedback
const submitFeedback = async (req, res) => {
  const { complaint_id, rating, comment } = req.body;

  if (!complaint_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Complaint ID and rating (1-5) are required' });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM complaints WHERE id = ? AND student_id = ? AND status = 'Resolved'",
      [complaint_id, req.user.id]
    );

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Complaint not found or not resolved yet' });
    }

    const [existing] = await pool.query('SELECT id FROM feedback WHERE complaint_id = ?', [complaint_id]);
    if (existing.length) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted for this complaint' });
    }

    await pool.query(
      'INSERT INTO feedback (complaint_id, student_id, rating, comment) VALUES (?,?,?,?)',
      [complaint_id, req.user.id, rating, comment || null]
    );

    // Close the complaint after feedback
    await pool.query("UPDATE complaints SET status = 'Closed' WHERE id = ?", [complaint_id]);

    res.status(201).json({ success: true, message: 'Feedback submitted. Complaint closed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/feedback/staff/:staffId
const getStaffFeedback = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, c.title, c.complaint_id, c.category, u.name as student_name
       FROM feedback f
       JOIN complaints c ON f.complaint_id = c.id
       JOIN users u ON f.student_id = u.id
       WHERE c.assigned_to = ?
       ORDER BY f.created_at DESC`,
      [req.params.staffId]
    );

    const [[stats]] = await pool.query(
      `SELECT AVG(f.rating) as avg_rating, COUNT(f.id) as total_feedback
       FROM feedback f JOIN complaints c ON f.complaint_id = c.id
       WHERE c.assigned_to = ?`,
      [req.params.staffId]
    );

    res.json({ success: true, feedback: rows, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitFeedback, getStaffFeedback };
