import { useContext, useState } from 'react';
import {useStyletron} from 'styletron-react'; 
import MemberDrawer from './member-drawer'; 
import MemberCard from './member-card';
import Graph from './graph'; 
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import { MEMBER_RELATION_ACTIONS } from '../constants/member-relation-actions';
import RelationDrawer from './relation-drawer';
import { Button, Spin, Result } from 'antd';
import { ROUTES } from '../constants/routes';
import { MemberRelationContext } from '../data/contexts/member-relation';
import { useRouter } from 'next/router';
import { DemoModal } from './demo-modal';

const DEMO_ROUTES = [ 
  ROUTES.DEMO_VANDERBILTS,
  ROUTES.DEMO_BRITISH_ROYALS,
]; 

const { 
  ADD_FIRST_MEMBER,
  EDIT_MEMBER,
} = MEMBER_RELATION_ACTIONS; 

const DEFAULT_MEMBER_FORM_VALUES = {
  is_male: 'false', 
  use_year_only: 'false', 
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
  const [css] = useStyletron(); 

  const isDemo = DEMO_ROUTES.includes(router?.asPath);
  const [isDemoModalVisible, setIsDemoModalVisible] = useState(isDemo); 

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
      is_male: String(Boolean(selectedMember.is_male)), 
      use_year_only: String(Boolean(selectedMember.use_year_only)), 
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

  // First load (to avoid flicker)
  if (loading && members.length === 0) { 
    return (
      <div className={css({
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100vw', 
        height: '100vh', 
      })}>
        <Spin size='large' />
      </div>
    ); 
  }

  // Unauthorized 
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
      <DemoModal visible={isDemoModalVisible} onCancel={() => setIsDemoModalVisible(false)} />
    </Wrapper>
  ); 
}