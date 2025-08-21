import React from 'react'
import { AiFillInstagram, AiOutlineTwitter } 
from 'react-icons/ai'
import styles from '../styles/components/footer.module.css';

const Footer = () => {
  return (
    <div className={styles.footerContainer}>
      <p>2024 Snacks All rights reserved</p>
      <p className={styles.icons}>
        <AiFillInstagram />
        <AiOutlineTwitter />
      </p>
      </div>
  )
}

export default Footer