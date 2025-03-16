import React from 'react';
import './Banner.css';

const GridBanner = ({ size = 1, imageUrl, link }) => {
    // size может быть 1, 2 или 4
    const sizeClass = `grid-banner-${size}`;
    
    return (
        <div className={`grid-banner ${sizeClass}`}>
            <a href={link} className="banner-link">
                {imageUrl ? (
                    <img src={imageUrl} alt="Promotional banner" className="banner-image" />
                ) : (
                    <div className="banner-placeholder">
                        <div className="banner-gradient">
                            <h3>РЕКЛАМА</h3>
                            <span className="banner-text">Размер {size}x</span>
                        </div>
                    </div>
                )}
            </a>
        </div>
    );
};

export default GridBanner; 