import React from 'react';
import '../../static/css/bootstrap4.min.css';
import '../../static/css/style.css';
import logo_img from '../../static/img/my_id_logo.png';

export default function Layout({ children }) {
  return (
    <div className="wrapper">
      <div className="simple_block">
        <a className="logo" href="/">
          <img src={logo_img} alt="" />
        </a>
        {children}
        {/* 
        <div className="footer">
          <div className="footer_info">
            2020 Информационная система биометрической идентификации || Единый интегратор UZINFOCOM
          </div>
        </div> */}
      </div>
      <footer className="footer">
        2020 Информационная система биометрической идентификации || Единый интегратор UZINFOCOM
      </footer>
    </div>
  );
}
