import { useEffect, useState } from 'react';
import {useStyletron} from 'styletron-react'; 
import {useRouter} from 'next/router'
import NewMemberDrawer from '../../components/new-member-drawer'; 
import MemberCard from '../../components/member-card';
import Graph from '../../components/graph'; 
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import useMemberRelationAPI from '../../api/member-relation';
import { MEMBER_RELATION_ACTIONS } from '../../constants/member-relation-actions';

const { 
  ADD_FIRST_MEMBER,
  EDIT_MEMBER,
} = MEMBER_RELATION_ACTIONS; 

const DEFAULT_FORM_VALUES = {
  is_male: 'false', 
}; 

function Wrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      height: '100vh',
      backgroundColor: '#eee', 
    })}>
      {children}
    </div>
  ); 
}

export default function Tree() {
  const router = useRouter(); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerConfig, setDrawerConfig] = useState(ADD_FIRST_MEMBER);  
  const [initialEditorValues, setInitialEditorValues] = useState(DEFAULT_FORM_VALUES); 
  const [selectedMemberUuid, setSelectedMemberUuid] = useState(null);

  const treeUuid = router?.query?.uuid; 
  const {
    fetchMembersAndRelations, 
    createMemberAndRelation,
    deleteMemberAndRelations,

    createRelation, 
    deleteRelation, 

    createMember,
    updateMember,

    members,
    relations, 
    loading,
  } = useMemberRelationAPI(treeUuid, selectedMemberUuid); 

  useEffect(() => {
    fetchMembersAndRelations(); 
  }, [fetchMembersAndRelations])

  function handleAddNewMemberAndRelation(config, initialDrawerValues) {
    setDrawerConfig(config);  
    setInitialEditorValues(initialDrawerValues ? initialDrawerValues : DEFAULT_FORM_VALUES); 
    setIsDrawerOpen(true); 
  }

  function handleEditMember(member) {
    const initialValues = { 
      ...member, 
      is_male: String(member.is_male), 
      birth_date: member.birth_date ? moment(member.birth_date) : undefined, // birth_date should always be defined
      death_date: member.death_date ? moment(member.death_date) : undefined, 
    }
    setInitialEditorValues(initialValues);  
    setDrawerConfig(EDIT_MEMBER);  
    setIsDrawerOpen(true);  
  }
  
  function handleDeleteMemberAndRelations(member) { 
    deleteMemberAndRelations(member.uuid); 
  }

  const membersByUuid = members.reduce((acc, member) => ({
    ...acc, 
    [member.uuid]: member, 
  }), {});
  
  const selectedMember = membersByUuid[selectedMemberUuid];
  const selectedMemberName = selectedMember?.first_name;  

  const isTreeEmpty = !loading && members.length === 0; 

  let handleDrawerFinish = createMemberAndRelation; 
  if (drawerConfig === EDIT_MEMBER) { 
    handleDrawerFinish = updateMember; 
  } else if (drawerConfig === ADD_FIRST_MEMBER) { 
    handleDrawerFinish = createMember; 
  }

  return (
    <Wrapper>
      <Graph
        key={uuidv4()}
        members={members}
        relations={relations}
        selectedMemberUuid={selectedMemberUuid} 
        sourceMemberUuid={null}
        targetMemberUuid={null}
        pathNodes={[]}
        pathEdges={[]}
        setSelectedMemberUuid={setSelectedMemberUuid}
      />       
      <NewMemberDrawer
        selectedMemberName={selectedMemberName}
        drawerConfig={drawerConfig}
        initialValues={initialEditorValues}
        onClose={() => setIsDrawerOpen(false)}
        onFinish={handleDrawerFinish}
        visible={isDrawerOpen || isTreeEmpty}
       /> 
      { 
        selectedMember && (
          <MemberCard 
            selectedMember={selectedMember} 
            members={members}
            relations={relations}
            loading={loading} 
            onAddNewMemberAndRelation={handleAddNewMemberAndRelation}
            onAddRelation={createRelation}
            onEditMember={() => handleEditMember(selectedMember)} 
            onDeleteMemberAndRelations={() => handleDeleteMemberAndRelations(selectedMember)}
            onDeleteRelation={deleteRelation}
            setSelectedMemberUuid={setSelectedMemberUuid}
          />
        )
      }
    </Wrapper>
  ); 
}