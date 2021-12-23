import { useEffect } from 'react';
import { Card, Avatar, Typography } from 'antd';
import { useStyletron, styled } from 'styletron-react';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

const DATE_FORMAT = 'MMM D YYYY'; 

const Header = styled('div', { 
  display: 'flex',
  alignItems: 'center', 
}); 

const Footer = styled('div', { 
  display: 'flex',
  alignItems: 'flex-start', 
  flexDirection: 'column', 
}); 

const HeaderInfo = styled('div', { 
  marginLeft: '10px', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'flex-start', 
}); 

const Name = styled('div', { 
  fontWeight: '600', 
  textTransform: 'uppercase',
  fontSize: '16px',
});

const Nickname = styled('div', { 
  fontStyle: 'italic', 
}); 

const Divider = styled('div', { 
  border: '0.5px solid lightgray', 
  margin: '10px 0px', 
  width: '100%', 
}); 

const DateHeader = styled('div', { 
  marginRight: '10px',
  fontWeight: '600', 
});

const Date = styled(
  ({className, header, children}) => (
    <div className={className}>
      <DateHeader>{header}</DateHeader>
      {children}
    </div>
  ), 
  {
    display: 'flex', 
    flexDirection: 'row', 
  }
); 

export default function MemberCard(props) {
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
    loading, 
  } = props; 

  const displayName = `${first_name} ${last_name}` + (maiden_name ? `(${maiden_name})` : ''); 
  return (
    <Card
      style={{ float: 'right', width: '25%' }}
      actions={[  
        <SettingOutlined key="setting" />,
        <EditOutlined key="edit" />,
        <EllipsisOutlined key="ellipsis" />,
      ]}
      loading={loading}
    > 
      <div>
        <Header>
          <Avatar src={is_male ? '/male.jpg' : '/female.jpg'} size={50} />
          <HeaderInfo>
            <Name>{first_name} {last_name}</Name>
            {nickname && <Nickname>&quot;{nickname}&quot;</Nickname>}
          </HeaderInfo>
        </Header>
        <>
          <Divider /> 
          <Footer>
            {birth_date && <Date header='BORN'>{birth_date}</Date>}
          </Footer>
        </>
      </div>
    </Card>
  )     
}
