import moment from 'moment'; 
import { useEffect, useState } from 'react';
import { Card, Avatar, Tooltip, Row, Col, Divider } from 'antd';
import { useStyletron, styled, autoComposeDeep } from 'styletron-react';
import { EditOutlined, ApartmentOutlined, UsergroupAddOutlined } from '@ant-design/icons';
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

function Date({label, children}) {
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
        width: '60%', 
      })}>
        {children}
      </div>
    </div>
  )
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

function AddRelationButton() { 
  return (
    <Tooltip placement='bottom' title='Add a new relation'>  
      <UsergroupAddOutlined key="add_relation" />
    </Tooltip>
  ); 
}

function EditButton(props) { 
  return (
    <Tooltip placement='bottom' title='Edit'>  
      <EditOutlined key="edit" {...props} />
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

export default function MemberCard({onEdit, member, loading}) {
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
        width: '300px',
        boxShadow: '-1px 2px 5px 2px rgba(0, 0, 0, 0.2)',
      }}
      actions={[
        <AddRelationButton key='add_relation' />,
        <EditButton key='edit' onClick={onEdit} />,
        <QueryRelationButton key='query_relation' name={first_name} />,
      ]}
      loading={loading}
    > 
      <div>
        <HeaderSection>
          <Avatar src={is_male ? '/male.jpg' : '/female.jpg'} size={50} />
          <div className={css({
            marginLeft: '10px', 
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
          {birth_date && <Date label='BORN'>{formattedBirthDate} ({pluralize(age, 'year')})</Date>}
          {death_date && <Date label='DIED'>{formattedDeathDate} ({pluralize(deadYears, 'year')})</Date>}
        </BodySection>
        <Divider /> 
        <BodySection>
          <Date label='SIBLINGS'>
            <div className={css({display: 'flex', flexDirection: 'column'})}>
              <div className={css({overflowWrap: 'break-word'})}>
                Shriyalonglonglongnamelonglongname Kaneriya
              </div>
              <span>Martha Kaneriya</span>
              <span>Jane Kaneriya</span>
            </div>
          </Date>
          <Date label='PARENTS'>Shriya Kaneiya</Date>
          <Date label='SPOUSES'>Shriya Kaneiya</Date>
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
