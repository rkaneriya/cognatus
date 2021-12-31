import { useContext, useState } from 'react';
import {useStyletron} from 'styletron-react'; 
import MemberDrawer from '../components/member-drawer'; 
import MemberCard from '../components/member-card';
import Graph from '../components/graph'; 
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import { MEMBER_RELATION_ACTIONS } from '../constants/member-relation-actions';
import RelationDrawer from '../components/relation-drawer';
import { Button, Result } from 'antd';
import { ROUTES } from '../constants/routes';
import { MemberRelationContext } from '../data/contexts/member-relation';

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
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [initialMemberEditorValues, setInitialMemberEditorValues] = useState(DEFAULT_MEMBER_FORM_VALUES); 
  const [memberDrawerConfig, setMemberDrawerConfig] = useState(ADD_FIRST_MEMBER);  
  
  const [isRelationDrawerOpen, setIsRelationDrawerOpen] = useState(false);
  const [initialRelationEditorValues, setInitialRelationEditorValues] = useState({}); 

  const {
    selectedMemberUuid,
    isTreeEditable, 
    membersByUuid,
    members,
    loading,
  } = useContext(MemberRelationContext); 

  function handleAddNewMemberAndRelation(config, initialDrawerValues) {
    setMemberDrawerConfig(config);  
    setInitialMemberEditorValues(initialDrawerValues ? initialDrawerValues : DEFAULT_MEMBER_FORM_VALUES); 
    setIsMemberDrawerOpen(true); 
  }

  function handleEditMember() {
    const selectedMember = membersByUuid[selectedMemberUuid]; 
    const initialValues = { 
      ...selectedMember, 
      is_male: String(selectedMember.is_male), 
      birth_date: selectedMember.birth_date ? moment(selectedMember.birth_date) : undefined, // birth_date should always be defined
      death_date: selectedMember.death_date ? moment(selectedMember.death_date) : undefined, 
    }
    setInitialMemberEditorValues(initialValues);  
    setMemberDrawerConfig(EDIT_MEMBER);  
    setIsMemberDrawerOpen(true);  
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

  const selectedMember = membersByUuid[selectedMemberUuid];
  const isTreeEmpty = !loading && members.length === 0; 

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
          sourceMemberUuid={null}
          targetMemberUuid={null}
          pathNodes={[]}
          pathEdges={[]}
        />       
        <MemberDrawer
          drawerConfig={memberDrawerConfig}
          initialValues={initialMemberEditorValues}
          onClose={() => setIsMemberDrawerOpen(false)}
          visible={isMemberDrawerOpen || (isTreeEmpty && isTreeEditable)}
        /> 
        <RelationDrawer
          initialValues={initialRelationEditorValues}
          onClose={() => setIsRelationDrawerOpen(false)}
          visible={isRelationDrawerOpen}
        /> 
        { 
          selectedMember && (
            <MemberCard 
              onAddNewMemberAndRelation={handleAddNewMemberAndRelation}
              onEditMember={handleEditMember} 
              onEditRelation={handleEditRelation}
            />
          )
        }
      </Wrapper>
  ); 
}