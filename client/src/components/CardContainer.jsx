import React from 'react';
import { Card } from 'react-bootstrap';

const CardContainer = ({ children }) => {
    return (
        <Card className="shadow-sm border-0 mb-4 p-4" style={{ borderRadius: '15px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
            <Card.Body className="p-0">
                {children}
            </Card.Body>
        </Card>
    );
};

export default CardContainer;
