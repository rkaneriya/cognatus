import {useCallback, useState} from 'react'; 
import { RELATION_TABLE, RELATION_TABLE_ROWS } from './entities/relation';
import {MEMBER_TABLE, MEMBER_TABLE_ROWS} from './entities/member';
import { message } from 'antd';
import { supabase } from '../utils/supabase';
import { RELATION_TYPES } from '../constants/relation-types';

const GENERIC_ERROR_MESSAGE = 'Error'; 

export default function useMemberRelationAPI(treeUuid, selectedMemberUuid) { 
  const [members, setMembers] = useState([]); 
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true); 

  const fetchMembersAndRelations = useCallback(async () => {
    if (!treeUuid) {
      return;
    }

    setLoading(true); 

    // fetch members 
    const { data: members, error: membersError } = await supabase
      .from(MEMBER_TABLE)
      .select("*")
      .eq(MEMBER_TABLE_ROWS.TREE_UUID, treeUuid) 
      .order(MEMBER_TABLE_ROWS.CREATED_AT, { ascending: true }); 

    if (membersError) { 
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
      return; 
    }

    // fetch relations 
    const { data: relations, error: relationsError } = await supabase
      .from(RELATION_TABLE)
      .select("*")
      .eq(RELATION_TABLE_ROWS.TREE_UUID, treeUuid) 
      .order(RELATION_TABLE_ROWS.CREATED_AT, { ascending: true }); 
      
    if (relationsError) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
      return; 
    } 

    const keyedMembers = members.map((member) => ({
      key: member.uuid, 
      ...member, 
    })); 

    const keyedRelations = relations.map((relation) => ({
      key: relation.uuid, 
      ...relation, 
    })); 

    setMembers(keyedMembers); 
    setRelations(keyedRelations); 

    setLoading(false); 
  }, [treeUuid]); 

  async function createMemberAndRelation(member, type) { 
    setLoading(true); 

    // 1. create new member
    let payload = { 
      ...member, 
      [MEMBER_TABLE_ROWS.TREE_UUID]: treeUuid, 
      [MEMBER_TABLE_ROWS.BIRTH_DATE]: member.birth_date.format(), 
      [MEMBER_TABLE_ROWS.DEATH_DATE]: member.death_date ? member.death_date.format() : undefined,
    }; 

    const { data: [newMember], error: memberError } = await supabase
      .from(MEMBER_TABLE)
      .insert([payload]); 

    if (memberError) {
      message.error(memberError?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);
      return; // error making new member
    } 

    // 2. create new relation between source member and newMember
    payload = { 
      [RELATION_TABLE_ROWS.TREE_UUID]: treeUuid, 
      [RELATION_TABLE_ROWS.FROM_MEMBER_UUID]: selectedMemberUuid, 
      [RELATION_TABLE_ROWS.TO_MEMBER_UUID]: newMember.uuid, 
      [RELATION_TABLE_ROWS.TYPE]: type, 
    }; 
  
    const { error: relationError } = await supabase
      .from(RELATION_TABLE)
      .insert([payload]); 

    if (relationError) {
      message.error(relationError?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
      return;  // error making new relation; user can manually retry adding relation btwn existing members 
    } 
    
    fetchMembersAndRelations();  
  }

  async function deleteMemberAndRelations(uuid) { 
    setLoading(true); 

    const { error: deleteRelationError } = await supabase
      .from(RELATION_TABLE)
      .delete()
      .or(`${RELATION_TABLE_ROWS.FROM_MEMBER_UUID}.eq.${uuid},${RELATION_TABLE_ROWS.TO_MEMBER_UUID}.eq.${uuid}`)
    
    if (deleteRelationError) {
      message.error(deleteRelationError?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
      return; // error deleting relations 
    } 

    const { error: deleteMemberError } = await supabase
      .from(MEMBER_TABLE)
      .delete()
      .eq(MEMBER_TABLE_ROWS.UUID, uuid);
    
    if (deleteMemberError) {
      message.error(deleteMemberError?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
      return // error deleting member 
    } 

    fetchMembersAndRelations(); 
  }

  async function createMember(member) { 
    setLoading(true); 

    const payload = { 
      ...member, 
      [MEMBER_TABLE_ROWS.TREE_UUID]: treeUuid, 
      [MEMBER_TABLE_ROWS.BIRTH_DATE]: member.birth_date.format(), 
      [MEMBER_TABLE_ROWS.DEATH_DATE]: member.death_date ? member.death_date.format() : undefined,
    }; 

    const { data, error } = await supabase
      .from(MEMBER_TABLE)
      .insert([payload]); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
    } else { 
      fetchMembersAndRelations();
      return data; 
    }
  }

  async function updateMember(member) { 
    setLoading(true); 

    const payload = { 
      ...member, 
      [MEMBER_TABLE_ROWS.BIRTH_DATE]: member.birth_date.format(), 
      [MEMBER_TABLE_ROWS.DEATH_DATE]: member.death_date ? member.death_date.format() : undefined,
      [MEMBER_TABLE_ROWS.TREE_UUID]: treeUuid, 
    }; 

    const { data, error } = await supabase
      .from(MEMBER_TABLE)
      .update(payload)
      .eq(MEMBER_TABLE_ROWS.UUID, selectedMemberUuid); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
    } else { 
      fetchMembersAndRelations();
      return data; 
    }
  }

  async function createRelation(relation) { 
    setLoading(true); 

    const payload = { 
      ...relation, 
      [RELATION_TABLE_ROWS.TREE_UUID]: treeUuid, 
    }; 

    const { data, error } = await supabase
      .from(RELATION_TABLE)
      .insert([payload]); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
    } else { 
      fetchMembersAndRelations();
      return data; 
    }
  }

  async function updateRelation(relation) { 
    setLoading(true); 

    const payload = { 
      ...relation, 
      [RELATION_TABLE_ROWS.TREE_UUID]: treeUuid, 
    }; 

    const { data, error } = await supabase
      .from(RELATION_TABLE)
      .update(payload)
      .eq(RELATION_TABLE_ROWS.UUID, relation.uuid); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
    } else { 
      fetchMembersAndRelations();
      return data; 
    }
  }

  async function deleteRelation(uuid) { 
    setLoading(true); 

    const { error } = await supabase
      .from(RELATION_TABLE)
      .delete()
      .eq(RELATION_TABLE_ROWS.UUID, uuid);
    
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
    } else { 
      fetchMembersAndRelations(); 
    }
  }

  return {
    // crud
    fetchMembersAndRelations, 
    createMemberAndRelation,
    deleteMemberAndRelations,

    createMember,
    updateMember,
    
    createRelation,
    updateRelation,
    deleteRelation,

    // data 
    members, 
    relations, 
    loading,
  }; 
}
