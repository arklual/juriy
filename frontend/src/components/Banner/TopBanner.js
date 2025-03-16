import React from 'react';
import './Banner.css';

const TopBanner = ({ imageUrl, link }) => {
    return (
        <div className="top-banner">
            <a href={link} className="banner-link">
                {imageUrl ? (
                    <img src={imageUrl} alt="Promotional banner" className="banner-image" />
                ) : (
                    <div className="banner-placeholder">
                        <div className="banner-gradient">
                            <h2>ОБЛАКО ПОДАРКОВ</h2>
                            <span className="banner-discount">до 90%</span>
                        </div>
                    </div>
                )}
            </a>
        </div>
    );
};

export default TopBanner; 