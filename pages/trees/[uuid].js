import { useEffect, useState } from 'react';
import {useStyletron} from 'styletron-react'; 
import {useRouter} from 'next/router'
import {Button} from 'antd'; 
import NavBar from '../../components/nav-bar'; 
import NewMemberDrawer from '../../components/new-member-drawer'; 
import MemberCard from '../../components/member-card';
import { ROUTES } from '../../constants/routes';
import moment from 'moment';
import useMemberAPI from '../../api/member';

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

const DEFAULT_FORM_VALUES = {
  is_male: 'false', 
}; 

export default function Tree() {
  const router = useRouter(); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  const [initialEditorValues, setInitialEditorValues] = useState({}); 
  const [selectedMemberUuid, setSelectedMemberUuid] = useState(null); // TODO: will change

  const treeUuid = router?.query?.uuid; 
  
  const {
    // crud  
    fetchMembers,
    createMember,
    updateMember,
    // deleteMember,

    // data 
    data,
    totalCount, 
    loading,
  } = useMemberAPI(treeUuid, selectedMemberUuid); 

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  function handleAdd() { 
    setSelectedMemberUuid(null); 
    setIsDrawerOpen(true); 
  }

  function handleEdit(member) {
    const initialValues = { 
      ...member, 
      is_male: String(member.is_male), 
      birth_date: moment(member.birth_date), 
    }
    setInitialEditorValues(initialValues);  
    setIsDrawerOpen(true);   
    setSelectedMemberUuid(member.uuid); 
  }

  return (
    <Wrapper>
      <NavBar backRoute={ROUTES.ADMIN} /> 
      Total: {totalCount}
      <Button onClick={handleAdd}>Add new person</Button>
      <NewMemberDrawer
        initialValues={selectedMemberUuid ? initialEditorValues : DEFAULT_FORM_VALUES}
        onClose={() => setIsDrawerOpen(false)}
        onFinish={selectedMemberUuid ? updateMember : createMember}
        title={selectedMemberUuid ? "Edit member" : "Add member"}
        visible={isDrawerOpen}
       /> 
      {data.map((member, i) => (
        <MemberCard 
          key={i} 
          member={member} 
          loading={loading} 
          onEdit={() => handleEdit(member)} 
        />
      ))}
    </Wrapper>
  ); 
}