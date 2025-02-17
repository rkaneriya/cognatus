import { useState, useCallback, useContext } from "react";
import { message } from "antd";
import { TREE_TABLE, TREE_TABLE_COLS } from "../entities/tree";
import { supabase } from "../../utils/supabase";
import {
  SHARED_TREE_TABLE,
  SHARED_TREE_TABLE_COLS,
} from "../entities/shared-tree";
import { UserContext } from "../contexts/user";

export const PAGE_SIZE = 5;

const GENERIC_ERROR_MESSAGE = "Failed to operate on trees";

export default function useTreeAPI() {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTrees = useCallback(async () => {
    setLoading(true);

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE - 1;

    if (!user) {
      setLoading(false);
      return;
    }

    const {
      data: trees,
      count,
      error: treeError,
    } = await supabase
      .from(TREE_TABLE)
      .select("*", { count: "exact" })
      .eq(TREE_TABLE_COLS.CREATOR_UUID, user?.id)
      .order(TREE_TABLE_COLS.CREATED_AT, { ascending: false })
      .range(start, end);

    if (treeError) {
      message.error(treeError?.message || GENERIC_ERROR_MESSAGE);
      setLoading(false);
      return;
    }

    const treeUuids = trees.map((t) => t.uuid);

    const { data: sharedTrees, error: sharedTreeError } = await supabase
      .from(SHARED_TREE_TABLE)
      .select("*")
      .eq(SHARED_TREE_TABLE_COLS.SHARER_EMAIL, user.email)
      .in(SHARED_TREE_TABLE_COLS.TREE_UUID, treeUuids);

    const sharedTreesByTreeUuid = sharedTrees.reduce((acc, s) => {
      const obj = {
        sharee_email: s.sharee_email,
        is_editable: s.is_editable,
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
      }));
      setData(keyedData);
      setTotalCount(count);
    }

    setLoading(false);
  }, [currentPage, user]);

  async function createTree(tree) {
    setLoading(true);

    const payload = {
      ...tree,
      [TREE_TABLE_COLS.CREATOR_UUID]: user?.id,
    };

    const { error } = await supabase.from(TREE_TABLE).insert([payload]);

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
      setLoading(false);
    } else {
      fetchTrees();
    }
  }

  async function updateTree(tree) {
    setLoading(true);
    const EDITABLE_FIELDS = [
      TREE_TABLE_COLS.NAME,
      TREE_TABLE_COLS.DESCRIPTION,
      TREE_TABLE_COLS.IS_PUBLIC,
      TREE_TABLE_COLS.IS_EMAIL_SUBSCRIBED,
    ];

    const editableFieldsSet = new Set(EDITABLE_FIELDS);

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
      .eq(TREE_TABLE_COLS.UUID, tree.uuid);
    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
      setLoading(false);
    } else {
      fetchTrees();
    }
  }

  async function deleteTree(uuid) {
    setLoading(true);

    // note: due to "on cascade", deleting a tree will delete all rows referencing the tree
    // (related members, relations, and shared_trees will be automatically deleted)
    const { error } = await supabase
      .from(TREE_TABLE)
      .delete()
      .eq(TREE_TABLE_COLS.UUID, uuid);

    if (error) {
      message.error(error?.message || GENERIC_ERROR_MESSAGE);
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
    deleteTree,

    // data
    data,
    totalCount,
    loading,
    setCurrentPage,
  };
}
