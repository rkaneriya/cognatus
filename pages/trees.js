import {useState, useEffect, useContext} from 'react';
import moment from 'moment'; 
import {Button, Checkbox, Table, Tooltip, Typography} from 'antd';
import {QuestionCircleOutlined} from '@ant-design/icons'; 
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import EditableTable from '../components/editable-table'; 
import NewTreeDrawer from '../components/new-tree-drawer';
import NavBar from '../components/nav-bar'; 
import { TreeContext } from '../data/contexts/tree';
import TreesMobile from './trees-mobile';
import Head from 'next/head'; 
import { isMobile } from 'react-device-detect';

const {Title} = Typography; 

function Section({children}) { 
  return (
    <div className='flex flex-col items-start'>
      {children}
    </div>
  ); 
}

function IsPublicCheckbox({checked, onChange}) {
  return (
    <div className='flex justify-center'>
      <Checkbox checked={checked} onChange={onChange} />
    </div>
  )
}

function IsEmailSubscribedCheckbox({checked, onChange}) {
  return (
    <div className='flex justify-center'>
      <Checkbox checked={checked} onChange={onChange} />
    </div>
  )
}

function IsPublicColumnHeader() {
  return (
    <div className='flex items-center'>
      <span className='whitespace-nowrap'>Is Public?</span>
      <Tooltip placement="top" title={'Share a read-only version of your tree with anyone who has a link to it.'}>
        <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
      </Tooltip>
    </div>
  )
}

function IsEmailSubscribedColumnHeader() { 
  return (
    <div className='flex items-center'>
      <span className='whitespace-nowrap'>E-mail?</span> 
      <Tooltip placement="top" title={'If checked, you will receive an e-mail on the first of every month reminding you of upcoming birthdays and anniversaries of members of this tree. You can un-check this box to stop receiving e-mails at any time.'}>
        <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
      </Tooltip>
    </div>
  )
}

export default function Trees() {
  const [shouldRenderMobile, setShouldRenderMobile] = useState(false); 
  const [isCreateTreeDrawerOpen, setIsCreateTreeDrawerOpen] = useState(false); 
  const {
    // trees
    createTree,
    updateTree,
    treeCount, 
    upsertShareeTreeExt,
    
    // shared trees
    sharedTreeData, 
    sharedTreeCount, 
    sharedTreeLoading,
    sharedTreeSetCurrentPage, 
    SHARED_TREE_PAGE_SIZE, 
  } = useContext(TreeContext); 

  useEffect(() => { 
    setShouldRenderMobile(isMobile); 
  }, []); 

  const TREE_COLUMNS = [
    {
      title: 'Name',
      dataIndex: 'name',
      editable: true, 
      required: true, 
      key: 'name',
      width: '15%', 
      render: (text, record) => <Typography.Link href={`/trees/${record.uuid}`}>{text}</Typography.Link>,
    },
    {
      title: 'Description', 
      dataIndex: 'description', 
      editable: true, 
      required: false, 
      key: 'description', 
    }, 
    { 
      title: 'Created At', 
      dataIndex: 'created_at', 
      editable: false, 
      key: 'created_at', 
      render: (text) => moment(text).format('l LT'), 
    },
    {
      title: <IsPublicColumnHeader />, 
      dataIndex: 'created_at', 
      editable: false, 
      key: 'created_at', 
      render: (_, record) => (
        <IsPublicCheckbox 
          checked={record?.is_public} 
          onChange={() => updateTree({
            uuid: record?.uuid,
            is_public: !record?.is_public,
          })} 
        />
      )
    },
    {
      title: <IsEmailSubscribedColumnHeader />, 
      dataIndex: 'created_at', 
      editable: false, 
      key: 'created_at', 
      render: (_, record) => (
        <IsEmailSubscribedCheckbox 
          checked={record?.is_email_subscribed} 
          onChange={() => updateTree({
            uuid: record?.uuid,
            is_email_subscribed: !record.is_email_subscribed, 
          })} 
        />
      )
    }
  ];

  const SHARED_TREE_COLUMNS = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '15%', 
      render: (text, record) => <Typography.Link href={`/trees/${record.uuid}`}>{text}</Typography.Link>,
    },
    {
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description', 
    }, 
    { 
      title: 'Created At', 
      dataIndex: 'created_at', 
      key: 'created_at', 
      render: (text) => moment(text).format('l LT'), 
    },
    { 
      title: 'Shared By', 
      dataIndex: 'sharer_email', 
      key: 'sharer_email', 
    },
    {
      title: <IsEmailSubscribedColumnHeader />, 
      dataIndex: 'name', 
      editable: false, 
      key: 'created_at', 
      render: (_, record) => (
        <IsEmailSubscribedCheckbox 
          checked={record?.is_email_subscribed} 
          onChange={() => upsertShareeTreeExt({
            shared_tree_row_uuid: record?.shared_tree_row_uuid,
            is_email_subscribed: !record.is_email_subscribed, 
            sharee_tree_ext_row_uuid: record?.sharee_tree_ext_row_uuid, 
            tree_uuid: record?.uuid, 
          })} 
        />
      )
    }
  ]; 

  if (shouldRenderMobile) { 
    return <TreesMobile /> 
  }

  return (
    <div className='p-10 w-fit'>
      <Head>
        <title>Cognatus | Trees</title>
      </Head>
      <NavBar backRoute={ROUTES.HOME}/>

      <Section>
        <div className='flex justify-between items-center w-full'>
          <Title level={2}>
            Your trees ({treeCount})
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
          columns={TREE_COLUMNS}
        />
      </Section>

      <Section>
        <div className={`flex justify-between items-center w-full ${treeCount === 0 && 'mt-10'}`}>
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
            defaultPageSize: SHARED_TREE_PAGE_SIZE,
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
    </div>
  ); 
}

export async function getServerSideProps({ req }) {
  const { user } = await supabase.auth.api.getUserByCookie(req)
  if (!user) {
    return { props: {}, redirect: { destination: ROUTES.HOME, permanent: false } }
  }
  return { props: { user } }
}