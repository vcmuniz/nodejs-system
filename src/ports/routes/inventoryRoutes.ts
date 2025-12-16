import { Router } from 'express';

export const inventoryRoutes = Router();

// Placeholder - adicionar rotas de inventário aqui
// GET, POST, PUT, DELETE para:
// - Categories
// - Products
// - Stock Entries
// - Quotes
// - Orders
// - Reports

inventoryRoutes.get('/health', (req, res) => {
  res.json({ status: 'Inventory module is healthy' });
});
