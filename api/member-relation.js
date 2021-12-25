import {useState} from 'react'; 
import { RELATION_TABLE_ROWS } from './entities/relation';
import {useMemberAPI} from './member';
import {useRelationAPI} from './relation'; 

export default function useMemberRelationAPI(treeUuid, selectedMemberUuid) { 
  const [loading, setLoading] = useState(false); 
  const { 
    createMember, 
    fetchMembers, 
    data: memberData, 
    loading: memberLoading,
  } = useMemberAPI(treeUuid, null); 

  const { 
    createRelation, 
    fetchRelations, 
    data: relationData, 
    loading: relationLoading, 
  } = useRelationAPI(treeUuid, null); 

  async function createMemberAndRelation(member, type) { 
    setLoading(true); 

    // 1. create new member
    const newMember = await createMember(member); 

    // 2. create new relation between source member and newMember
    const payload = { 
      [RELATION_TABLE_ROWS.TREE_UUID]: treeUuid, 
      [RELATION_TABLE_ROWS.FROM_MEMBER_UUID]: selectedMemberUuid, 
      [RELATION_TABLE_ROWS.TO_MEMBER_UUID]: newMember.uuid, 
      [RELATION_TABLE_ROWS.TYPE]: type, 
    }; 

    const newRelation = await createRelation(payload); 

    setLoading(false); 
    fetchMembers(); 
    fetchRelations();
  }

  return {
    // crud
    createMemberAndRelation,

    // data 
    memberData, 
    relationData, 
    loading,
  }; 
}
