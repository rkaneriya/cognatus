import {useState, useCallback, useContext} from 'react'; 
import { message } from 'antd';
import {SHARED_TREE_TABLE, SHARED_TREE_TABLE_ROWS} from '../entities/shared-tree'; 
import {SHAREE_TREE_EXT_TABLE, SHAREE_TREE_EXT_TABLE_ROWS} from '../entities/sharee-tree-ext'; 
import {TREE_TABLE, TREE_TABLE_ROWS} from '../entities/tree'; 
import { supabase } from '../../utils/supabase';
import { UserContext } from '../contexts/user';

export const PAGE_SIZE = 5; 

const GENERIC_ERROR_MESSAGE = 'Failed to operate on trees'; 

export default function useSharedTreeAPI(fetchTrees) { 
  const {user} = useContext(UserContext); 
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalCount, setTotalCount] = useState(0); 

  const fetchSharedTrees = useCallback(async () => { 
    setLoading(true); 

    const start = (currentPage - 1) * PAGE_SIZE; 
    const end = start + PAGE_SIZE - 1;  

    if (!user) { 
      setLoading(false); 
      return; 
    }

    // 1. get page of uuids of trees shared with user 
    const {data: sharedTrees, count, error: sharedTreeError} = await supabase
      .from(SHARED_TREE_TABLE)
      .select('*', {count: 'exact'})
      .eq(SHARED_TREE_TABLE_ROWS.SHAREE_EMAIL, user?.email)
      .order(SHARED_TREE_TABLE_ROWS.CREATED_AT, { ascending: false })
      .range(start, end);

    if (sharedTreeError) { 
      message.error(sharedTreeError?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
      return; 
    }

    const sharedTreesByUuid = sharedTrees.reduce((acc, s) => ({ 
      ...acc,
      [s.tree_uuid]: s, 
    }), {}); 

    // 2. fetch extension preferences for each shared tree
    const {data: shareeExtData, error: shareeExtError} = await supabase
      .from(SHAREE_TREE_EXT_TABLE)
      .select('*')
      .eq(SHAREE_TREE_EXT_TABLE_ROWS.SHAREE_EMAIL, user?.email)
      .in(SHAREE_TREE_EXT_TABLE_ROWS.SHARED_TREE_ROW_UUID, sharedTrees.map(t => t.uuid)); 

    if (shareeExtError) { 
      message.error(sharedTreeError?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
      return; 
    }

    const shareeTreeExtBySharedTreeRowUuid = shareeExtData.reduce((acc, s) => ({ 
      ...acc,
      [s.shared_tree_row_uuid]: s, 
    }), {}); 

    // 3. fetch actual trees using those uuids 
    const {data: trees, error: treeError} = await supabase
      .from(TREE_TABLE)
      .select('*')
      .in(TREE_TABLE_ROWS.UUID, Object.keys(sharedTreesByUuid)); 
  

    if (treeError) {
      message.error(treeError?.message || GENERIC_ERROR_MESSAGE);
    } else {
      const keyedData = trees.map((tree) => ({
        key: tree.uuid, 
        ...tree, 
        shared_tree_row_uuid: sharedTreesByUuid[tree.uuid].uuid, 
        sharer_email: sharedTreesByUuid[tree.uuid].sharer_email, 
        is_email_subscribed: shareeTreeExtBySharedTreeRowUuid[sharedTreesByUuid[tree.uuid].uuid]?.is_email_subscribed,
        sharee_tree_ext_row_uuid: shareeTreeExtBySharedTreeRowUuid[sharedTreesByUuid[tree.uuid].uuid]?.uuid,  
      }))
      setData(keyedData); 
      setTotalCount(count); 
    }

    setLoading(false);  
  }, [currentPage, user])

  async function createSharedTree(treeUuid, shareeEmail, isEditable) { 
    setLoading(true); 

    const payload = { 
      [SHARED_TREE_TABLE_ROWS.TREE_UUID]: treeUuid,
      [SHARED_TREE_TABLE_ROWS.SHARER_EMAIL]: user?.email, 
      [SHARED_TREE_TABLE_ROWS.SHAREE_EMAIL]: shareeEmail, 
      [SHARED_TREE_TABLE_ROWS.IS_EDITABLE]: Boolean(isEditable), 
    }; 

    const { error } = await supabase
      .from(SHARED_TREE_TABLE)
      .insert([payload]); 
      
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
    } else { 
      fetchTrees(); 
      fetchSharedTrees(); 
    }

    setLoading(false);   
  }

  async function deleteSharedTree(uuid) { 
    setLoading(true); 

    const { error } = await supabase
      .from(SHARED_TREE_TABLE)
      .delete()
      .eq(SHARED_TREE_TABLE_ROWS.UUID, uuid); 

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
    } else { 
      fetchTrees(); 
      fetchSharedTrees(); 
    }

    setLoading(false); 
  }

  async function upsertShareeTreeExt(record) { 
    setLoading(true); 
    const EDITABLE_FIELDS = ['uuid', 'sharee_email', 'shared_tree_row_uuid', 'is_email_subscribed'];
    const editableFieldsSet = new Set(EDITABLE_FIELDS);  
    
    const payload = Object.keys(record).reduce((acc, field) => { 
      if (editableFieldsSet.has(field)) { 
        return { 
          ...acc,
          [field]: record[field], 
        }; 
      }
      return acc; 
    }, {
      sharee_email: user?.email, 
      uuid: record.sharee_tree_ext_row_uuid, 
    }); 

    const { error } = await supabase
      .from(SHAREE_TREE_EXT_TABLE)
      .upsert(payload)
      .eq(SHAREE_TREE_EXT_TABLE_ROWS.SHARED_TREE_ROW_UUID, record.shared_tree_row_uuid); 
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE)
      setLoading(false); 
    } else { 
      fetchSharedTrees();
    }
  }

  return {
    // crud  
    fetchSharedTrees,
    createSharedTree,
    deleteSharedTree,
    upsertShareeTreeExt,

    // data 
    data,
    totalCount, 
    loading,
    setCurrentPage,
  }; 
}