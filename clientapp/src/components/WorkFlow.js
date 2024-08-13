import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import CustomEdge from './CustomEdge';
import Background from './Background';

import '@xyflow/react/dist/style.css';
import '../styles/workflow.scss'; // Импортируйте файл стилей

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

function WorkFlow({ data }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
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

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const runPlaybook = async () => {
    setAnimated(true);

    const visitNode = async (nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      setActiveNode(node.id);
      console.log(`Playbook passed through: ${node.data.label}`);
      const isSuccess = Math.random() > 0.5; // Случайная успешность выполнения шага
      await delay(1000); // 1-second delay between each step
      setNodes((nds) => nds.map((n) =>
        n.id === node.id
          ? {
              ...n,
              style: {
                ...n.style,
                backgroundColor: isSuccess ? 'lightgreen' : 'lightcoral',
              },
            }
          : n
      ));
      setActiveNode(null);
      console.log(isSuccess ? 'Step succeeded.' : 'Step failed.');

      // Посетить соседние узлы
      const connectedEdges = edges.filter(e => e.source === nodeId);
      for (const edge of connectedEdges) {
        await visitNode(edge.target);
      }
    };

    // Начать обход с корневого узла (например, 'a')
    await visitNode('a');
    
    setAnimated(false);
    console.log('Playbook finished.');
  };

  return (
    <div className="wrapper">
      <Background />
      <button onClick={runPlaybook} className="playbook-button">Run Playbook</button>
      <ReactFlow
        nodes={nodes}
        edges={edges.map(edge => ({ ...edge, animated }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        fitView
      />
    </div>
  );
}

export default WorkFlow;
