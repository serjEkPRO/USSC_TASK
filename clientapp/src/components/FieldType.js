import React from 'react';
import { useDrag } from 'react-dnd';

const FieldType = ({ type }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'FIELD',
        item: { field_type: type, name: type },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                padding: '5px',
                border: '1px solid black',
                marginBottom: '5px',
            }}
        >
            {type}
        </div>
    );
};

export default FieldType;
