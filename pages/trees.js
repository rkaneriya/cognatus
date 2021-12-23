import {useEffect, useState} from 'react';
import {useStyletron} from 'styletron-react'; 
import {DateTime} from 'luxon'; 
import {message, Button, Space, Table} from 'antd';
import {ArrowLeftOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons'; 
import {useRouter} from 'next/router'
import {supabase} from '../utils/supabase'
import {Title} from '../components/typography'; 
import {ROUTES} from '../constants/routes'; 
import Link from 'next/link'; 
import EditableTable from '../components/editable-table'; 

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

export default function Trees({user}) {
  const [loading, setLoading] = useState(false); 
  const [data, setData] = useState([]); 

  const EDITABLE_COLUMNS = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '25%',
      editable: true, 
      key: 'name',
      render: (text, record) => <Link href={`/trees/${record.uuid}`}>{text}</Link>,
    },
    {
      title: 'Description', 
      dataIndex: 'description', 
      width: '50%', 
      editable: true, 
      key: 'description', 
    }, 
    { 
      title: 'Created At', 
      dataIndex: 'created_at', 
      width: '25%', 
      editable: false, 
      key: 'created_at', 
      render: (text) => DateTime.fromISO(text).toFormat('ff'), 
    },
  ];

  async function fetchTrees() {
    setLoading(true); 
    const { data: trees, error } = await supabase.from('tree').select('*')
    if (error) {
      message.error(error)
    } else {
      const transformed = trees.map((t) => ({
        key: t.uuid, 
        ...t, 
      }))
      setData(transformed); 
    } 
    setLoading(false); 
  }

  async function updateTree(tree) { 
    setLoading(true); 
    const editableFields = EDITABLE_COLUMNS
      .filter(({editable}) => editable)
      .map(({dataIndex}) => dataIndex); 
    const editableFieldsSet = new Set(editableFields);  
    const updatedFields = Object.keys(tree).reduce((acc, field) => { 
      if (editableFieldsSet.has(field)) { 
        return { 
          ...acc,
          [field]: tree[field], 
        }; 
      }
      return acc; 
    }, {}); 

    const { error } = await supabase.from('tree').update(updatedFields).eq('uuid', tree.uuid); 
    if (error) {
      message.error(error)
    } else { 
      fetchTrees(); // reload table 
    }
    setLoading(false); 
  }

  async function deleteTree(uuid) { 
    setLoading(true); 
    const { error } = await supabase.from('tree').delete().eq('uuid', uuid);
    if (error) {
      message.error(error)
    } else { 
      fetchTrees(); // reload table 
    }
    setLoading(false); 
  }

  useEffect(() => {
    fetchTrees()
  }, [])
 
  return (
    <Wrapper>
      <NavBar />
      <Section>
        <Title>Your trees ({user.email})</Title>
        <EditableTable
          columns={EDITABLE_COLUMNS}
          dataSource={data}
          loading={loading}
          pagination={{ 
            defaultCurrent: 1, 
            total: 50, 
            simple: true,
          }}
          handleRowDelete={deleteTree}
          handleRowSave={updateTree}
        />
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