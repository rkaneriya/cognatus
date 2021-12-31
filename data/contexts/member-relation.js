import { createContext, useEffect, useState } from "react"; 
import { useRouter } from "next/router";
import useMemberRelationAPI from '../hooks/member-relation';

export const MemberRelationContext = createContext(); 

export function MemberRelationContextProvider({children}) { 
  const router = useRouter(); 
  const treeUuid = router?.query?.uuid; 
  const [selectedMemberUuid, setSelectedMemberUuid] = useState(null);

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

  // member data 
  const membersByUuid = members.reduce((acc, member) => ({
    ...acc, 
    [member.uuid]: member, 
  }), {});


  // relation data 
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

    membersByUuid,
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