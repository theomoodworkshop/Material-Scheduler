import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const materialController = {
  getBySku: async (req: Request, res: Response) => {
    const sku = req.params.sku;
    const material = await prisma.materialLibrary.findUnique({ where: { materialSku: sku } });
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    return res.json(material);
  }
};
