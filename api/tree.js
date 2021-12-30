import {useState, useCallback} from 'react'; 
import { message } from 'antd';
import {TREE_TABLE, TREE_TABLE_ROWS} from './entities/tree'; 
import { MEMBER_TABLE, MEMBER_TABLE_ROWS } from './entities/member';
import { supabase } from '../utils/supabase';
import { SHARED_TREE_TABLE, SHARED_TREE_TABLE_ROWS } from './entities/shared-tree';

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

    const user = supabase.auth.user(); 

    const { data: trees, count, error: treeError } = await supabase
      .from(TREE_TABLE)
      .select("*", { count: "exact" })
      .eq(TREE_TABLE_ROWS.CREATOR_UUID, user.id)
      .order(TREE_TABLE_ROWS.CREATED_AT, { ascending: true })
      .range(start, end);

    if (treeError) { 
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
      setLoading(false); 
      return; 
    }

    const treeUuids = trees.map(t => t.uuid); 

    const {data: sharedTrees, error: sharedTreeError} = await supabase
      .from(SHARED_TREE_TABLE)
      .select('*')
      .eq(SHARED_TREE_TABLE_ROWS.SHARER_EMAIL, user.email)
      .in(SHARED_TREE_TABLE_ROWS.TREE_UUID, treeUuids); 
  
    const sharedTreesByTreeUuid = sharedTrees.reduce((acc, s) => { 
      const obj = {
        sharee_email: s.sharee_email,
        uuid: s.uuid, 
      }; 
      if (acc[s.tree_uuid]) { 
        acc[s.tree_uuid].push(obj); 
      } else { 
        acc[s.tree_uuid] = [obj]; 
      }
      return acc; 
    }, {}); 

    if (sharedTreeError) {
      message.error(sharedTreeError?.message || GENERIC_ERROR_MESSAGE);
    } else {
      const keyedData = trees.map((tree) => ({
        key: tree.uuid, 
        ...tree, 
        sharees: sharedTreesByTreeUuid[tree.uuid] || [], 
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