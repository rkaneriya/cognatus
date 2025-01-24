import { useEffect, useState, useCallback, useContext } from "react";
import {
  SHARED_TREE_TABLE,
  SHARED_TREE_TABLE_COLS,
} from "../entities/shared-tree";
import { TREE_TABLE, TREE_TABLE_COLS } from "../entities/tree";
import { supabase } from "../../utils/supabase";
import { UserContext } from "../contexts/user";

export default function useTreeMetadataAPI(uuid) {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);

  const fetchTree = useCallback(async () => {
    if (!uuid || !user) {
      return;
    }

    const { data: trees, error: treeError } = await supabase
      .from(TREE_TABLE)
      .select(TREE_TABLE.NAME)
      .eq(TREE_TABLE_COLS.CREATOR_UUID, user?.id)
      .eq(TREE_TABLE_COLS.UUID, uuid);

    if (treeError) {
      return;
    }

    if (trees.length > 0) {
      setData(trees);
      return;
    }

    const { data: sharedTrees, error: sharedTreeError } = await supabase
      .from(SHARED_TREE_TABLE)
      .select(SHARED_TREE_TABLE.NAME)
      .eq(SHARED_TREE_TABLE_COLS.SHAREE_EMAIL, user?.email)
      .eq(SHARED_TREE_TABLE_COLS.TREE_UUID, uuid);

    if (!sharedTreeError) {
      setData(sharedTrees);
    }
  }, [user, uuid]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return {
    // crud
    fetchTree,

    // data
    data,
  };
}
