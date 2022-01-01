import {useEffect, useState} from 'react';
import {useStyletron} from 'styletron-react';  
import moment from 'moment'; 
import {Button, Table, Typography} from 'antd';
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import Link from 'next/link'; 
import EditableTable from '../components/editable-table'; 
import NewTreeDrawer from '../components/new-tree-drawer';
import NavBar from '../components/nav-bar'; 
import useTreeAPI, {PAGE_SIZE} from '../data/hooks/tree';
import useSharedTreeAPI from '../data/hooks/shared-tree';

const {Title} = Typography; 

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
    })}>
      {children}
    </div>
  ); 
}

export default function Trees({user}) {
  const [css] = useStyletron(); 
  const [isCreateTreeDrawerOpen, setIsCreateTreeDrawerOpen] = useState(false); 

  const EDITABLE_COLUMNS = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '20%',
      editable: true, 
      key: 'name',
      render: (text, record) => <Link href={`/trees/${record.uuid}`}>{text}</Link>,
    },
    {
      title: 'Description', 
      dataIndex: 'description', 
      width: '45%', 
      editable: true, 
      key: 'description', 
    }, 
    { 
      title: 'Created At', 
      dataIndex: 'created_at', 
      width: '20%', 
      editable: false, 
      key: 'created_at', 
      render: (text) => moment(text).format('ll LT'), 
    },
  ];

  const SHARED_TREE_COLUMNS = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '25%',
      key: 'name',
      render: (text, record) => <Link href={`/trees/${record.uuid}`}>{text}</Link>,
    },
    {
      title: 'Description', 
      dataIndex: 'description', 
      width: '50%', 
      key: 'description', 
    }, 
    { 
      title: 'Created At', 
      dataIndex: 'created_at', 
      width: '25%', 
      key: 'created_at', 
      render: (text) => moment(text).format('ll LT'), 
    },
    { 
      title: 'Shared By', 
      dataIndex: 'sharer_email', 
      width: '25%', 
      key: 'sharer_email', 
    },
  ]

  const { 
    // crud
    fetchTrees,
    createTree,
    updateTree,
    deleteTree,

    // data 
    data,
    totalCount, 
    loading,
    setCurrentPage,
  } = useTreeAPI(EDITABLE_COLUMNS); 

  const {
    fetchSharedTrees,
    createSharedTree,
    deleteSharedTree,
    
    data: sharedTreeData, 
    totalCount: sharedTreeCount, 
    loading: sharedTreeLoading,
    setCurrentPage: sharedTreeSetCurrentPage, 
  } = useSharedTreeAPI(fetchTrees); 

  useEffect(() => {
    fetchTrees();
    fetchSharedTrees(); 
  }, [fetchTrees, fetchSharedTrees])

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
          <Title level={2}>
            Your trees ({totalCount})
          </Title>
          <Button 
            onClick={() => setIsCreateTreeDrawerOpen(true)}
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
          handleDelete={deleteTree}
          handleSave={updateTree}
          handleShareAdd={createSharedTree}
          handleShareDelete={deleteSharedTree}
        />
      </Section>

      <Section>
        <div className={css({
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          width: '100%', 
        })}>
          <Title level={2}>
            Trees shared with you ({sharedTreeCount})
          </Title>
        </div>
        <Table
          bordered
          columns={SHARED_TREE_COLUMNS}
          dataSource={sharedTreeData}
          loading={sharedTreeLoading}
          pagination={{
            defaultPageSize: PAGE_SIZE,
            total: sharedTreeCount,
            simple: true, 
            onChange: (page) => sharedTreeSetCurrentPage(page), 
          }}
          style={{
            width: '100%'
          }}
        />
      </Section>
      
      <NewTreeDrawer
        onClose={() => setIsCreateTreeDrawerOpen(false)}
        onFinish={createTree}
        visible={isCreateTreeDrawerOpen}
      />
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