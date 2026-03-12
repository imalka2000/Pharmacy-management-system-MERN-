import { useState } from "react";
import Header from "./components/header";
import Nav from "./components/navbar";
import Container from "./components/container";
import { Toaster } from 'react-hot-toast';

const DefaultLayout = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <div className={`app-layout ${!isOpen ? "sidebar-closed" : ""}`}>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    className: 'fw-semibold small',
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        padding: '14px 20px',
                        borderRadius: '8px',
                    },
                }}
            />

            <Header toggleSidebar={toggleSidebar} />
            <Nav isOpen={isOpen} />

            <div className={`main-wrapper ${!isOpen ? "full-width" : ""}`}>
                <Container />
            </div>
        </div>
    );
};

export default DefaultLayout;
