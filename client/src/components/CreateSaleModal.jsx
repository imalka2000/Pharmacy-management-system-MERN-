import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash, Printer, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const CreateSaleModal = ({ onClose, onSuccess }) => {
    // ...
    const addToCart = () => {
        if (!selectedMed) return;
        const med = medicines.find(m => m._id === selectedMed);

        if (med.quantity < qty) {
            toast.error('Insufficient Stock');
            return;
        }

        const existingItem = cart.find(item => item.medicine === med._id);
        if (existingItem) {
            const newQty = existingItem.quantity + parseInt(qty);
            if (med.quantity < newQty) {
                toast.error('Insufficient Stock for total quantity');
                return;
            }
            setCart(cart.map(item => item.medicine === med._id ? { ...item, quantity: newQty, subtotal: newQty * med.price } : item));
        } else {
            setCart([...cart, {
                medicine: med._id,
                name: med.name,
                price: med.price,
                quantity: parseInt(qty),
                subtotal: med.price * parseInt(qty)
            }]);
        }
        setSelectedMed('');
        setQty(1);
        setSearchTerm('');
        toast.success('Item added to cart');
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.medicine !== id));
        toast.success('Item removed');
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            await axios.post('http://localhost:5001/api/sales', { items: cart, tax: 0, discount: 0 }, config);
            toast.success('Sale Successful');
            setCart([]);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Sale Failed');
        }
    };

    const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);

    const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">New Sale</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Search & Add */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search Medicine</label>
                                <div className="relative">
                                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition">
                                        <Search size={18} className="text-gray-400 mr-2" />
                                        <input
                                            className="outline-none w-full bg-transparent"
                                            placeholder="Type to search..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    {searchTerm && filteredMedicines.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                                            {filteredMedicines.map(med => (
                                                <div
                                                    key={med._id}
                                                    onClick={() => { setSelectedMed(med._id); setSearchTerm(med.name); }}
                                                    className={`p-3 cursor-pointer hover:bg-green-50 transition border-b last:border-0 ${selectedMed === med._id ? 'bg-green-50' : ''}`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-800">{med.name}</span>
                                                        <span className="text-sm text-gray-500">${med.price}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">Stock: {med.quantity}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg">
                                <div className="flex-1">
                                    <span className="block text-sm font-medium text-gray-700 mb-2">Selected: <span className="text-green-600">{medicines.find(m => m._id === selectedMed)?.name || 'None'}</span></span>
                                    <div className="flex gap-4">
                                        <div className="w-24">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:border-green-500"
                                                min="1"
                                                value={qty}
                                                onChange={e => setQty(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={addToCart}
                                            disabled={!selectedMed}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">Cart Items</h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Item</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                                <th className="py-3 px-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {cart.map(item => (
                                                <tr key={item.medicine} className="hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-800">{item.name}</td>
                                                    <td className="py-3 px-4 text-gray-600">{item.quantity}</td>
                                                    <td className="py-3 px-4 text-gray-600">${item.price}</td>
                                                    <td className="py-3 px-4 font-medium text-gray-800">${item.subtotal}</td>
                                                    <td className="py-3 px-4 text-red-500 cursor-pointer hover:text-red-700" onClick={() => removeFromCart(item.medicine)}>
                                                        <Trash size={18} />
                                                    </td>
                                                </tr>
                                            ))}
                                            {cart.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="py-6 text-center text-gray-400">Cart is empty</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Summary */}
                        <div className="bg-gray-50 p-6 rounded-lg h-fit flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Order Summary</h3>

                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${grandTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (0%)</span>
                                    <span>$0</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Discount</span>
                                    <span>-$0</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-xl text-gray-900">
                                <span>Total</span>
                                <span>${grandTotal}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-200 transition flex justify-center items-center mt-4 disabled:opacity-50 disabled:shadow-none"
                            >
                                <Printer size={20} className="mr-2" /> Complete Sale
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSaleModal;
