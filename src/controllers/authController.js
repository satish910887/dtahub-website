import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { signToken } from '../middleware/auth.js';

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be 6+ characters' });
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        password: hashed,
        name: name || null,
        role: isAdmin ? 'ADMIN' : 'USER'
      },
      select: { id: true, email: true, name: true, role: true }
    });

    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
