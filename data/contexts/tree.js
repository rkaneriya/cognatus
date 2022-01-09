import { createContext, useContext, useEffect } from "react"; 
import useTreeAPI, {PAGE_SIZE as TREE_PAGE_SIZE} from "../hooks/tree";
import useSharedTreeAPI, {PAGE_SIZE as SHARED_TREE_PAGE_SIZE} from "../hooks/shared-tree";
import { UserContext } from "./user";

export const TreeContext = createContext(); 

export function TreeContextProvider({children}) { 
  const {user} = useContext(UserContext);  

  const { 
    // crud
    fetchTrees,
    createTree,
    updateTree,
    deleteTree,

    // data 
    data: treeData,
    totalCount: treeCount, 
    loading: treeLoading, 
    setCurrentPage: treeSetCurrentPage, 
  } = useTreeAPI(); 

  const {
    fetchSharedTrees,
    createSharedTree,
    deleteSharedTree,
    
    data: sharedTreeData, 
    totalCount: sharedTreeCount, 
    loading: sharedTreeLoading,
    setCurrentPage: sharedTreeSetCurrentPage, 
  } = useSharedTreeAPI(fetchTrees); 

  useEffect(() => { 
    fetchTrees();
    fetchSharedTrees();  
  }, [fetchTrees, fetchSharedTrees, user]); 

  const value = { 
    // trees
    fetchTrees,
    createTree,
    updateTree,
    deleteTree,

    treeData,
    treeCount, 
    treeLoading,
    treeSetCurrentPage,
    TREE_PAGE_SIZE,

    // shared trees
    fetchSharedTrees,
    createSharedTree,
    deleteSharedTree,
    SHARED_TREE_PAGE_SIZE,
    
    sharedTreeData, 
    sharedTreeCount, 
    sharedTreeLoading,
    sharedTreeSetCurrentPage, 
  }; 

  return (
    <TreeContext.Provider value={value}>
      {children}
    </TreeContext.Provider>
  )
}