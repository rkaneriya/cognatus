import {useCallback, useState} from 'react'; 
import { RELATION_TABLE, RELATION_TABLE_ROWS } from '../entities/relation';
import {MEMBER_TABLE, MEMBER_TABLE_ROWS} from '../entities/member';
import { message } from 'antd';
import { supabase } from '../../utils/supabase';
import { SHARED_TREE_TABLE, SHARED_TREE_TABLE_ROWS } from '../entities/shared-tree';
import { TREE_TABLE, TREE_TABLE_ROWS } from '../entities/tree';

const GENERIC_ERROR_MESSAGE = 'Error'; 

const DEFAULT_VALUES = { 
  members: [], 
  relations: [], 
  isTreeEditable: null, 
  loading: true, 
}; 

export default function useMemberRelationAPI(treeUuid, selectedMemberUuid) { 
  const [data, setData] = useState(DEFAULT_VALUES); 

  const fetchMembersAndRelations = useCallback(async () => {
    if (!treeUuid) {
      return;
    }

    setData(d => ({
      ...d, 
      loading: true
    })); 

    // 1. determine if tree is accessible and/or editable by user
    const user = supabase.auth.user(); 
    let isTreeEditable = null; 

    const {data: tree, error: treeError} = await supabase
      .from(TREE_TABLE)
      .select(TREE_TABLE_ROWS.UUID)
      .eq(TREE_TABLE_ROWS.UUID, treeUuid)
      .eq(TREE_TABLE_ROWS.CREATOR_UUID, user.id)

    if (treeError) { 
      return; // 403 
    }

    const {data: sharee, error: shareeError} = await supabase
      .from(SHARED_TREE_TABLE)
      .select(SHARED_TREE_TABLE_ROWS.SHAREE_EMAIL)
      .eq(SHARED_TREE_TABLE_ROWS.TREE_UUID, treeUuid)
      .eq(SHARED_TREE_TABLE_ROWS.SHAREE_EMAIL, user.email)
    
    if (shareeError) {
      return; // 403 
    }
 
    if (tree.length !== 0 || sharee.length !== 0) {
      isTreeEditable = tree.length === 1; // editable only if user = creator 
    }

    // 2. fetch members 
    const { data: members, error: membersError } = await supabase
      .from(MEMBER_TABLE)
      .select("*")
      .eq(MEMBER_TABLE_ROWS.TREE_UUID, treeUuid) 
      .order(MEMBER_TABLE_ROWS.CREATED_AT, { ascending: true }); 

    if (membersError) { 
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
      return; 
    }

    // 3. fetch relations 
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

    setData({
      isTreeEditable,
      members: keyedMembers,
      relations: keyedRelations,
      loading: false, 
    });  
  }, [treeUuid]); 

  async function createMemberAndRelation(member, relation) { 
    setData(d => ({ 
      ...d,
      loading: true, 
    })); 

    // remove relation-related fields
    const memberCopy = {...member}; 
    delete memberCopy.start_date; 
    delete memberCopy.end_date; 

    // 1. create new member
    let payload = { 
      ...memberCopy, 
      [MEMBER_TABLE_ROWS.TREE_UUID]: treeUuid, 
      [MEMBER_TABLE_ROWS.BIRTH_DATE]: memberCopy.birth_date.format(), 
      [MEMBER_TABLE_ROWS.DEATH_DATE]: memberCopy.death_date ? memberCopy.death_date.format() : undefined,
    }; 
    
    const { data: [newMember], error: memberError } = await supabase
    .from(MEMBER_TABLE)
    .insert([payload]); 
    
    if (memberError) {
      message.error(memberError?.message || GENERIC_ERROR_MESSAGE)
      setData(d => ({
        ...d,
        loading: false,
      })); 
      return; // error making new member
    } 
    
    // 2. create new relation between source member and newMember
    payload = { 
      [RELATION_TABLE_ROWS.TREE_UUID]: treeUuid, 
      [RELATION_TABLE_ROWS.FROM_MEMBER_UUID]: selectedMemberUuid, 
      [RELATION_TABLE_ROWS.TO_MEMBER_UUID]: newMember.uuid, 
      [RELATION_TABLE_ROWS.TYPE]: relation.type, 
      [RELATION_TABLE_ROWS.START_DATE]: relation.start_date ? relation.start_date.format() : undefined, 
      [RELATION_TABLE_ROWS.END_DATE]: relation.end_date ? relation.end_date.format() : undefined, 
    }; 
  
    const { error: relationError } = await supabase
      .from(RELATION_TABLE)
      .insert([payload]); 

    if (relationError) {
      message.error(relationError?.message || GENERIC_ERROR_MESSAGE)
      setData(d => ({
        ...d,
        loading: false,
      })); 
      return;  // error making new relation; user can manually retry adding relation btwn existing members 
    } 
    
    fetchMembersAndRelations();  
  }

  async function deleteMemberAndRelations(uuid) { 
    setData(d => ({ 
      ...d,
      loading: true, 
    })); 

    // note: due to "on cascade", deleting a member will delete all rows referencing the member
    // (related relations will automatically be deleted)
    const { error: deleteMemberError } = await supabase
      .from(MEMBER_TABLE)
      .delete()
      .eq(MEMBER_TABLE_ROWS.UUID, uuid);
    
    if (deleteMemberError) {
      message.error(deleteMemberError?.message || GENERIC_ERROR_MESSAGE)
      setData(d => ({
        ...d,
        loading: false,
      })); 
      return // error deleting member 
    } 

    fetchMembersAndRelations(); 
  }

  async function createMember(member) { 
    setData(d => ({ 
      ...d,
      loading: true, 
    })); 

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
      setData(d => ({
        ...d,
        loading: false,
      })); 
    } else { 
      fetchMembersAndRelations();
      return data; 
    }
  }

  async function updateMember(member) { 
    setData(d => ({ 
      ...d,
      loading: true, 
    })); 

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
      setData(d => ({
        ...d,
        loading: false,
      })); 
    } else { 
      fetchMembersAndRelations();
      return data; 
    }
  }

  async function createRelation(toMemberUuid, type) { 
    setData(d => ({ 
      ...d,
      loading: true, 
    })); 

    const payload = { 
      [RELATION_TABLE_ROWS.FROM_MEMBER_UUID]: selectedMemberUuid, 
      [RELATION_TABLE_ROWS.TO_MEMBER_UUID]: toMemberUuid, 
      [RELATION_TABLE_ROWS.TYPE]: type, 
      [RELATION_TABLE_ROWS.TREE_UUID]: treeUuid, 
    }; 

    const { data, error } = await supabase
      .from(RELATION_TABLE)
      .insert([payload]); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setData(d => ({
        ...d,
        loading: false,
      })); 
    } else { 
      fetchMembersAndRelations();
      return data; 
    }
  }

  async function updateRelation(relation) { 
    setData(d => ({ 
      ...d,
      loading: true, 
    })); 

    const payload = { 
      ...relation, 
      [RELATION_TABLE_ROWS.TREE_UUID]: treeUuid, 
      [RELATION_TABLE_ROWS.START_DATE]: relation.start_date ? relation.start_date.format() : undefined, 
      [RELATION_TABLE_ROWS.END_DATE]: relation.end_date ? relation.end_date.format() : undefined, 
    }; 
    
    const { data, error } = await supabase
      .from(RELATION_TABLE)
      .update(payload)
      .eq(RELATION_TABLE_ROWS.UUID, relation.uuid); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setData(d => ({
        ...d,
        loading: false,
      })); 
    } else { 
      fetchMembersAndRelations();
      return data; 
    }
  }

  async function deleteRelation(uuid) { 
    setData(d => ({ 
      ...d,
      loading: true, 
    })); 

    const { error } = await supabase
      .from(RELATION_TABLE)
      .delete()
      .eq(RELATION_TABLE_ROWS.UUID, uuid);
    
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setData(d => ({
        ...d,
        loading: false,
      })); 
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
    ...data,
  }; 
}
