import {useContext} from 'react'; 
import Graph from 'react-graph-vis';
import { useStyletron } from 'styletron-react';
import {getRelationEdgeColor, getIsRelationEdgeDashed} from '../utils/relations'; 
import { MemberRelationContext } from '../data/contexts/member-relation';

export default function TreeGraph() { 
  const [css] = useStyletron(); 
  const {
    members, 
    relations, 
    pathNodes,
    pathEdges,  
    selectedMemberUuid,
    setSelectedMemberUuid,
    setTargetRelativeUuid,
  } = useContext(MemberRelationContext); 

  const getNodeColor = (id) => { 
    if (id === selectedMemberUuid) return 'yellow'; 
    if (pathNodes.includes(id)) return 'red'; 
    return 'gray'; 
  }

  const nodes = members.map(({uuid, first_name, is_male}) => ({ 
    id: uuid,
    shape: 'circularImage',
    image: is_male
      ? '/male.jpg' 
      : '/female.jpg', 
    color: getNodeColor(uuid), 
    borderWidth: 3,
    label: first_name, 
  }));

  const edges = relations.map(({uuid, from_member_uuid, to_member_uuid, type}) => ({
    from: from_member_uuid,
    to: to_member_uuid, 
    title: type, 
    color: { 
      color: pathEdges.includes(uuid) ? 'red' : getRelationEdgeColor(type), 
      inherit: 'false',  
    },
    width: pathEdges.includes(uuid) ? 1 : undefined, 
    dashes: getIsRelationEdgeDashed(type), 
  })); 

  const graph = {
    nodes,
    edges, 
  };

  const options = {
    autoResize: true, 
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
    selectNode: function(event) {
      const {nodes} = event;
      const uuid = nodes[0] || null; 
      setSelectedMemberUuid(uuid); 
      setTargetRelativeUuid(null); 
    },
  };

  return (
    <div className={css({
      height: '100%', 
      margin: '0 -36px',
    })}>
      <Graph
        graph={graph}
        options={options}
        events={events}
      />
    </div>
  ); 
}