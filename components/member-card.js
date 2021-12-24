import moment from 'moment'; 
import { useEffect, useState } from 'react';
import { Card, Avatar, Typography } from 'antd';
import { useStyletron, styled, autoComposeDeep } from 'styletron-react';
import { EditOutlined, ApartmentOutlined, UsergroupAddOutlined } from '@ant-design/icons';

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

function Divider({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      border: '0.5px solid lightgray', 
      margin: '20px 0px', 
      width: '100%', 
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
    })}>
      <div className={css({
        marginRight: '10px', 
        fontWeight: '600', 
      })}>
        {label}
      </div>
      {children}
    </div>
  )
}

function DateWrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex',
      alignItems: 'flex-start', 
      flexDirection: 'column',             
    })}>
      {children}
    </div>
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
        <UsergroupAddOutlined key="add_relation" />,
        <EditOutlined key="edit" onClick={onEdit} />,
        <ApartmentOutlined key="search_relation" />,
      ]}
      loading={loading}
    > 
      <div>
        <div className={css({display: 'flex', alignItems: 'center'})}>
          <Avatar src={is_male ? '/male.jpg' : '/female.jpg'} size={50} />
          <div className={css({
            marginLeft: '10px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            width: '75%', 
          })}>
            <Name>{first_name} {last_name}</Name>
            {nickname && <div className={css({fontStyle: 'italic'})}>&quot;{nickname}&quot;</div>}
          </div>
        </div>
        <Divider /> 
        <DateWrapper>
          {birth_date && <Date label='BORN'>{formattedBirthDate} ({age} years)</Date>}
          {death_date && <Date lable='DIED'>{formattedDeathDate} ({deadYears} years) </Date>}
        </DateWrapper>
      </div>
    </Card>
  )     
}
