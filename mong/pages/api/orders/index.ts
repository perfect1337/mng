import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        let query = {};
        
        // If user is not admin, only show their orders
        if (session.user.role !== 'admin') {
          query = { user: session.user.id };
        }

        const orders = await Order.find(query)
          .populate('user', 'name email')
          .populate('items.menuItem')
          .sort({ createdAt: -1 })
          .exec();

        res.status(200).json(orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
      }
      break;

    case 'POST':
      try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: 'Invalid order items' });
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Format items with proper ObjectId for menuItem
        const formattedItems = items.map(item => ({
          menuItem: new mongoose.Types.ObjectId(item.menuItem),
          quantity: item.quantity,
          price: item.price
        }));

        const order = await Order.create({
          user: new mongoose.Types.ObjectId(session.user.id),
          items: formattedItems,
          totalAmount,
          status: 'pending'
        });

        // Populate the order items before sending response
        const populatedOrder = await Order.findById(order._id)
          .populate('user', 'name email')
          .populate('items.menuItem')
          .exec();

        res.status(201).json(populatedOrder);
      } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ error: 'Failed to create order' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 