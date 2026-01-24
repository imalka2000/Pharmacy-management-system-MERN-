import { X, Phone, Mail, MapPin, Building2 } from 'lucide-react';

const ViewSupplierModal = ({ supplier, onClose }) => {
    if (!supplier) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white flex justify-between items-start">
                    <div>
                        <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                            <Building2 size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">{supplier.name}</h2>
                        <p className="text-gray-400 text-sm">Supplier Details</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-start">
                        <div className="bg-blue-50 p-2 rounded-lg mr-4 text-blue-600">
                            <Phone size={20} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Number</label>
                            <p className="text-gray-800 font-medium text-lg">{supplier.contactNumber}</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="bg-purple-50 p-2 rounded-lg mr-4 text-purple-600">
                            <Mail size={20} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                            <p className="text-gray-800 font-medium">{supplier.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="bg-orange-50 p-2 rounded-lg mr-4 text-orange-600">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</label>
                            <p className="text-gray-800 font-medium leading-relaxed">{supplier.address || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewSupplierModal;
