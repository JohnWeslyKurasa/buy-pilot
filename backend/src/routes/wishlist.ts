import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      include: { savedProducts: true }
    });

    res.json(user?.savedProducts || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, brand, image, price, originalUrl, marketplace } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already in wishlist
    const existing = await prisma.savedProduct.findFirst({
      where: {
        userId: user.id,
        title: title,
        marketplace: marketplace
      }
    });

    if (existing) {
      return res.json(existing); // already saved
    }

    const product = await prisma.savedProduct.create({
      data: {
        userId: user.id,
        title,
        brand,
        image,
        price,
        originalUrl,
        marketplace
      }
    });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

router.delete('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = req.query.id as string;

    if (!id) {
      return res.status(400).json({ error: 'Missing ID' });
    }

    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.savedProduct.deleteMany({
      where: {
        id: id,
        userId: user.id // Ensure they can only delete their own
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

export default router;
