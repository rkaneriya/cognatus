import { useCallback, useEffect, useState } from 'react';
import {useStyletron} from 'styletron-react'; 
import {useRouter} from 'next/router'
import {message, Button} from 'antd'; 
import NavBar from '../../components/nav-bar'; 
import NewMemberDrawer from '../../components/new-member-drawer'; 
import { supabase } from '../../utils/supabase';
import MemberCard from '../../components/member-card';
import { ROUTES } from '../../constants/routes';
import moment from 'moment';

function Wrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      padding: '36px', 
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
  const [initialEditorValues, setInitialEditorValues] = useState({}); 
  const [isEditMode, setIsEditMode] = useState(false); // vs "new member" mode 
  const [selectedMemberUuid, setSelectedMemberUuid] = useState(false); 

  const {uuid: treeUuid} = router?.query; 
  
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
      setLoading(false);   
    } else { 
      setIsDrawerOpen(false); 
      fetchMembers();
    }
  }

  async function updateMember(member) { 
    setLoading(true); 
    const transformedMember = { 
      ...member, 
      birth_date: member.birth_date.format(), 
      tree_uuid: treeUuid, 
    }; 

    const { error } = await supabase
      .from('member')
      .update(transformedMember)
      .eq('uuid', selectedMemberUuid); 

    if (error) {
      message.error(error?.message || 'Error')
      setLoading(false);   
    } else { 
      setIsDrawerOpen(false); 
      fetchMembers();
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])


  function handleEdit(member) {
    const initialValues = { 
      ...member, 
      is_male: String(member.is_male), 
      birth_date: moment(member.birth_date), 
    }
    setInitialEditorValues(initialValues);  
    setSelectedMemberUuid(member.uuid); 
    setIsDrawerOpen(true);   
  }

  return (
    <Wrapper>
      <NavBar backRoute={ROUTES.ADMIN} /> 
      <Button onClick={() => setIsDrawerOpen(true)}>Add new person</Button>
      <NewMemberDrawer
        initialValues={selectedMemberUuid ? initialEditorValues : { is_male: 'false' }}
        onClose={() => setIsDrawerOpen(false)}
        onFinish={selectedMemberUuid ? updateMember : createMember}
        title={selectedMemberUuid ? "Edit member" : "Add member"}
        visible={isDrawerOpen}
       /> 
      {data.map((member, i) => (
        <MemberCard key={i} member={member} loading={loading} onEdit={() => handleEdit(member)} />
      ))}
    </Wrapper>
  ); 
}