import {Alert} from 'antd'; 
// import {useContext} from 'react'; 
import { useStyletron } from 'styletron-react';
// import {MemberRelationContext} from '../data/contexts/member-relation'; 

export default function StatsTab() { 
  const [css] = useStyletron(); 
  // const {
  //   members, 
  // } = useContext(MemberRelationContext); 

  return (
    <Alert
      description="Coming soon..."
      type="warning"
      showIcon
    />
  ); 
}