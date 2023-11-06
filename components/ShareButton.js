// components/ShareButton.js
import React from 'react';
import styles from './ShareButton.module.css'; // Import your CSS module


const ShareButton = () => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Share this Blog',
          text: 'Check out this blog from perfora!',
          url: window.location.href,
        });
      } else {
        alert('Web Share API is not supported in this browser.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <button className={styles.shareButton} onClick={handleShare}>Share</button>
  );
};

export default ShareButton;
