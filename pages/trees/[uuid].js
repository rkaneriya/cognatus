import { MemberRelationContextProvider } from '../../data/contexts/member-relation';
import Tree from '../../components/tree'; 

export default function TreeWrapper() {
  return (
    <MemberRelationContextProvider>
      <Tree />
    </MemberRelationContextProvider>
  ); 
}