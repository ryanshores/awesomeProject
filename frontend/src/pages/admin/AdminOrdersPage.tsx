import { useEffect, useState } from 'react';
import { getOrders, getOrder } from '../../api/admin';
import type { Order } from '../../types';
import { AdminLayout, PageHeader } from '../../components/layout/AdminLayout';
import { Badge, Spinner, Modal } from '../../components/ui';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 20;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders(page, limit);
      setOrders(data.orders || []);
      setTotal(data.total);
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const viewOrder = async (orderId: number) => {
    try {
      const order = await getOrder(orderId);
      setSelectedOrder(order);
      setModalOpen(true);
    } catch {
      console.error('Failed to fetch order details');
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">{status}</Badge>;
      case 'pending':
        return <Badge variant="warning">{status}</Badge>;
      case 'cancelled':
      case 'canceled':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <PageHeader title="Orders" description="View and manage customer orders" />
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">#{order.id}</td>
                  <td className="whitespace-nowrap px-6 py-4">{order.user?.email || 'Unknown'}</td>
                  <td className="whitespace-nowrap px-6 py-4">{statusBadge(order.status)}</td>
                  <td className="whitespace-nowrap px-6 py-4">${(order.total / 100).toFixed(2)}</td>
                  <td className="whitespace-nowrap px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => viewOrder(order.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <div className="text-sm text-gray-500">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Order Details" size="lg">
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">#{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                {statusBadge(selectedOrder.status)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedOrder.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product?.name || 'Unknown Product'} × {item.quantity}
                    </span>
                    <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-medium mt-4 pt-2 border-t">
                <span>Total</span>
                <span>${(selectedOrder.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}