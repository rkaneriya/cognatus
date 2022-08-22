import {useState, useContext} from 'react';
import {useStyletron} from 'styletron-react';  
import moment from 'moment'; 
import {Button, Checkbox, Table, Tag, Tooltip, Typography} from 'antd';
import {QuestionCircleOutlined} from '@ant-design/icons'; 
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import Link from 'next/link'; 
import EditableTable from '../components/editable-table'; 
import NewTreeDrawer from '../components/new-tree-drawer';
import NavBar from '../components/nav-bar'; 
import { TreeContext } from '../data/contexts/tree';
import Head from 'next/head'; 

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

function IsPublicCheckbox({checked, onChange}) {
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex', 
      justifyContent: 'center', 
    })}>
      <Checkbox checked={checked} onChange={onChange} />
    </div>
  )
}

function IsEmailSubscribedCheckbox({checked, onChange}) {
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex', 
      justifyContent: 'center', 
    })}>
      <Checkbox checked={checked} onChange={onChange} />
    </div>
  )
}

function IsPublicColumnHeader() { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex', 
      alignItems: 'center', 
    })}>
      Is Public?
      <Tooltip placement="top" title={'Share a read-only version of your tree with anyone who has a link to it.'}>
        <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
      </Tooltip>
    </div>
  )
}

function IsEmailSubscribedColumnHeader() { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex', 
      alignItems: 'center', 
    })}>
      <Tooltip placement="top" title={'If checked, you will receive an e-mail on the first of every month reminding you of upcoming birthdays and anniversaries of members of this tree. You can un-check this box to stop receiving e-mails at any time.'}>
        <Tag color="#f50">NEW</Tag>
      </Tooltip>
      Subscribe to E-mail? 
      <Tooltip placement="top" title={'If checked, you will receive an e-mail on the first of every month reminding you of upcoming birthdays and anniversaries of members of this tree. You can un-check this box to stop receiving e-mails at any time.'}>
        <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
      </Tooltip>
    </div>
  )
}

export default function Trees() {
  const [css] = useStyletron(); 
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

  const TREE_COLUMNS = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '20%',
      editable: true, 
      required: true, 
      key: 'name',
      render: (text, record) => <Link href={`/trees/${record.uuid}`}>{text}</Link>,
    },
    {
      title: 'Description', 
      dataIndex: 'description', 
      width: '35%', 
      editable: true, 
      required: false, 
      key: 'description', 
    }, 
    { 
      title: 'Created At', 
      dataIndex: 'created_at', 
      width: '15%', 
      editable: false, 
      key: 'created_at', 
      render: (text) => moment(text).format('ll LT'), 
    },
    {
      title: <IsPublicColumnHeader />, 
      dataIndex: 'created_at', 
      width: '10%', 
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
      width: '10%', 
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
      width: '20%',
      key: 'name',
      render: (text, record) => <Link href={`/trees/${record.uuid}`}>{text}</Link>,
    },
    {
      title: 'Description', 
      dataIndex: 'description', 
      width: '35%', 
      key: 'description', 
    }, 
    { 
      title: 'Created At', 
      dataIndex: 'created_at', 
      width: '15%', 
      key: 'created_at', 
      render: (text) => moment(text).format('ll LT'), 
    },
    { 
      title: 'Shared By', 
      dataIndex: 'sharer_email', 
      width: '10%', 
      key: 'sharer_email', 
    },
    {
      title: <IsEmailSubscribedColumnHeader />, 
      dataIndex: 'name', 
      width: '10%', 
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


  return (
    <Wrapper>
      <Head>
        <title>Cognatus | Trees</title>
      </Head>
      <NavBar backRoute={ROUTES.HOME}/>

      <Section>
        <div className={css({
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          width: '100%', 
        })}>
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
        <div className={css({
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          width: '100%', 
          marginTop: treeCount === 0 ? '40px' : '0px',
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