import React from 'react'; 
import Graph from 'react-graph-vis';
import { useStyletron } from 'styletron-react';

export default function(props) { 
  const [css] = useStyletron(); 
  const { 
    people, 
    relations, 
    selectedPersonId, 
    sourcePersonId,
    targetPersonId, 
    pathNodes,
    pathEdges,
    setSelectedPersonId,
  } = props; 

  const getNodeColor = (id) => { 
    if (
      id === sourcePersonId || 
      id === targetPersonId || 
      pathNodes.includes(id)
    ) return 'red'; 
    if (id === selectedPersonId) return 'yellow'; 
    return 'gray'; 
  }

  const nodes = people.map(({uuid, first_name, is_male}) => ({ 
    id: uuid,
    shape: 'circularImage',
    image: is_male
      ? '/images/male.jpg' 
      : '/images/female.jpg', 
    color: getNodeColor(id), 
    borderWidth: 3,
    label: `${first_name} (${uuid})`, 
  }));

  const edges = relations.map(({from, to, type}, i) => ({
    from,
    to,
    title: type, 
    color: { 
      color: pathEdges.includes(i) ? 'red' : 'gray', 
      inherit: 'false',  
    },
    width: pathEdges.includes(i) ? 1 : undefined, 
  })); 

  const graph = {
    nodes,
    edges, 
  };

  const options = {
    edges: {
      arrows: { 
        to: {
          enabled: false 
        }, 
        from: {
          enabled: false, 
        }, 
      },
      smooth: true,  
    },
    layout: { 
      randomSeed: 1000, 
      improvedLayout: false, 
    },
    physics: { 
      enabled: true, 
      repulsion: { 
        nodeDistance: 1000,
        centralGravity: 1, 
      },
      adaptiveTimestep: true
    },
    interaction: { 
      hideEdgesOnDrag: true, 
    },
  };

  const events = {
    select: function(event) {
      const {nodes} = event;
      const id = nodes[0] || null; 
      setSelectedPersonId(id); 
    },
  };

  return (
    <div className={css({height: '100%'})}>
      <Graph
        graph={graph}
        options={options}
        events={events}
      />
    </div>
  ); 
}