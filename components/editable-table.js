import { useEffect, useState } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Typography } from 'antd';
import ShareTreeDrawer from './share-tree-drawer';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `${title} is required`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = ({
  columns, 
  dataSource, 
  handleDelete, 
  handleSave,
  handleShareAdd,
  handleShareDelete, 
  loading, 
  pagination, 
}) => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [isShareTreeDrawerOpen, setIsShareTreeDrawerOpen] = useState(false); 
  const [sharableTreeUuid, setSharableTreeUuid] = useState(null); 
  
  useEffect(() => { 
    setData(dataSource); 
  }, [dataSource]); 
  
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.key === editingKey;

  const editableFields = columns
    .filter(({editable}) => editable)
    .map(({dataIndex}) => dataIndex); 

  const editableFieldsEmptyMap = editableFields.reduce((acc, val) => ({ 
    ...acc,
    [val]: '', 
  }), {}); 

  const edit = (record) => {
    form.setFieldsValue({
      ...editableFieldsEmptyMap, 
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();      
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        handleSave(newData[index]); 
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const deleteRow = (uuid) => { 
    handleDelete(uuid); 
  }; 

  const modifiedColumns = [
    ...columns, 
    {
      title: 'Actions',
      dataIndex: 'action',
      render: (_, record) => {
        const editable = isEditing(record);
        const handleShare = () => { 
          setSharableTreeUuid(record.uuid); 
          setIsShareTreeDrawerOpen(true); 
        }
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Typography.Link onClick={cancel}>
              Cancel
            </Typography.Link>
          </span>
        ) : (
          <span>
            <Typography.Link disabled={editingKey !== ''} style={{ marginRight: 8 }} onClick={() => edit(record)}>
              Edit
            </Typography.Link>
            <Popconfirm title="Are you sure?" okText="Yes" onConfirm={() => deleteRow(record.uuid)}>
              <a disabled={editingKey !== ''} >Delete</a>
            </Popconfirm>
            <Typography.Link disabled={editingKey !== ''} style={{ marginLeft: 8 }}  onClick={handleShare}>
              <span>Share ({record.sharees.length})</span>
            </Typography.Link>
          </span>
        );
      },
    },
  ];
  const mergedColumns = modifiedColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const tree = data.find(d => d.uuid === sharableTreeUuid); 
  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        columns={mergedColumns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        style={{
          width: '100%'
        }}
      />
      <ShareTreeDrawer
        handleShareAdd={handleShareAdd}
        handleShareDelete={handleShareDelete}
        tree={tree}
        onClose={() => setIsShareTreeDrawerOpen(false)}
        visible={isShareTreeDrawerOpen}
      />
    </Form>
  );
};

export default EditableTable; 