import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';

interface OrderDetails {
  order_number: string;
  total_amount: number;
  payment_method: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  created_at: string;
}

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails as OrderDetails;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a blob with the invoice content
    const invoiceContent = document.getElementById('invoice-content')?.innerHTML;
    const blob = new Blob([invoiceContent || ''], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderDetails.order_number}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!orderDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">No Order Details Found</h1>
        <Button onClick={() => navigate('/pos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to POS
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Order Successful!</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div id="invoice-content" className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-800">NeonPOS</h2>
              <p className="text-gray-600">123 Business Street</p>
              <p className="text-gray-600">City, State 12345</p>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-medium">{orderDetails.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {format(new Date(orderDetails.created_at), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">{orderDetails.payment_method}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold mb-2">Items</h3>
              <div className="border rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Item</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Qty</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Price</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orderDetails.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{item.product_name}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-pos-primary">
                  ${orderDetails.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-center text-sm text-gray-600">
              <p>Thank you for your business!</p>
              <p>Please keep this receipt for your records</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={() => navigate('/pos')} className="bg-pos-primary hover:bg-pos-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to POS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 