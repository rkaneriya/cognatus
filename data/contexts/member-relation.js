import cytoscape from "cytoscape";  
import { createContext, useEffect, useState } from "react"; 
import { useRouter } from "next/router";
import useMemberRelationAPI from '../hooks/member-relation';
import { findPath } from "../../utils/relations";

export const MemberRelationContext = createContext(); 

function computeMembersAndRelations(selectedMemberUuid, members, relations) { 
  // member data 
  const membersByUuid = members.reduce((acc, member) => ({
    ...acc, 
    [member.uuid]: member, 
  }), {});

  // relation data 
  const relationsByUuid = relations.reduce((acc, relation) => ({
    ...acc,
    [relation.uuid]: relation,
  }), {}); 

  const relationsByMemberUuid = relations.reduce((acc, relation) => {
    if (acc[relation.from_member_uuid]) { 
      acc[relation.from_member_uuid].push(relation); 
    } else {
      acc[relation.from_member_uuid] = [relation]; 
    }

    if (acc[relation.to_member_uuid]) { 
      acc[relation.to_member_uuid].push(relation); 
    } else {
      acc[relation.to_member_uuid] = [relation]; 
    }
    return acc;
  }, {}); 
  
  const directRelations = relationsByMemberUuid[selectedMemberUuid] || []; 
  // note: this will prohibit two members from having two different relations (no support for marrying your kid/parent!)
  const directRelationsByRelativeUuid = directRelations.reduce((acc, relation) => { 
    const relative = relation.from_member_uuid === selectedMemberUuid 
      ? membersByUuid[relation.to_member_uuid] 
      : membersByUuid[relation.from_member_uuid]; 
    return {
      ...acc,
      [relative.uuid]: relation, 
    }; 
  }, {});  
  
  return {
    membersByUuid,
    relationsByUuid,
    directRelationsByRelativeUuid,
  }
}

export function MemberRelationContextProvider({children}) { 
  const router = useRouter(); 
  const treeUuid = router?.query?.uuid; 
  const [selectedMemberUuid, setSelectedMemberUuid] = useState(null);
  const [targetRelativeUuid, setTargetRelativeUuid] = useState(null); 

  const {
    fetchMembersAndRelations, 
    createMemberAndRelation,
    deleteMemberAndRelations,

    createRelation, 
    deleteRelation, 
    updateRelation, 

    createMember,
    updateMember,

    isTreeEditable, 
    members,
    relations, 
    loading,
  } = useMemberRelationAPI(treeUuid, selectedMemberUuid); 

  useEffect(() => { 
    fetchMembersAndRelations(); 
  }, [fetchMembersAndRelations]); 

  const { 
    membersByUuid,
    relationsByUuid,
    directRelationsByRelativeUuid, 
  } = computeMembersAndRelations(selectedMemberUuid, members, relations); 

  const nodes = members.map(({uuid, first_name}) => ({
    data: { 
      id: uuid,
      firstName: first_name, 
    }
  })); 
  
  const edges = relations.map(({uuid, from_member_uuid, to_member_uuid, type}) => ({
    data: { 
      id: uuid, 
      source: from_member_uuid,
      target: to_member_uuid,
      type
    }
  }));
  
  const cy = cytoscape({
    elements: [...nodes, ...edges] 
  });

  const {
    pathNodes,
    pathEdges, 
  } = findPath(selectedMemberUuid, targetRelativeUuid, cy); 

  const value = { 
    // crud 
    createMemberAndRelation,
    deleteMemberAndRelations,

    createRelation, 
    deleteRelation, 
    updateRelation, 

    createMember,
    updateMember,

    // data 
    selectedMemberUuid, 
    setSelectedMemberUuid,

    targetRelativeUuid,
    setTargetRelativeUuid,

    pathNodes,
    pathEdges, 

    membersByUuid,
    relationsByUuid,
    directRelationsByRelativeUuid,

    isTreeEditable, 
    members,
    relations, 
    loading,
  }; 

  return (
    <MemberRelationContext.Provider value={value}>
      {children}
    </MemberRelationContext.Provider>
  )
}