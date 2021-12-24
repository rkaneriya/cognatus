import moment from 'moment'; 
import { useEffect, useState } from 'react';
import { Card, Avatar, Tooltip, Row, Col, Divider } from 'antd';
import { useStyletron, styled, autoComposeDeep } from 'styletron-react';
import { EditOutlined, ApartmentOutlined, DeleteOutlined } from '@ant-design/icons';
import {pluralize} from '../utils/pluralize'; 

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
    <Tooltip placement='bottom' title='Delete this member'>  
      <DeleteOutlined key="delete" onClick={onClick} />
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

export default function MemberCard({onEdit, onDelete, member, loading}) {
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
        float: 'left', 
        width: '350px',
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
          <SectionRow label='SIBLINGS'>
              <SectionRowValue>Albert Einstein</SectionRowValue>
              <SectionRowValue>Richard Nixon</SectionRowValue>
              <SectionRowValue>Janereallyreallylongname Eyrereallyreallylongname</SectionRowValue>
          </SectionRow>
          <SectionRow label='PARENTS'>
            <SectionRowValue>Harry Kaneriya</SectionRowValue>
          </SectionRow>
          <SectionRow label='SPOUSES'>
            <SectionRowValue>Saoirse Ronan</SectionRowValue>
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
