'use client';

import React, { useEffect } from 'react';

const Redirect = ({ url }) => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.location.href = url;
        }
    }, [url]);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>
                This page has moved. Redirecting to <a href={url}>{url}</a>...
            </p>
        </div>
    );
};

export default Redirect;
