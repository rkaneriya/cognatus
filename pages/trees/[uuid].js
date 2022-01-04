import { useContext } from 'react';
import { MemberRelationContextProvider } from '../../data/contexts/member-relation';
import Tree from '../../components/tree'; 
import Head from 'next/head'; 
import { TreeContext } from '../../data/contexts/tree';
import { useRouter } from 'next/router';

export default function TreeWrapper() {
  const { 
    treeData,
    sharedTreeData,  
  } = useContext(TreeContext); 
  const router = useRouter(); 
  const treeUuid = router?.query?.uuid; 
  const tree = treeData.find(d => d.uuid === treeUuid) || sharedTreeData.find(d => d.uuid === treeUuid); 
  const name = tree?.name || 'Demo' 

  return (
    <MemberRelationContextProvider>
      <Head>
        <title>Cognatus | {name}</title>
      </Head>
      <Tree />
    </MemberRelationContextProvider>
  ); 
}