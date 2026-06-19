const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const emailTemplates = {
  complaintSubmitted: (studentName, complaintId, title) => ({
    subject: `Complaint Submitted - ${complaintId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:#1a237e;color:white;padding:20px;border-radius:6px 6px 0 0;text-align:center">
          <h2>SRM KTR Hostel Complaint System</h2>
        </div>
        <div style="padding:20px">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Your complaint has been <strong style="color:#2e7d32">successfully submitted</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Complaint ID</td><td style="padding:8px">${complaintId}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Title</td><td style="padding:8px">${title}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Status</td><td style="padding:8px"><span style="color:#1565c0">Submitted</span></td></tr>
          </table>
          <p>You will receive updates as your complaint progresses. Track your complaint in the portal.</p>
          <p style="color:#757575;font-size:12px">SRM Institute of Science and Technology, Kattankulathur</p>
        </div>
      </div>`,
  }),

  complaintAssigned: (studentName, complaintId, staffName) => ({
    subject: `Complaint Assigned - ${complaintId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:#1a237e;color:white;padding:20px;border-radius:6px 6px 0 0;text-align:center">
          <h2>SRM KTR Hostel Complaint System</h2>
        </div>
        <div style="padding:20px">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Your complaint <strong>${complaintId}</strong> has been <strong style="color:#e65100">assigned</strong> to <strong>${staffName}</strong>.</p>
          <p>Our team is on it and will resolve your issue at the earliest.</p>
          <p style="color:#757575;font-size:12px">SRM Institute of Science and Technology, Kattankulathur</p>
        </div>
      </div>`,
  }),

  complaintResolved: (studentName, complaintId) => ({
    subject: `Complaint Resolved - ${complaintId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:#1a237e;color:white;padding:20px;border-radius:6px 6px 0 0;text-align:center">
          <h2>SRM KTR Hostel Complaint System</h2>
        </div>
        <div style="padding:20px">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Your complaint <strong>${complaintId}</strong> has been <strong style="color:#2e7d32">resolved</strong>!</p>
          <p>Please log in to the portal to provide your feedback and rate the service. Your feedback helps us improve.</p>
          <p style="color:#757575;font-size:12px">SRM Institute of Science and Technology, Kattankulathur</p>
        </div>
      </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
