import {useState, useCallback} from 'react'; 
import { message } from 'antd';
import {MEMBER_TABLE, MEMBER_TABLE_ROWS} from './entities/member'; 
import { supabase } from '../utils/supabase';

const GENERIC_ERROR_MESSAGE = 'Error'; 

export default function useMemberAPI(treeUuid, memberUuid) { 
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [totalCount, setTotalCount] = useState(0); 

  const fetchMembers = useCallback(async () => { 
    if (!treeUuid) {
      return;
    }

    setLoading(true); 

    const { data: members, count, error } = await supabase
      .from(MEMBER_TABLE)
      .select("*", { count: "exact" })
      .eq(MEMBER_TABLE_ROWS.TREE_UUID, treeUuid) 
      .order(MEMBER_TABLE_ROWS.CREATED_AT, { ascending: true }); 
      
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
    } else {
      const keyedData = members.map((member) => ({
        key: member.uuid, 
        ...member, 
      }))
      setData(keyedData); 
      setTotalCount(count); 
    } 

    setLoading(false);  
  }, [treeUuid]); 

  async function createMember(member) { 
    setLoading(true); 

    const payload = { 
      ...member, 
      [MEMBER_TABLE_ROWS.BIRTH_DATE]: member.birth_date.format(), 
      [MEMBER_TABLE_ROWS.TREE_UUID]: treeUuid, 
    }; 

    const { error } = await supabase
      .from(MEMBER_TABLE)
      .insert([payload]); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
    } else { 
      fetchMembers();
    }
  }

  async function updateMember(member) { 
    setLoading(true); 

    const payload = { 
      ...member, 
      [MEMBER_TABLE_ROWS.BIRTH_DATE]: member.birth_date.format(), 
      [MEMBER_TABLE_ROWS.TREE_UUID]: treeUuid, 
    }; 

    const { error } = await supabase
      .from(MEMBER_TABLE)
      .update(payload)
      .eq(MEMBER_TABLE_ROWS.UUID, memberUuid); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
    } else { 
      fetchMembers();
    }
  }

  async function deleteMember(uuid) { 
    setLoading(true); 

    const { error } = await supabase
      .from(MEMBER_TABLE)
      .delete()
      .eq(MEMBER_TABLE_ROWS.UUID, uuid);
    
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
    } else { 
      fetchMembers(); 
    }
  }

  return {
    // crud  
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,

    // data 
    data,
    totalCount, 
    loading,
  }; 
}
