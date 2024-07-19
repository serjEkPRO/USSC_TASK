import React from 'react';

const FormField = ({ field }) => {
    return (
        <div
            style={{
                padding: '8px',
                margin: '4px',
                backgroundColor: '#2575fc',
                color: 'white',
                borderRadius: '4px',
            }}
        >
            {field.type}
        </div>
    );
};

export default FormField;
