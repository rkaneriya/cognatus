import moment from 'moment'; 
import { useEffect, useState } from 'react';
import { Card, Avatar, Typography } from 'antd';
import { useStyletron, styled } from 'styletron-react';
import { EditOutlined, ApartmentOutlined, UsergroupAddOutlined } from '@ant-design/icons';

const DATE_FORMAT = 'MMM D YYYY'; 

function Name({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      fontWeight: '600', 
      textTransform: 'uppercase',
      fontSize: '16px',    
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

  const displayName = `${first_name} ${last_name}` + (maiden_name ? `(${maiden_name})` : ''); 
  return (
    <Card
      style={{ float: 'right', width: '300px' }}
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
          })}>
            <Name>{first_name} {last_name}</Name>
            {nickname && <div className={css({fontStyle: 'italic'})}>&quot;{nickname}&quot;</div>}
          </div>
        </div>
        <>
          <Divider /> 
          <div className={css({
            display: 'flex',
            alignItems: 'flex-start', 
            flexDirection: 'column',             
          })}>
            {birth_date && <Date label='BORN'>{moment(birth_date).format('ll')}</Date>}
          </div>
        </>
      </div>
    </Card>
  )     
}
