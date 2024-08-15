import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
} from '@xyflow/react';
import CustomEdge from './CustomEdge';
import Background from './Background';
import NodeSidebar from './NodeSidebar';

import '@xyflow/react/dist/style.css';
import '../styles/workflow.scss';

const initialNodes = [
  { id: 'a', position: { x: 0, y: 0 }, data: { label: 'Node A' }, style: { zIndex: 2 } },
  { id: 'b', position: { x: 200, y: 100 }, data: { label: 'Node B' }, style: { zIndex: 2 } },
  { id: 'c', position: { x: 400, y: 200 }, data: { label: 'Node C' }, style: { zIndex: 2 } },
];

const initialEdges = [
  { id: 'a->b', type: 'custom-edge', source: 'a', target: 'b', data: { label: 'Edge A-B' } },
  { id: 'b->c', type: 'custom-edge', source: 'b', target: 'c', data: { label: 'Edge B-C' } },
];

const edgeTypes = {
  'custom-edge': CustomEdge,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

function WorkFlow({ data }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [activeNode, setActiveNode] = useState(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (data?.components.length) {
      const updatedNodes = data.components.map((component, index) => ({
        id: `node-${index}`,
        position: { x: index * 200, y: index * 100 },
        data: { label: `Node ${index}` },
        style: { zIndex: 2 },
      }));
      const updatedEdges = data.connections.map((connection, index) => ({
        id: `edge-${index}`,
        type: 'custom-edge',
        source: connection.source,
        target: connection.target,
        data: { label: `Edge ${connection.source}-${connection.target}` },
      }));
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    }
  }, [data]);

  const onConnect = useCallback(
    (connection) => {
      const edge = { ...connection, type: 'custom-edge', data: { label: `Edge ${connection.source}-${connection.target}` } };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <div className="dndflow">
      <NodeSidebar />
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges.map(edge => ({ ...edge, animated }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          edgeTypes={edgeTypes}
          fitView
        >
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <WorkFlow />
  </ReactFlowProvider>
);
