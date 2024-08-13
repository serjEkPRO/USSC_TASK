import React from 'react';
import { getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, data, animated }) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path ${animated ? 'animated-path' : ''}`}
        d={edgePath}
        style={{ strokeDasharray: '5,5', stroke: '#000', strokeWidth: 2 }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
            pointerEvents: 'none',
            background: 'transparent'
          }}
          className="nodrag nopan"
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
