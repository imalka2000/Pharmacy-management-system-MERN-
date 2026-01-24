import { X, Calendar, User, DollarSign } from 'lucide-react';

const ViewSaleModal = ({ sale, onClose }) => {
    if (!sale) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Sale Details</h2>
                        <p className="text-sm text-gray-500">{sale.invoiceNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-gray-600">
                            <Calendar size={18} className="mr-2 text-primary" />
                            <span className="font-medium">Date:</span>
                            <span className="ml-2">{new Date(sale.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <User size={18} className="mr-2 text-primary" />
                            <span className="font-medium">Pharmacist:</span>
                            <span className="ml-2">{sale.pharmacist?.username || 'Unknown'}</span>
                        </div>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">Items Included</h3>
                    <div className="border rounded-lg overflow-hidden mb-6">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Medicine</th>
                                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Qty</th>
                                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Price</th>
                                    <th className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sale.items.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 text-gray-800">{item.medicine?.name || 'Deleted Item'}</td>
                                        <td className="py-2 px-4 text-center">{item.quantity}</td>
                                        <td className="py-2 px-4 text-right">${item.price}</td>
                                        <td className="py-2 px-4 text-right font-medium text-gray-700">${item.subtotal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t pt-2 mt-2">
                            <span>Grand Total</span>
                            <span className="flex items-center text-green-600"><DollarSign size={20} /> {sale.grandTotal}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewSaleModal;
