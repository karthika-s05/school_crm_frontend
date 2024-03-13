import React from 'react';
import './box.css'

const Box = (props) => {
    return (
        <>
            <div className="dashboard-summery-one">
                <div className='icon'>
                    {props.name === 'Students' ? <i style={{
                        color: "#3cb878",
                        backgroundColor: "#d1f3e0"
                    }} className='bx bxs-group'></i> :props.name === 'Non-Teaching Staff' ?
                        <i style={{
                            color: "#ff0000",
                            backgroundColor: "#ffeaea"
                        }} className='bx bx-money'></i>:props.name === 'Teaching Staff' ?   <i style={{
                            color: "#3f7afc",
                            backgroundColor: "#e1f1ff"
                        }} className='bx bx-user'></i>:<i style={{
                            color: "#ffa001",
                            backgroundColor: "#fff2d8"
                        }} className='bx bx-group'></i> }
                </div>
                <div className='data'>
                    <div className="item-title">{props.name}</div>
                    <div className="item-number"><span data-num="150000">{props.amount}</span></div>
                </div>

            </div >
        </>
    )
}

export default Box