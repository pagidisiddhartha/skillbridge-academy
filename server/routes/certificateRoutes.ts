import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, optionalAuthenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { Certificate } from '../types.js';

const router = Router();

// GET /api/certificates - List certificates
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  if (user.role === 'admin') {
    res.json({ certificates: db.getCertificates() });
    return;
  }
  res.json({ certificates: db.getCertificates(user.id) });
});

// GET /api/certificates/verify/:code - PUBLIC verification
router.get('/verify/:code', (req: AuthenticatedRequest, res: Response): void => {
  const code = req.params.code.trim();
  const cert = db.getCertificateByCode(code);

  if (!cert) {
    res.status(404).json({
      valid: false,
      message: `No active credential found in the official SkillBridge Academy registry for code "${code}".`,
    });
    return;
  }

  res.json({
    valid: cert.status === 'valid',
    status: cert.status,
    certificate: {
      certificateCode: cert.certificateCode,
      studentName: cert.studentName,
      title: cert.title,
      type: cert.type,
      completionDate: cert.completionDate,
      issuingOrg: cert.issuingOrg,
      grade: cert.grade,
      verificationUrl: cert.verificationUrl,
    },
  });
});

// POST /api/certificates/issue - Admin issue certificate
router.post('/issue', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { studentId, title, type, grade, completionDate } = req.body;
    if (!studentId || !title) {
      res.status(400).json({ error: 'Student ID and title are required.' });
      return;
    }

    const student = db.getUserById(studentId);
    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    // Generate unique code like SKB-2026-ENG-491
    const prefix = type === 'internship' ? 'INT' : 'CRS';
    const randNum = Math.floor(100 + Math.random() * 900);
    const code = `SKB-2026-${prefix}-${randNum}`;

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateCode: code,
      studentId: student.id,
      studentName: student.name,
      title,
      type: type || 'course',
      completionDate: completionDate || new Date().toISOString().split('T')[0],
      issuingOrg: 'SkillBridge Academy',
      verificationUrl: `/verify/${code}`,
      status: 'valid',
      grade: grade || 'Honors (Passed)',
      issuedByUserId: req.user!.id,
    };

    db.issueCertificate(newCert);

    // Notify student
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: student.id,
      title: 'Congratulations! Official Certificate Issued',
      message: `You have been awarded the official Certificate for "${title}". Credential Code: ${code}.`,
      read: false,
      link: `/verify/${code}`,
      createdAt: new Date().toISOString(),
    });

    db.addAuditLog(req.user!.id, req.user!.email, 'CERTIFICATE_ISSUED', 'Certificate', newCert.id, `Issued certificate ${code} to ${student.name} for "${title}"`, req.ip);

    res.status(201).json({ message: 'Certificate issued successfully', certificate: newCert });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to issue certificate' });
  }
});

// PUT /api/certificates/:id/revoke - Admin revoke certificate
router.put('/:id/revoke', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const updated = db.updateCertificate(req.params.id, { status: 'revoked' });
  if (!updated) {
    res.status(404).json({ error: 'Certificate not found' });
    return;
  }

  db.addAuditLog(req.user!.id, req.user!.email, 'CERTIFICATE_REVOKED', 'Certificate', updated.id, `Revoked certificate ${updated.certificateCode}`, req.ip);
  res.json({ message: 'Certificate revoked', certificate: updated });
});

export default router;
