import {useState, useCallback} from 'react'; 
import { message } from 'antd';
import {TREE_TABLE, TREE_TABLE_ROWS} from './entities/tree'; 
import { MEMBER_TABLE, MEMBER_TABLE_ROWS } from './entities/member';
import { supabase } from '../utils/supabase';

export const PAGE_SIZE = 5; 

const GENERIC_ERROR_MESSAGE = 'Failed to operate on trees'; 

export default function useTreeAPI(columns) { 
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalCount, setTotalCount] = useState(0); 

  const fetchTrees = useCallback(async () => { 
    setLoading(true); 

    const start = (currentPage - 1) * PAGE_SIZE; 
    const end = start + PAGE_SIZE - 1;  

    const { data: trees, count, error } = await supabase
      .from(TREE_TABLE)
      .select("*", { count: "exact" })
      .order(TREE_TABLE_ROWS.CREATED_AT, { ascending: true })
      .range(start, end);
  
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
    } else {
      const keyedData = trees.map((tree) => ({
        key: tree.uuid, 
        ...tree, 
      }))
      setData(keyedData); 
      setTotalCount(count); 
    }

    setLoading(false);  
  }, [currentPage])

  async function createTree(tree) { 
    const user = supabase.auth.user(); 
    setLoading(true); 

    const payload = { 
      ...tree, 
      [TREE_TABLE_ROWS.CREATOR_UUID]: user.id,
    }; 

    const { error } = await supabase
      .from(TREE_TABLE)
      .insert([payload]); 
      
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false);   
    } else { 
      fetchTrees(); 
    }
  }

  async function updateTree(tree) { 
    setLoading(true); 
    const editableFields = columns
      .filter(({editable}) => editable)
      .map(({dataIndex}) => dataIndex); 
    const editableFieldsSet = new Set(editableFields);  

    const payload = Object.keys(tree).reduce((acc, field) => { 
      if (editableFieldsSet.has(field)) { 
        return { 
          ...acc,
          [field]: tree[field], 
        }; 
      }
      return acc; 
    }, {}); 

    const { error } = await supabase
      .from(TREE_TABLE)
      .update(payload)
      .eq(TREE_TABLE_ROWS.UUID, tree.uuid); 
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
    } else { 
      fetchTrees();
    }
  }

  async function deleteTree(uuid) { 
    setLoading(true); 

    // 1. delete any/all members belonging to the table 
    const { error: memberError } = await supabase
      .from(MEMBER_TABLE)
      .delete()
      .eq(MEMBER_TABLE_ROWS.TREE_UUID, uuid); 

    if (memberError) { 
      message.error(memberError?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
      return; 
    }

    // 2. delete the tree itself 
    const { error: treeError } = await supabase
      .from(TREE_TABLE)
      .delete()
      .eq(TREE_TABLE_ROWS.UUID, uuid);
    
    if (treeError) {
      message.error(treeError?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
    } else { 
      fetchTrees(); 
    }
  }

  return {
    // crud  
    fetchTrees,
    createTree,
    updateTree,
    deleteTree, // TODO: also delete all members and relations associated w tree  

    // data 
    data,
    totalCount, 
    loading,
    setCurrentPage,
  }; 
}