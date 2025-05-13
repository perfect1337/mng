import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './User';
import { IMenuItem } from './MenuItem';

interface OrderItem {
  menuItem: mongoose.Types.ObjectId | IMenuItem;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId | IUser;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
}

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Создаем составной индекс для часто используемых запросов
orderSchema.index({ user: 1, status: 1, createdAt: -1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order; 