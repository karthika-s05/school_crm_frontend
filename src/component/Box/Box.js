import React from 'react';
import './box.css';

const iconMap = {
  Students:          { icon: 'bx bxs-group',      color: '#3cb878', bg: '#e8f8ef' },
  Parents:           { icon: 'bx bx-group',        color: '#f8b940', bg: '#fff8e6' },
  'Teaching Staff':  { icon: 'bx bx-user',         color: '#0a3a6e', bg: '#e6eef8' },
  'Non-Teaching Staff': { icon: 'bx bxs-user-badge', color: '#e74c3c', bg: '#fdecea' },
};

const Box = ({ name, amount }) => {
  const { icon, color, bg } = iconMap[name] || { icon: 'bx bx-data', color: '#051f3e', bg: '#f0f4ff' };
  return (
    <div className="box-card">
      <div className="box-card-bar" style={{ background: color }}></div>
      <div className="box-card-icon" style={{ background: bg, color }}>
        <i className={icon}></i>
      </div>
      <div className="box-card-info">
        <span className="box-card-label">{name}</span>
        <strong className="box-card-value">{amount}</strong>
      </div>
    </div>
  );
};

export default Box;
