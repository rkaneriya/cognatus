import { useEffect, useState } from 'react';
import {useStyletron} from 'styletron-react'; 
import {useRouter} from 'next/router'
import MemberDrawer from '../../components/member-drawer'; 
import MemberCard from '../../components/member-card';
import Graph from '../../components/graph'; 
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import useMemberRelationAPI from '../../api/member-relation';
import { MEMBER_RELATION_ACTIONS } from '../../constants/member-relation-actions';
import RelationDrawer from '../../components/relation-drawer';
import { Button, Result } from 'antd';
import { ROUTES } from '../../constants/routes';

const { 
  ADD_FIRST_MEMBER,
  EDIT_MEMBER,
} = MEMBER_RELATION_ACTIONS; 

const DEFAULT_MEMBER_FORM_VALUES = {
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
  
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [initialMemberEditorValues, setInitialMemberEditorValues] = useState(DEFAULT_MEMBER_FORM_VALUES); 
  const [memberDrawerConfig, setMemberDrawerConfig] = useState(ADD_FIRST_MEMBER);  
  
  const [isRelationDrawerOpen, setIsRelationDrawerOpen] = useState(false);
  const [initialRelationEditorValues, setInitialRelationEditorValues] = useState({}); 
  
  const [selectedMemberUuid, setSelectedMemberUuid] = useState(null);

  const treeUuid = router?.query?.uuid; 
  const {
    fetchMembersAndRelations, 
    createMemberAndRelation,
    deleteMemberAndRelations,

    createRelation, 
    deleteRelation, 
    updateRelation, 

    createMember,
    updateMember,

    isTreeEditable, 
    members,
    relations, 
    loading,
  } = useMemberRelationAPI(treeUuid, selectedMemberUuid); 

  useEffect(() => {
    fetchMembersAndRelations(); 
  }, [fetchMembersAndRelations])

  function handleAddNewMemberAndRelation(config, initialDrawerValues) {
    setMemberDrawerConfig(config);  
    setInitialMemberEditorValues(initialDrawerValues ? initialDrawerValues : DEFAULT_MEMBER_FORM_VALUES); 
    setIsMemberDrawerOpen(true); 
  }

  function handleEditMember(member) {
    const initialValues = { 
      ...member, 
      is_male: String(member.is_male), 
      birth_date: member.birth_date ? moment(member.birth_date) : undefined, // birth_date should always be defined
      death_date: member.death_date ? moment(member.death_date) : undefined, 
    }
    setInitialMemberEditorValues(initialValues);  
    setMemberDrawerConfig(EDIT_MEMBER);  
    setIsMemberDrawerOpen(true);  
  }
  
  function handleDeleteMemberAndRelations(member) { 
    deleteMemberAndRelations(member.uuid); 
  }

  function handleEditRelation(relation) { 
    const initialValues = { 
      uuid: relation.uuid, 
      start_date: relation.start_date ? moment(relation.start_date) : undefined, 
      end_date: relation.end_date ? moment(relation.end_date) : undefined, 
    }; 
    setInitialRelationEditorValues(initialValues); 
    setIsRelationDrawerOpen(true); 
  }

  const membersByUuid = members.reduce((acc, member) => ({
    ...acc, 
    [member.uuid]: member, 
  }), {});
  
  const selectedMember = membersByUuid[selectedMemberUuid];
  const selectedMemberName = selectedMember?.first_name;  

  const isTreeEmpty = !loading && members.length === 0; 

  let handleMemberDrawerFinish = createMemberAndRelation; 
  if (memberDrawerConfig === EDIT_MEMBER) { 
    handleMemberDrawerFinish = updateMember; 
  } else if (memberDrawerConfig === ADD_FIRST_MEMBER) { 
    handleMemberDrawerFinish = createMember; 
  }

  if (!loading && isTreeEditable === null) { 
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this tree."
        extra={<Button type='primary' onClick={() => router.push(ROUTES.ADMIN)}>Back to trees</Button>}
      />
    );
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
      <MemberDrawer
        selectedMemberName={selectedMemberName}
        drawerConfig={memberDrawerConfig}
        initialValues={initialMemberEditorValues}
        onClose={() => setIsMemberDrawerOpen(false)}
        onFinish={handleMemberDrawerFinish}
        visible={isMemberDrawerOpen || (isTreeEmpty && isTreeEditable)}
       /> 
      <RelationDrawer

        initialValues={initialRelationEditorValues}
        onClose={() => setIsRelationDrawerOpen(false)}
        onFinish={updateRelation}
        visible={isRelationDrawerOpen}
       /> 
      { 
        selectedMember && (
          <MemberCard 
            selectedMember={selectedMember} 
            members={members}
            relations={relations}
            loading={loading} 
            isTreeEditable={isTreeEditable}
            onAddNewMemberAndRelation={handleAddNewMemberAndRelation}
            onAddRelation={createRelation}
            onEditMember={() => handleEditMember(selectedMember)} 
            onDeleteMemberAndRelations={() => handleDeleteMemberAndRelations(selectedMember)}
            onDeleteRelation={deleteRelation}
            onEditRelation={handleEditRelation}
            setSelectedMemberUuid={setSelectedMemberUuid}
          />
        )
      }
    </Wrapper>
  ); 
}