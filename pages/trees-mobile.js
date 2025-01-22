import {useContext} from 'react';
import {Alert, Checkbox, Table, Tooltip, Typography} from 'antd';
import {QuestionCircleOutlined, RightCircleOutlined} from '@ant-design/icons'; 
import {ROUTES} from '../constants/routes'; 
import NavBar from '../components/nav-bar'; 
import { TreeContext } from '../data/contexts/tree';
import Head from 'next/head'; 

function Section({children}) { 
  return (
    <div className='flex flex-col items-start'>
      {children}
    </div>
  ); 
}

function TreeMobile({ data, updateTree }) {
  const {
    uuid,
    name,
    description,
    is_email_subscribed,
    sharer_email,
  } = data; 
  
  function handleToggleEmailSubscription() { 
    updateTree({
      uuid: uuid,
      is_email_subscribed: !is_email_subscribed,
    }); 
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='mr-2'>
        <div className='text-lg font-bold'>{name}</div>
        <div className='italic'>{description}</div>
        { sharer_email && (
          <span className='text-xs text-gray-400 italic'>Owner: {sharer_email}</span>
        )}
        <div className='flex items-center gap-2 mt-2'>
            <Checkbox checked={is_email_subscribed} onChange={handleToggleEmailSubscription} /> 
            <span>Subscribed to e-mail?</span>
            <Tooltip placement="top" title={'If checked, you will receive an e-mail on the first of every month reminding you of upcoming birthdays and anniversaries of members of this tree. You can un-check this box to stop receiving e-mails at any time.'}>
              <QuestionCircleOutlined />
            </Tooltip>
        </div>
      </div>
      <Typography.Link href={`/trees/${uuid}`}><RightCircleOutlined style={{ fontSize: '24px' }} /></Typography.Link>
    </div>
  ); 
}


export default function TreesMobile() {
  const {
    // trees
    treeData,
    treeCount, 
    treeLoading,
    treeSetCurrentPage,
    TREE_PAGE_SIZE,   

    updateTree, 

    // shared trees
    sharedTreeData, 
    sharedTreeCount, 
    sharedTreeLoading,
    sharedTreeSetCurrentPage, 
    SHARED_TREE_PAGE_SIZE, 
  } = useContext(TreeContext); 

  const TREE_COLUMNS = [
    {
      title: '',
      dataIndex: '', 
      key: '', 
      render: (_, record) => <TreeMobile data={record} updateTree={updateTree} />,
    },
  ];

  const SHARED_TREE_COLUMNS = [
    {
      title: '',
      dataIndex: '', 
      key: '', 
      render: (_, record) => <TreeMobile data={record} updateTree={updateTree} />,
    },
  ]; 

  return (
    <div className='p-8'>
      <Head>
        <title>Cognatus | Trees</title>
      </Head>
      <NavBar backRoute={ROUTES.HOME}/>
      <div className='italic mb-4 mt-[-20px]'>
        <Alert
          description="Please use a desktop browser to create new trees, delete trees, or edit tree metadata (including viewers/collaborators)."
          showIcon
          type="warning"
        />
      </div>
      <Section>
        <div className='flex justify-between items-center w-full'>
          <Typography.Title level={3}>
            Your trees ({treeCount})
          </Typography.Title>
        </div>
        <Table
          bordered
          columns={TREE_COLUMNS}
          dataSource={treeData}
          loading={treeLoading}
          pagination={{
            defaultPageSize: TREE_PAGE_SIZE,
            total: treeCount,
            simple: true, 
            onChange: (page) => treeSetCurrentPage(page), 
          }}
          showHeader={false}
          style={{
            width: '100%'
          }}
        />
      </Section>
      <Section>
        <div className={`flex justify-between items-center w-full ${treeCount === 0 && 'mt-10'}`}>
          <Typography.Title level={3}>
            Trees shared with you ({sharedTreeCount})
          </Typography.Title>
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
          showHeader={false}
          style={{
            width: '100%'
          }}
        />
      </Section>
    </div>
  ); 
}
