import { useCallback, useEffect, useState } from 'react';
import {useStyletron} from 'styletron-react'; 
import {useRouter} from 'next/router'
import {message, Button} from 'antd'; 
import NavBar from '../../components/nav-bar'; 
import NewMemberDrawer from '../../components/new-member-drawer'; 
import { supabase } from '../../utils/supabase';
import MemberCard from '../../components/member-card';
import { ROUTES } from '../../constants/routes';

function Wrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      padding: '50px', 
    })}>
      {children}
    </div>
  ); 
}

export default function Tree() {
  const router = useRouter(); 
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [totalCount, setTotalCount] = useState(0); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 

  const {uuid: treeUuid} = router?.query; 
  console.log("@@@ LOADING", treeUuid, router); 
  
  const fetchMembers = useCallback(async () => { 
    if (!treeUuid) {
      return;
    }

    setLoading(true); 

    const { data: members, count, error } = await supabase
      .from("member")
      .select("*", { count: "exact" })
      .eq('tree_uuid', treeUuid) 
      .order("created_at", { ascending: true }); 
      
    if (error) {
      message.error(error?.message || 'Error');
    } else {
      const transformed = members.map((m) => ({
        key: m.uuid, 
        ...m, 
      }))
      setData(transformed); 
      setTotalCount(count); 
    } 
    setLoading(false);  
  }, [treeUuid]); 

  async function createMember(member) { 
    const user = supabase.auth.user(); 
    const transformedMember = { 
      ...member, 
      birth_date: member.birth_date.format(), 
      tree_uuid: treeUuid, 
    }; 
    setLoading(true); 
    const { error } = await supabase
      .from('member')
      .insert([transformedMember]); 
    if (error) {
      message.error(error?.message || 'Error')
    } else { 
      setIsDrawerOpen(false); 
      fetchMembers(); 
    }
    setLoading(false);   
  }

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return (
    <Wrapper>
      <NavBar backRoute={ROUTES.ADMIN} /> 
      <Button onClick={() => setIsDrawerOpen(true)}>Add new person</Button>
      <NewMemberDrawer
        onClose={() => setIsDrawerOpen(false)}
        onFinish={createMember}
        title={"Add parent"}
        visible={isDrawerOpen}
       /> 
      {data.map((member, i) => (
        <MemberCard key={i} {...member} loading={loading} />
      ))}
    </Wrapper>
  ); 
}