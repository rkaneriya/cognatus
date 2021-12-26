import moment from 'moment'; 
import { useEffect, useState } from 'react';
import { Card, Button, Avatar, Tooltip, Popconfirm, Divider as AntDivider } from 'antd';
import { useStyletron, styled, autoComposeDeep } from 'styletron-react';
import { EditOutlined, ApartmentOutlined, DeleteOutlined } from '@ant-design/icons';
import {pluralize} from '../utils/pluralize'; 
import { NEW_MEMBER_DRAWER_CONFIGS } from './new-member-drawer';

const DATE_FORMAT = 'll'; 

function Name({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      fontWeight: '600', 
      textTransform: 'uppercase',
      fontSize: '16px',   
      width: '100%', 
      overflowWrap: 'break-word', 
    })}>
      {children}
    </div>
  ); 
}

function Divider() { 
  return (
    <AntDivider style={{ margin: '16px 0px' }} /> 
  ); 
}

function SectionRow({label, children}) {
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex', 
      flexDirection: 'row',   
      width: '100%', 
    })}>
      <div className={css({
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginRight: '20px', 
        fontWeight: '600',
        width: '75px',  
      })}>
        {label}
      </div>
      <div className={css({
        display: 'flex', 
        flexDirection: 'column',
        width: '60%', 
      })}>
        {children}
      </div>
    </div>
  )
}

function SectionRowValue({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      overflowWrap: 'break-word',
    })}>
      {children}
    </div>
  ); 
}

function HeaderSection({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({display: 'flex', alignItems: 'center'})}>
      {children}
    </div>
  ); 
}

function BodySection({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex',
      alignItems: 'flex-start', 
      flexDirection: 'column',    
      width: '100%',          
    })}>
      {children}
    </div>
  ); 
}

function DeleteButton({onClick}) { 
  return (
    <Tooltip placement='bottom' title='Delete'>
      <Popconfirm title="Are you sure?" okText="Yes" onConfirm={onClick}>
        <DeleteOutlined key="delete" />
      </Popconfirm>  
    </Tooltip>
  ); 
}

function EditButton({onClick}) { 
  return (
    <Tooltip placement='bottom' title='Edit'>  
      <EditOutlined key="edit" onClick={onClick} />
    </Tooltip>
  ); 
}

function QueryRelationButton({name}) { 
  return (
    <Tooltip placement='bottom' title={`Discover how others are related to ${name}`}>  
      <ApartmentOutlined key="query_relation" />
    </Tooltip>
  ); 
}

export default function MemberCard({
  onAdd, 
  onEdit, 
  onDelete, 
  member, 
  relations, 
  loading,
}) {
  const [css] = useStyletron(); 
  const {
    first_name,
    last_name,
    maiden_name,  
    nickname,
    email, 
    is_male,
    birth_date,
    death_date, 
    notes, 
  } = member; 

  const mBirthDate = moment(birth_date); 
  const mDeathDate = moment(death_date); 
  const formattedBirthDate = mBirthDate.format(DATE_FORMAT);
  const formattedDeathDate = mDeathDate.format(DATE_FORMAT); 
  const age = death_date
    ? mDeathDate.diff(mBirthDate, 'years')
    : moment().diff(mBirthDate, 'years'); 
  const deadYears = moment().diff(mDeathDate, 'years'); 
  const displayName = `${first_name} ${last_name}` + (maiden_name ? `(${maiden_name})` : ''); 
  return (
    <Card
      style={{ 
        zIndex: 1, 
        position: 'absolute', 
        top: 100, 
        margin: '20px', 
        backgroundColor: 'white',     
        width: '300px',
        boxShadow: '-1px 2px 5px 2px rgba(0, 0, 0, 0.2)',
      }}
      actions={[
        <QueryRelationButton key='query_relation' name={first_name} />,
        <EditButton key='edit' onClick={onEdit} />,
        <DeleteButton key='add_relation' onClick={onDelete} />,
      ]}
      loading={loading}
    > 
      <div>
        <HeaderSection>
          <Avatar src={is_male ? '/male.jpg' : '/female.jpg'} size={50} />
          <div className={css({
            marginLeft: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            width: '75%', 
          })}>
            <Name>{displayName}</Name>
            {nickname && <div className={css({fontStyle: 'italic'})}>&quot;{nickname}&quot;</div>}
          </div>
        </HeaderSection>
        <Divider /> 
        <BodySection>
          {birth_date && <SectionRow label='BORN'>{formattedBirthDate} ({pluralize(age, 'year')})</SectionRow>}
          {death_date && <SectionRow label='DIED'>{formattedDeathDate} ({pluralize(deadYears, 'year')})</SectionRow>}
        </BodySection>
        <Divider /> 
        <BodySection>
          <SectionRow label='PARENTS'>
            <SectionRowValue>Harry Kaneriya</SectionRowValue>
            <SectionRowValue><Button onClick={() => onAdd(NEW_MEMBER_DRAWER_CONFIGS.ADD_PARENT)}>Add parent</Button></SectionRowValue>
          </SectionRow>
          <SectionRow label='SPOUSES'>
            <SectionRowValue>Saoirse Ronan</SectionRowValue>
            <SectionRowValue><Button onClick={() => onAdd(NEW_MEMBER_DRAWER_CONFIGS.ADD_SPOUSE)}>Add spouse</Button></SectionRowValue>
          </SectionRow>
          <SectionRow label='CHILDREN'>
              <SectionRowValue>Albert Einstein</SectionRowValue>
              <SectionRowValue>Richard Nixon</SectionRowValue>
              <SectionRowValue>Ane Eas</SectionRowValue>
              <SectionRowValue><Button onClick={() => onAdd(NEW_MEMBER_DRAWER_CONFIGS.ADD_CHILD)}>Add child</Button></SectionRowValue>
          </SectionRow>
        </BodySection>
        <Divider /> 
        <BodySection>
          <div className={css({
            fontStyle: 'italic',
            maxHeight: '100px', 
            overflow: 'auto', 
          })}>
            {notes}
          </div>
        </BodySection>
      </div>
    </Card>
  )     
}
