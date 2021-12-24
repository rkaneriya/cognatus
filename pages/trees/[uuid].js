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
    deleteMember,

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
      birth_date: member.birth_date ? moment(member.birth_date) : undefined, // birth_date should always be defined
      death_date: member.death_date ? moment(member.death_date) : undefined, 
    }
    setInitialEditorValues(initialValues);  
    setIsDrawerOpen(true);   
    setSelectedMemberUuid(member.uuid); 
  }
  
  function handleDelete(member) { 
    deleteMember(member.uuid); 
  }

  return (
    <Wrapper>
      <NavBar backRoute={ROUTES.ADMIN} /> 
      <NewMemberDrawer
        initialValues={selectedMemberUuid ? initialEditorValues : DEFAULT_FORM_VALUES}
        onClose={() => setIsDrawerOpen(false)}
        onFinish={selectedMemberUuid ? updateMember : createMember}
        submitLabel={selectedMemberUuid ? 'Update' : 'Add'}
        title={selectedMemberUuid ? "Edit member" : "Add member"}
        visible={isDrawerOpen}
       /> 
      { 
        data[0] && (
          <MemberCard 
            member={data[0]} 
            loading={loading} 
            onEdit={() => handleEdit(data[0])} 
            onDelete={() => handleDelete(data[0])}
          />
        )
      }
      <Button onClick={handleAdd}>Add new person</Button>
    </Wrapper>
  ); 
}