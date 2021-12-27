import { useEffect, useState } from 'react';
import {useStyletron} from 'styletron-react'; 
import {useRouter} from 'next/router'
import {Button} from 'antd'; 
import NavBar from '../../components/nav-bar'; 
import NewMemberDrawer, {NEW_MEMBER_DRAWER_CONFIGS} from '../../components/new-member-drawer'; 
import MemberCard from '../../components/member-card';
import { ROUTES } from '../../constants/routes';
import Graph from '../../components/graph'; 
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import useMemberRelationAPI from '../../api/member-relation';

const { 
  ADD_FIRST,
  EDIT,
} = NEW_MEMBER_DRAWER_CONFIGS; 

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
  const [drawerConfig, setDrawerConfig] = useState(ADD_FIRST);  
  const [initialEditorValues, setInitialEditorValues] = useState({}); 
  const [selectedMemberUuid, setSelectedMemberUuid] = useState(null);

  const treeUuid = router?.query?.uuid; 
  const {
    fetchMembersAndRelations, 
    createMemberAndRelation,
    deleteMemberAndRelations,

    createMember,
    updateMember,

    members,
    relations, 
    loading,
  } = useMemberRelationAPI(treeUuid, selectedMemberUuid); 

  const membersByUuid = members.reduce((acc, member) => ({
    ...acc, 
    [member.uuid]: member, 
  }), {}); 

  const relationsByMemberUuid = relations.reduce((acc, relation) => {
    if (acc[relation.from_member_uuid]) { 
      acc[relation.from_member_uuid].push(relation); 
    } else {
      acc[relation.from_member_uuid] = [relation]; 
    }

    if (acc[relation.to_member_uuid]) { 
      acc[relation.to_member_uuid].push(relation); 
    } else {
      acc[relation.to_member_uuid] = [relation]; 
    }
    return acc;
  }, {}); 

  useEffect(() => {
    fetchMembersAndRelations(); 
  }, [fetchMembersAndRelations])

  function handleAdd(config) {
    setDrawerConfig(config);  
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
    setDrawerConfig(EDIT);  
    setIsDrawerOpen(true);  
  }
  
  function handleDelete(member) { 
    deleteMemberAndRelations(member.uuid); 
  }

  const selectedMember = membersByUuid[selectedMemberUuid];
  const selectedMemberName = selectedMember?.first_name;  

  const isTreeEmpty = !loading && members.length === 0; 
  const initialDrawerValues = selectedMemberUuid && drawerConfig === EDIT ? initialEditorValues : DEFAULT_FORM_VALUES; 

  let handleDrawerFinish = createMemberAndRelation; 
  if (drawerConfig === EDIT) { 
    handleDrawerFinish = updateMember; 
  } else if (drawerConfig === ADD_FIRST) { 
    handleDrawerFinish = createMember; 
  }


  const directRelations = relationsByMemberUuid[selectedMemberUuid] || []; 
  const directRelationMembers = directRelations.map((relation) => (
    relation.from_member_uuid === selectedMemberUuid 
      ? membersByUuid[relation.to_member_uuid] 
      : membersByUuid[relation.from_member_uuid]
  )); 
  const directRelationMembersByUuid = directRelationMembers.reduce((acc, member) => {
    return { 
      ...acc, 
      [member.uuid]: member, 
    }; 
  }, {}); 
  
  console.log("@@@ DATA", directRelations, directRelationMembers, directRelationMembersByUuid); 

  return (
    <Wrapper>
      <NavBar backRoute={ROUTES.ADMIN} />
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
        initialValues={initialDrawerValues}
        onClose={() => setIsDrawerOpen(false)}
        onFinish={handleDrawerFinish}
        visible={isDrawerOpen || isTreeEmpty}
       /> 
      { 
        selectedMember && (
          <MemberCard 
            member={selectedMember} 
            relations={directRelations}
            relationMembersByUuid={directRelationMembersByUuid}
            loading={loading} 
            onAdd={handleAdd}
            onEdit={() => handleEdit(selectedMember)} 
            onDelete={() => handleDelete(selectedMember)}
            setSelectedMemberUuid={setSelectedMemberUuid}
          />
        )
      }
      <Button onClick={handleAdd}>Add person</Button>
    </Wrapper>
  ); 
}