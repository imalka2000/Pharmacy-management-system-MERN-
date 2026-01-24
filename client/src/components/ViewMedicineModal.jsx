import { X, Calendar, DollarSign, Package, Box } from 'lucide-react';

const ViewMedicineModal = ({ medicine, onClose }) => {
    if (!medicine) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-green-50">
                    <h2 className="text-xl font-bold text-green-900">{medicine.name}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-green-100 rounded-full transition">
                        <X size={24} className="text-green-700" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Batch Number</span>
                        <span className="text-gray-800 font-semibold">{medicine.batchNumber}</span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium flex items-center"><Calendar size={16} className="mr-1" /> Expiry Date</span>
                        <span className={`font-semibold ${new Date(medicine.expiryDate) < new Date() ? 'text-red-500' : 'text-gray-800'}`}>
                            {new Date(medicine.expiryDate).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium flex items-center"><DollarSign size={16} className="mr-1" /> Price</span>
                        <span className="text-gray-800 font-bold text-lg">${medicine.price}</span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium flex items-center"><Box size={16} className="mr-1" /> Quantity In Stock</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${medicine.quantity < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {medicine.quantity} units
                        </span>
                    </div>

                    <div>
                        <span className="text-gray-500 font-medium block mb-1 flex items-center"><Package size={16} className="mr-1" /> Manufacturer</span>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded">{medicine.manufacturer || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewMedicineModal;
