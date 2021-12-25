import { useEffect, useState } from 'react';
import {useStyletron} from 'styletron-react'; 
import {useRouter} from 'next/router'
import {Button} from 'antd'; 
import NavBar from '../../components/nav-bar'; 
import NewMemberDrawer from '../../components/new-member-drawer'; 
import MemberCard from '../../components/member-card';
import { ROUTES } from '../../constants/routes';
import Graph from '../../components/graph'; 
import moment from 'moment';
import useMemberAPI from '../../api/member';
import {v4 as uuidv4} from 'uuid'; 
import create from '@ant-design/icons/lib/components/IconFont';

function Wrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      padding: '36px', 
      height: '100vh',
      backgroundColor: '#eee', 
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
  const [isEditMode, setIsEditMode] = useState(false); 

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

  const membersByUuid = data.reduce((acc, val) => ({
    ...acc, 
    [val.uuid]: val, 
  }), {}); 

  useEffect(() => {
    fetchMembers(); 
  }, [fetchMembers])

  function handleAdd() { 
    setIsEditMode(false); 
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
    setIsEditMode(true); 
  }
  
  function handleDelete(member) { 
    deleteMember(member.uuid); 
  }

  const selectedMember = membersByUuid[selectedMemberUuid];
  const selectedMemberName = selectedMember?.first_name;  

  const isTreeEmpty = !loading && data.length === 0; 
  const initialDrawerValues = selectedMemberUuid && isEditMode ? initialEditorValues : DEFAULT_FORM_VALUES; 
  const onFinish = isTreeEmpty 
  ? createMember 
  : (isEditMode ? updateMember : createMember); 
  const submitLabel = isEditMode ? 'Update' : 'Add'; 
  const title = isTreeEmpty 
  ? 'Add first person to tree'
  : (isEditMode ? `Edit ${selectedMemberName}'s profile` : `Add new relative of ${selectedMemberName}`); 
  
  console.log("@@@", isTreeEmpty, isEditMode); 
  return (
    <Wrapper>
      <NavBar backRoute={ROUTES.ADMIN} />
      <Graph
        key={uuidv4()}
        members={data}
        relations={[]}
        selectedMemberUuid={selectedMemberUuid} 
        sourceMemberUuid={null}
        targetMemberUuid={null}
        pathNodes={[]}
        pathEdges={[]}
        setSelectedMemberUuid={setSelectedMemberUuid}
      />       
      <NewMemberDrawer
        initialValues={initialDrawerValues}
        onClose={() => setIsDrawerOpen(false)}
        onFinish={onFinish}
        submitLabel={submitLabel}
        title={title}
        visible={isDrawerOpen || isTreeEmpty}
       /> 
      { 
        selectedMember && (
          <MemberCard 
            member={selectedMember} 
            loading={loading} 
            onEdit={() => handleEdit(selectedMember)} 
            onDelete={() => handleDelete(selectedMember)}
          />
        )
      }
    </Wrapper>
  ); 
}