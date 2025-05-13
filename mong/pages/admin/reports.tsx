import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Reports from '../../components/Reports';
import Charts from '../../components/Charts';
import { Order } from '../../types/menu';

interface ChartData {
  dailyRevenue: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  ordersByStatus: Record<string, number>;
  popularItems: Array<{
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/menu');
    } else if (status === 'authenticated') {
      Promise.all([
        fetchOrders(),
        fetchChartData()
      ]);
    }
  }, [status, session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch('/api/reports/stats');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          Loading...
        </div>
      </Layout>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen text-red-500">
          Error: {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Reports & Analytics</h1>
        
        {chartData && (
          <div className="mb-8">
            <Charts data={chartData} />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Detailed Orders</h2>
          <Reports orders={orders} />
        </div>
      </div>
    </Layout>
  );
} 