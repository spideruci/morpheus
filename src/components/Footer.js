import React from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
    return (
        <div className={styles.footer}>

            <div className={styles.social}> 
                <a href="http://spideruci.org"><img alt="spideruci.org" src={`${process.env.PUBLIC_URL}/spider_circle_red.svg`} /></a>
                <a href="https://github.com/spideruci"><img alt="github.com/spideruci" src={`${process.env.PUBLIC_URL}/GitHub-Mark-32px.png`} /></a>
            </div>
        </div>    
    )
}

export default Footer;