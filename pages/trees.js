import {useCallback, useEffect, useState} from 'react';
import {useStyletron} from 'styletron-react'; 
import {DateTime} from 'luxon'; 
import {message, Button, Typography} from 'antd';
import { v4 as uuidv4 } from 'uuid';
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import Link from 'next/link'; 
import EditableTable from '../components/editable-table'; 
import NewTreeDrawer from '../components/new-tree-drawer';
import NavBar from '../components/nav-bar'; 

const {Title} = Typography; 

const PAGE_SIZE = 5; 

function Wrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      padding: '36px', 
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
      marginTop: '48px', 
    })}>
      {children}
    </div>
  ); 
}

export default function Trees({user}) {
  const [css] = useStyletron(); 
  const [loading, setLoading] = useState(false); 
  const [data, setData] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalCount, setTotalCount] = useState(0); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 

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

  const fetchTrees = useCallback(async () => { 
    setLoading(true); 

    const start = (currentPage - 1) * PAGE_SIZE; 
    const end = start + PAGE_SIZE - 1;  

    const { data: trees, count, error } = await supabase
      .from("tree")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: true })
      .range(start, end);
  
    if (error) {
      message.error(error?.message || 'Error');
    } else {
      const transformed = trees.map((t) => ({
        key: t.uuid, 
        ...t, 
      }))
      setData(transformed); 
      setTotalCount(count); 
    } 
    setLoading(false);  
  }, [currentPage])

  async function updateTree(tree) { 
    setLoading(true); 
    const editableFields = EDITABLE_COLUMNS
      .filter(({editable}) => editable)
      .map(({dataIndex}) => dataIndex); 
    const editableFieldsSet = new Set(editableFields);  

    const payload = Object.keys(tree).reduce((acc, field) => { 
      if (editableFieldsSet.has(field)) { 
        return { 
          ...acc,
          [field]: tree[field], 
        }; 
      }
      return acc; 
    }, {}); 

    const { error } = await supabase
      .from('tree')
      .update(payload)
      .eq('uuid', tree.uuid); 
    if (error) {
      message.error(error?.message || 'Error')
    } else { 
      fetchTrees();
    }
    setLoading(false); 
  }

  async function deleteTree(uuid) { 
    setLoading(true); 
    const { error } = await supabase
      .from('tree')
      .delete()
      .eq('uuid', uuid);
    if (error) {
      message.error(error?.message || 'Error')
    } else { 
      fetchTrees(); 
    }
    setLoading(false); 
  }

  async function createTree(tree) { 
    const user = supabase.auth.user(); 
    setLoading(true); 
    const { error } = await supabase
      .from('tree')
      .insert([{
        ...tree, 
        creator_uuid: user.id,
        uuid: uuidv4(), 
      }]); 
    if (error) {
      message.error(error?.message || 'Error')
    } else { 
      setIsDrawerOpen(false); 
      fetchTrees(); 
    }
    setLoading(false);   
  }

  useEffect(() => {
    fetchTrees()
  }, [fetchTrees])
 
  return (
    <Wrapper>
      <NavBar backRoute={ROUTES.HOME}/>
      <Section>
        <div className={css({
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          width: '100%', 
        })}>
          <Title>
            Your trees ({totalCount})
          </Title>
          <Button 
            onClick={() => setIsDrawerOpen(true)}
            style={{ marginBottom: '20px' }} 
            type='primary'
          >
            Create new tree
          </Button>
        </div>
        <EditableTable
          columns={EDITABLE_COLUMNS}
          dataSource={data}
          loading={loading}
          pagination={{ 
            defaultPageSize: PAGE_SIZE, 
            total: totalCount, 
            simple: true,
            onChange: (page) => setCurrentPage(page), 
          }}
          handleRowDelete={deleteTree}
          handleRowSave={updateTree}
        />
      </Section>
      <NewTreeDrawer
        onClose={() => setIsDrawerOpen(false)}
        onFinish={createTree}
        visible={isDrawerOpen}
      / >
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