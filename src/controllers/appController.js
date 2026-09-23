import { prisma } from '../config/prisma.js';
import crypto from 'crypto';

export async function listApps(req, res) {
  try {
    const { category, search, limit = 100, offset = 0 } = req.query;

    const where = { isPublished: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } }
      ];
    }

    const apps = await prisma.websiteApp.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.websiteApp.count({ where });
    res.json({ apps, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAppBySlug(req, res) {
  try {
    const app = await prisma.websiteApp.findUnique({
      where: { slug: req.params.slug }
    });
    if (!app) return res.status(404).json({ error: 'App not found' });
    res.json({ app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCategories(req, res) {
  try {
    const result = await prisma.websiteApp.groupBy({
      by: ['category'],
      where: { isPublished: true },
      _count: { category: true }
    });
    const categories = result.map(r => ({
      name: r.category,
      count: r._count.category
    }));
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function trackDownload(req, res) {
  try {
    const { slug } = req.params;
    const app = await prisma.websiteApp.findUnique({ where: { slug } });
    if (!app) return res.status(404).json({ error: 'App not found' });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);

    await prisma.websiteApp.update({
      where: { id: app.id },
      data: { downloads: { increment: 1 } }
    });

    await prisma.appDownload.create({
      data: {
        appId: app.id,
        ipHash,
        userAgent: req.headers['user-agent']?.slice(0, 200) || null
      }
    });

    res.json({ success: true, apkUrl: app.apkUrl, downloads: app.downloads + 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createApp(req, res) {
  try {
    const {
      name, slug, shortDesc, longDesc, category,
      iconUrl, screenshots, version, sizeMb,
      apkUrl, apkPublicId, features, changelog, platform
    } = req.body;

    if (!name || !slug || !apkUrl) {
      return res.status(400).json({ error: 'Name, slug, and apkUrl required' });
    }

    const existing = await prisma.websiteApp.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ error: 'Slug already exists' });
    }

    const app = await prisma.websiteApp.create({
      data: {
        name,
        slug,
        shortDesc: shortDesc || '',
        longDesc: longDesc || '',
        category: category || 'Other',
        iconUrl: iconUrl || '',
        screenshots: JSON.stringify(screenshots || []),
        version: version || '1.0.0',
        sizeMb: parseFloat(sizeMb) || 0,
        apkUrl,
        apkPublicId: apkPublicId || null,
        features: JSON.stringify(features || []),
        changelog: changelog || null,
        platform: platform || 'Android',
        isPublished: true
      }
    });

    res.status(201).json({ app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateApp(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.screenshots && Array.isArray(data.screenshots)) {
      data.screenshots = JSON.stringify(data.screenshots);
    }
    if (data.features && Array.isArray(data.features)) {
      data.features = JSON.stringify(data.features);
    }
    if (data.sizeMb) data.sizeMb = parseFloat(data.sizeMb);

    const app = await prisma.websiteApp.update({
      where: { id },
      data
    });
    res.json({ app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteApp(req, res) {
  try {
    const { id } = req.params;
    await prisma.websiteApp.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
