import {useStyletron} from 'styletron-react'; 
import {Button, Table, Tag, Space } from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons'; 
import {useRouter} from 'next/router'
import {supabase} from '../utils/supabase'
import {Title} from '../components/typography'; 
import {ROUTES} from '../constants/routes'; 

function Wrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      padding: '50px', 
    })}>
      {children}
    </div>
  ); 
}

function Section({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column', 
      alignItems: 'flex-start', 
      marginTop: '20px', 
    })}>
      {children}
    </div>
  ); 
}

function NavBar() { 
  const [css] = useStyletron(); 
  const router = useRouter(); 

  async function logout() {
    const a = await supabase.auth.signOut(); 
    router.push(ROUTES.HOME)
  }

  return (
    <div className={css({
      width: '100%', 
      display: 'flex', 
      justifyContent: 'space-between', 
    })}>
      <Button type="default" shape="circle" icon={<ArrowLeftOutlined />} size="large" onClick={() => router.push(ROUTES.HOME)} /> 
      <Button type="default" onClick={logout}>Logout</Button>
    </div>
  );
}

// TODO -- replace with real data fetch 
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: text => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: tags => (
      <>
        {tags.map(tag => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];


export default function Trees({user}) {
  return (
    <Wrapper>
      <NavBar />
      <Section>
        <Title>Your trees ({user.email})</Title>
        <Table columns={columns} dataSource={data} style={{ width: '100%' }} />
      </Section>
    </Wrapper>
  ); 
}

export async function getServerSideProps({ req }) {
  const { user } = await supabase.auth.api.getUserByCookie(req)

  if (!user) {
    return { props: {}, redirect: { destination: ROUTES.HOME, permanent: false } }
  }

  return { props: { user } }
}