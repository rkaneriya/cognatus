import {useEffect, useState} from 'react';
import {useStyletron} from 'styletron-react';  
import moment from 'moment'; 
import {Button, Typography} from 'antd';
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import Link from 'next/link'; 
import EditableTable from '../components/editable-table'; 
import NewTreeDrawer from '../components/new-tree-drawer';
import NavBar from '../components/nav-bar'; 
import useTreeAPI, {PAGE_SIZE} from '../api/tree';

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
      render: (text) => moment(text).format('ll LT'), 
    },
  ];

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