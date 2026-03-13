import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Button, Table, Card, Row, Col, Spinner } from 'react-bootstrap';
import AddSupplierModal from '../components/AddSupplierModal';
import ViewSupplierModal from '../components/ViewSupplierModal';
import toast from 'react-hot-toast';

const Suppliers = () => {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    useEffect(() => {
        if (user?.token) fetchSuppliers();
    }, [user]);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/suppliers');
            setSuppliers(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await apiClient.delete(`/suppliers/${id}`);
                toast.success('Supplier removed successfully');
                fetchSuppliers();
            } catch (error) {
                toast.error('Failed to remove supplier');
            }
        }
    };

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark m-0">Suppliers</h2>
                    <p className="text-muted small m-0">Manage your medicine suppliers</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-sm rounded-3 d-flex align-items-center px-4 py-2"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <i className="bi bi-person-plus-fill me-2"></i> Add Supplier
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading suppliers...</p>
                </div>
            ) : suppliers.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                    <i className="bi bi-people fs-1 text-muted opacity-25"></i>
                    <p className="mt-3 text-muted">No suppliers found.</p>
                </div>
            ) : (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-muted small fw-bold text-uppercase">Name</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase">Phone</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase">Email</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase">Address</th>
                                <th className="pe-4 py-3 text-end text-muted small fw-bold text-uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(sup => (
                                <tr
                                    key={sup._id}
                                    className="align-middle"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedSupplier(sup)}
                                >
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                <i className="bi bi-building fs-5"></i>
                                            </div>
                                            <span className="fw-bold text-dark">{sup.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-muted d-flex align-items-center">
                                            <i className="bi bi-telephone text-primary opacity-50 me-2"></i>
                                            {sup.contactNumber}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-muted d-flex align-items-center">
                                            <i className="bi bi-envelope text-primary opacity-50 me-2"></i>
                                            {sup.email || <span className="text-muted opacity-50">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="text-muted">
                                        <div className="text-truncate" style={{ maxWidth: '250px' }}>
                                            <i className="bi bi-geo-alt text-primary opacity-50 me-2"></i>
                                            {sup.address || <span className="text-muted opacity-50">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="pe-4 text-end">
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="text-danger rounded-circle p-2"
                                            onClick={(e) => handleDelete(e, sup._id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}

            {isAddModalOpen && (
                <AddSupplierModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={fetchSuppliers}
                />
            )}

            {selectedSupplier && (
                <ViewSupplierModal
                    supplier={selectedSupplier}
                    onClose={() => setSelectedSupplier(null)}
                />
            )}
        </div>
    );
};

export default Suppliers;
