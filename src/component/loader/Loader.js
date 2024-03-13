import React from 'react';
import './Loader.css';

const Loader = () => {
    return (
        <div className="container   align-items-center d-flex flex-row justify-content-center">
            <div className="loader-container" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="loader loader-1">
                    <div className="loader-outter"></div>
                    <div className="loader-inner"></div>
                </div>
            </div>
        </div>
    );
};

export default Loader;