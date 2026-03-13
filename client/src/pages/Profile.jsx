import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import apiClient, { BASE_URL } from '../api-request/config';
import { Button, Form, Row, Col, Card, Image, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        password: '',
        profileImage: user?.profileImage || ''
    });

    const userAvatar = formData.profileImage 
        ? (user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}${user.profileImage}`)
        : `https://ui-avatars.com/api/?name=${formData.fullName || formData.username || 'User'}&background=0d6efd&color=fff&bold=true`;

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append('image', file);
        setUploading(true);

        try {
            const { data } = await apiClient.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, profileImage: data });
            toast.success('Profile picture updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await apiClient.put('/auth/profile', formData);
            // Updating local auth context
            localStorage.setItem('user', JSON.stringify(data));
            window.location.reload(); // Simplest way to refresh all components using user context
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container-fluid px-0">
            <div className="mb-5">
                <h1 className="fw-black text-dark m-0 letter-spacing-n1">My Profile</h1>
                <p className="text-muted fw-bold small m-0 uppercase opacity-75">Manage your personal information</p>
            </div>

            <Row className="g-4">
                <Col lg={4}>
                    <Card className="border-0 shadow-sm rounded-5 overflow-hidden bg-white text-center p-5 border">
                        <div className="position-relative d-inline-block mx-auto mb-4">
                            <Image
                                src={userAvatar}
                                roundedCircle
                                className="border shadow-lg object-fit-cover"
                                width="120"
                                height="120"
                                style={{ border: '5px solid #fff' }}
                            />
                            <Form.Label className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer mb-0" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-camera-fill fs-6"></i>
                                <Form.Control type="file" className="d-none" onChange={uploadFileHandler} />
                            </Form.Label>
                        </div>
                        {uploading && <div className="small fw-bold text-primary mb-3">Uploading image...</div>}
                        
                        <h4 className="fw-black text-dark mb-1">{formData.fullName || formData.username}</h4>
                        <p className="text-muted fw-bold extra-small text-uppercase letter-spacing-2 mb-4">
                            <i className="bi bi-shield-check text-success me-1"></i> {user?.role || 'Pharmacist'}
                        </p>
                        
                        <div className="bg-light rounded-4 p-3 text-start border border-dashed">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="xxs fw-bold text-muted uppercase">Employee ID</span>
                                <span className="fw-bold small">#{user?._id?.substring(0, 8)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="xxs fw-bold text-muted uppercase">Status</span>
                                <Badge bg="success" className="rounded-pill px-3 xxs fw-black letter-spacing-1 shadow-sm uppercase">Active</Badge>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-5 bg-white p-4 p-md-5 border">
                        <h5 className="fw-black text-dark mb-5 border-bottom pb-4">Profile Settings</h5>
                        <Form onSubmit={handleSubmit}>
                            <Row className="g-4">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Full Name</Form.Label>
                                        <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Username</Form.Label>
                                        <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Email Address</Form.Label>
                                        <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Phone Number</Form.Label>
                                        <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Home Address</Form.Label>
                                        <Form.Control as="textarea" rows={2} className="bg-light border-0 py-3 rounded-4 shadow-none fw-black resize-none" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-5">
                                        <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Change Password</Form.Label>
                                        <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" type="password" placeholder="Leave blank to keep current password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Button variant="primary" type="submit" className="w-100 py-3 rounded-4 fw-black uppercase letter-spacing-1 shadow-primary border-0" disabled={submitting || uploading}>
                                        {submitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
