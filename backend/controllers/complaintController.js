const { pool } = require('../config/db');
const { sendEmail, emailTemplates } = require('../utils/email');

// SLA hours per category
const SLA_HOURS = {
  Electrical: 24, Plumbing: 12, Housekeeping: 48,
  Internet: 8, Furniture: 72, Mess: 6, 'Water Supply': 12,
};

// Auto-assign staff by category
const autoAssignStaff = async (category) => {
  const [rows] = await pool.query(
    `SELECT u.id FROM users u
     JOIN staff_category sc ON u.id = sc.staff_id
     WHERE sc.category = ? AND u.role = 'staff' AND u.is_active = 1
     ORDER BY (SELECT COUNT(*) FROM complaints WHERE assigned_to = u.id AND status NOT IN ('Resolved','Closed')) ASC
     LIMIT 1`,
    [category]
  );
  return rows.length ? rows[0].id : null;
};

const createNotification = async (userId, complaintId, message, type = 'info') => {
  await pool.query(
    'INSERT INTO notifications (user_id, complaint_id, message, type) VALUES (?,?,?,?)',
    [userId, complaintId, message, type]
  );
};

// @POST /api/complaints
const createComplaint = async (req, res) => {
  const { category, title, description, priority, hostel_block, room_no } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!category || !title || !description) {
    return res.status(400).json({ success: false, message: 'Category, title and description are required' });
  }

  try {
    const complaint_id = `SRM-${Date.now().toString().slice(-6)}`;
    const sla_hours = SLA_HOURS[category] || 24;
    const sla_deadline = new Date(Date.now() + sla_hours * 60 * 60 * 1000);

    const block = hostel_block || req.user.hostel_block;
    const room = room_no || req.user.room_no;

    const [result] = await pool.query(
      `INSERT INTO complaints (complaint_id, student_id, category, title, description, image_url, priority, status, hostel_block, room_no, sla_deadline)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [complaint_id, req.user.id, category, title, description, image_url, priority || 'Medium', 'Submitted', block, room, sla_deadline]
    );

    const complaintDbId = result.insertId;

    // Log initial update
    await pool.query(
      'INSERT INTO complaint_updates (complaint_id, updated_by, status, remarks) VALUES (?,?,?,?)',
      [complaintDbId, req.user.id, 'Submitted', 'Complaint submitted by student']
    );

    // Auto-assign
    const staffId = await autoAssignStaff(category);
    if (staffId) {
      await pool.query('UPDATE complaints SET status=?, assigned_to=? WHERE id=?', ['Assigned', staffId, complaintDbId]);
      await pool.query(
        'INSERT INTO complaint_updates (complaint_id, updated_by, status, remarks) VALUES (?,?,?,?)',
        [complaintDbId, staffId, 'Assigned', 'Auto-assigned based on category']
      );
      await createNotification(staffId, complaintDbId, `New complaint assigned: ${title}`, 'info');
    }

    // Notifications
    await createNotification(req.user.id, complaintDbId, `Your complaint ${complaint_id} has been submitted`, 'success');

    // Email
    const { subject, html } = emailTemplates.complaintSubmitted(req.user.name, complaint_id, title);
    await sendEmail({ to: req.user.email, subject, html });

    res.status(201).json({ success: true, message: 'Complaint submitted successfully', complaint_id, id: complaintDbId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10, search } = req.query;
    let where = [];
    let params = [];

    if (req.user.role === 'student') {
      where.push('c.student_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'staff') {
      where.push('c.assigned_to = ?');
      params.push(req.user.id);
    }

    if (status) { where.push('c.status = ?'); params.push(status); }
    if (category) { where.push('c.category = ?'); params.push(category); }
    if (priority) { where.push('c.priority = ?'); params.push(priority); }
    if (search) { where.push('(c.title LIKE ? OR c.complaint_id LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT c.*, u.name as student_name, u.reg_no, u.email as student_email,
              s.name as staff_name,
              CASE WHEN c.sla_deadline < NOW() AND c.status NOT IN ('Resolved','Closed') THEN 1 ELSE 0 END as sla_breached
       FROM complaints c
       JOIN users u ON c.student_id = u.id
       LEFT JOIN users s ON c.assigned_to = s.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM complaints c ${whereClause}`,
      params
    );

    res.json({ success: true, complaints: rows, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/complaints/:id
const getComplaint = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.name as student_name, u.reg_no, u.email as student_email,
              u.hostel_block, u.room_no,
              s.name as staff_name, s.email as staff_email,
              CASE WHEN c.sla_deadline < NOW() AND c.status NOT IN ('Resolved','Closed') THEN 1 ELSE 0 END as sla_breached
       FROM complaints c
       JOIN users u ON c.student_id = u.id
       LEFT JOIN users s ON c.assigned_to = s.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const complaint = rows[0];

    // Access control
    if (req.user.role === 'student' && complaint.student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get updates timeline
    const [updates] = await pool.query(
      `SELECT cu.*, u.name as updated_by_name, u.role as updated_by_role
       FROM complaint_updates cu
       JOIN users u ON cu.updated_by = u.id
       WHERE cu.complaint_id = ?
       ORDER BY cu.timestamp ASC`,
      [req.params.id]
    );

    // Get feedback if resolved
    const [feedback] = await pool.query('SELECT * FROM feedback WHERE complaint_id = ?', [req.params.id]);

    res.json({ success: true, complaint, updates, feedback: feedback[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/complaints/:id/status
const updateStatus = async (req, res) => {
  const { status, remarks } = req.body;
  const { id } = req.params;

  const validStatuses = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.name as student_name, u.email as student_email
       FROM complaints c JOIN users u ON c.student_id = u.id WHERE c.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const complaint = rows[0];

    // Staff can only update their assigned complaints
    if (req.user.role === 'staff' && complaint.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this complaint' });
    }

    const proof_image = req.file ? `/uploads/${req.file.filename}` : null;
    const resolvedAt = status === 'Resolved' ? new Date() : null;

    await pool.query(
      `UPDATE complaints SET status = ?, ${resolvedAt ? 'resolved_at = ?,' : ''} updated_at = NOW() WHERE id = ?`,
      resolvedAt ? [status, resolvedAt, id] : [status, id]
    );

    await pool.query(
      'INSERT INTO complaint_updates (complaint_id, updated_by, status, remarks, proof_image) VALUES (?,?,?,?,?)',
      [id, req.user.id, status, remarks || null, proof_image]
    );

    // Notify student
    await createNotification(
      complaint.student_id, id,
      `Your complaint ${complaint.complaint_id} status updated to: ${status}`,
      status === 'Resolved' ? 'success' : 'info'
    );

    if (status === 'Resolved') {
      const { subject, html } = emailTemplates.complaintResolved(complaint.student_name, complaint.complaint_id);
      await sendEmail({ to: complaint.student_email, subject, html });
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/complaints/:id/assign
const assignComplaint = async (req, res) => {
  const { staff_id } = req.body;
  const { id } = req.params;

  try {
    const [staffRows] = await pool.query("SELECT * FROM users WHERE id = ? AND role = 'staff'", [staff_id]);
    if (!staffRows.length) return res.status(404).json({ success: false, message: 'Staff not found' });

    const [compRows] = await pool.query(
      `SELECT c.*, u.name as student_name, u.email as student_email
       FROM complaints c JOIN users u ON c.student_id = u.id WHERE c.id = ?`,
      [id]
    );
    if (!compRows.length) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const complaint = compRows[0];

    await pool.query(
      "UPDATE complaints SET assigned_to = ?, status = 'Assigned', updated_at = NOW() WHERE id = ?",
      [staff_id, id]
    );

    await pool.query(
      "INSERT INTO complaint_updates (complaint_id, updated_by, status, remarks) VALUES (?,?,?,?)",
      [id, req.user.id, 'Assigned', `Assigned to ${staffRows[0].name}`]
    );

    await createNotification(staff_id, id, `New complaint assigned to you: ${complaint.title}`, 'info');
    await createNotification(complaint.student_id, id, `Your complaint assigned to ${staffRows[0].name}`, 'info');

    const { subject, html } = emailTemplates.complaintAssigned(
      complaint.student_name, complaint.complaint_id, staffRows[0].name
    );
    await sendEmail({ to: complaint.student_email, subject, html });

    res.json({ success: true, message: 'Complaint assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/complaints/:id
const deleteComplaint = async (req, res) => {
  try {
    await pool.query('DELETE FROM complaints WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createComplaint, getComplaints, getComplaint, updateStatus, assignComplaint, deleteComplaint };
