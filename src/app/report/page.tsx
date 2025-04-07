"use client";
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const ReportPage = () => {
    const { user } = useAuth();

    if (user?.role !== "Pemilik" && user?.role !== "Administrator") {
        return <div>Not allowed</div>;
    }

    return (
        <div>
            <h1>Report Page</h1>
            {/* Placeholder for report content */}
        </div>
    );
};

export default ReportPage;