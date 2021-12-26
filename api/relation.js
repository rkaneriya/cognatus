import {useState, useCallback} from 'react'; 
import { message } from 'antd';
import {RELATION_TABLE, RELATION_TABLE_ROWS} from './entities/relation'; 
import { supabase } from '../utils/supabase';

const GENERIC_ERROR_MESSAGE = 'Error'; 

export default function useRelationAPI(treeUuid, relationUuid) { 
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [totalCount, setTotalCount] = useState(0); 

  const fetchRelations = useCallback(async () => { 
    if (!treeUuid) {
      return;
    }

    setLoading(true); 

    const { data: relations, count, error } = await supabase
      .from(RELATION_TABLE)
      .select("*", { count: "exact" })
      .eq(RELATION_TABLE_ROWS.TREE_UUID, treeUuid) 
      .order(RELATION_TABLE_ROWS.CREATED_AT, { ascending: true }); 
      
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
    } else {
      const keyedData = relations.map((relation) => ({
        key: relation.uuid, 
        ...relation, 
      }))
      setData(keyedData); 
      setTotalCount(count); 
    } 

    setLoading(false);  
  }, [treeUuid]); 

  async function createRelation(relation) { 
    setLoading(true); 

    const payload = { 
      ...relation, 
      [RELATION_TABLE_ROWS.TREE_UUID]: treeUuid, 
    }; 

    const { error } = await supabase
      .from(RELATION_TABLE)
      .insert([payload]); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
    } else { 
      fetchRelations();
    }
  }

  async function updateRelation(relation) { 
    setLoading(true); 

    const payload = { 
      ...relation, 
      [RELATION_TABLE_ROWS.TREE_UUID]: treeUuid, 
    }; 

    const { error } = await supabase
      .from(RELATION_TABLE)
      .update(payload)
      .eq(RELATION_TABLE_ROWS.UUID, relation.uuid); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
    } else { 
      fetchRelations();
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
      fetchRelations(); 
    }
  }

  return {
    // crud  
    fetchRelations, 
    createRelation, 
    updateRelation,
    deleteRelation,

    // data 
    data,
    totalCount, 
    loading,
  }; 
}

// 