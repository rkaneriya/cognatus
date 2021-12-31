import moment from 'moment'; 
import { useEffect, useState, useContext } from 'react';
import { Card, Button, Select, Avatar, Tooltip, Tag, AutoComplete, Popconfirm, Divider as AntDivider } from 'antd';
import { useStyletron, styled, autoComposeDeep } from 'styletron-react';
import { UpOutlined, EditOutlined, ApartmentOutlined, DeleteOutlined, PlusOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { RELATION_TYPES } from '../constants/relation-types';
import {getRelationEdgeColor} from '../utils/relations'; 
import { MemberRelationContext } from '../data/contexts/member-relation';
import {DISPLAY_RELATION_TYPES, DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG} from '../constants/display-relation-types'; 

function TagValue({
  isTreeEditable,
  relationType, 
  onDelete,
  children, 
}) { 
  const [css] = useStyletron(); 
  const color = getRelationEdgeColor(relationType); 
  const tagStyle = (
    relationType === RELATION_TYPES.EX_SPOUSE 
    ? {
      background: 'unset', 
      backgroundImage: 'linear-gradient(30deg, #f9f0ff 25%, transparent 25%, transparent 50%, #f9f0ff 50%, #f9f0ff 75%, transparent 75%, #fff)'
    } 
    : {}
  ); 
  return (
    <div className={css({
      overflowWrap: 'break-word',
      marginBottom: '5px'
    })}>
      <Tag color={color} style={tagStyle} closable={isTreeEditable} onClose={onDelete}>
        <span style={{ 
          whiteSpace: 'normal',
          fontSize: '14px',   
          padding: '10px 0px', 
        }}>
          {children}
        </span>
      </Tag>
    </div>
  ); 
}

function EditButton({onClick}) { 
  return (
    <Tooltip placement='bottom' title='Edit'>  
      <EditOutlined key="edit" onClick={onClick} />
    </Tooltip>
  ); 
}

function RelativeTag({
  relative, 
  displayRelationType,
  onMemberSelect,
  onEditRelation,
}) {     
  const [css] = useStyletron(); 
  const {
    deleteRelation,
    isTreeEditable, 
    directRelationsByRelativeUuid,
  } = useContext(MemberRelationContext); 

  console.log("@@@ RELATIVE CONTENT", directRelationsByRelativeUuid, relative)
  const { 
    relationType,
  } = DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG[displayRelationType]; 

  const relation = directRelationsByRelativeUuid[relative.uuid]; 

  const mMarriageStartDate = relation.start_date ? moment(relation.start_date) : moment();
  const mMarriageEndDate = relation.end_date ? moment(relation.end_date) : moment();             
  const formattedMarriageStartDate = mMarriageStartDate.format('l');
  const formattedMarriageEndDate = mMarriageEndDate.format('l');
  const formattedMarriageDates = relation.end_date 
    ? `${formattedMarriageStartDate} - ${formattedMarriageEndDate}` 
    : `Since ${formattedMarriageStartDate}` 
  const marriageLength = mMarriageEndDate.diff(mMarriageStartDate, 'years'); 

  const isSpouse = (
    displayRelationType === DISPLAY_RELATION_TYPES.SPOUSE || 
    displayRelationType === DISPLAY_RELATION_TYPES.EX_SPOUSE
  ); 

  function handleDeleteRelation() { 
    const relationToDelete = directRelationsByRelativeUuid[relative?.uuid]; 
    deleteRelation(relationToDelete.uuid)
  } 

  return (
    <div>
      <a onClick={() => onMemberSelect(relative?.uuid)}>
        <TagValue
          isTreeEditable={isTreeEditable}
          relationType={relationType}
          onDelete={handleDeleteRelation}
        >
          {relative.first_name} {relative.last_name}
        </TagValue>
      </a>
      {
        isSpouse && (
          <div className={css({marginBottom: '5px'})}>
            <span className={css({fontStyle: 'italic'})}>
              {formattedMarriageDates}
            </span>
            <br/>
            <span className={css({display: 'flex', alignItems: 'center', fontStyle: 'italic'})}>
              <span>({marriageLength} years)</span>
              { 
                isTreeEditable && (
                  <a onClick={() => onEditRelation(relation)} style={{marginLeft: '5px'}}><EditButton /></a>
                )
              }
            </span>
          </div>
        )
      }
    </div>
  );
}

export function RelativeContent({
  displayRelationType,
  onAddNewMemberAndRelation,
  onEditRelation,
}) { 
  const [css] = useStyletron(); 
  const [relativeUuid, setRelativeUuid] = useState(null); 
  const [editableSection, setEditableSection] = useState(null); 

  const {
    createRelation,
    isTreeEditable, 
    members,
    membersByUuid,
    selectedMemberUuid,
    setSelectedMemberUuid,
    directRelationsByRelativeUuid,
  } = useContext(MemberRelationContext); 

  const selectedMember = membersByUuid[selectedMemberUuid] || {}; 

  const relativesByType = Object.values(directRelationsByRelativeUuid).reduce((acc, relation) => { 
    const relativeUuid = relation.from_member_uuid === selectedMemberUuid 
      ? relation.to_member_uuid 
      : relation.from_member_uuid;  
    const relative = membersByUuid[relativeUuid]; 
    const isRelativeOlder = moment(selectedMember.birth_date).isAfter(moment(relative.birth_date));
    
    let displayRelationType = DISPLAY_RELATION_TYPES.CHILD; 
    if (relation.type === RELATION_TYPES.EX_SPOUSE) { 
      displayRelationType = DISPLAY_RELATION_TYPES.EX_SPOUSE; 
    } else if (relation.type === RELATION_TYPES.SPOUSE) { 
      displayRelationType = DISPLAY_RELATION_TYPES.SPOUSE; 
    } else { 
      if (isRelativeOlder) { 
        displayRelationType = DISPLAY_RELATION_TYPES.PARENT; 
      }
    }
    acc[displayRelationType].push(relative);
    return acc; 
  }, {
    [DISPLAY_RELATION_TYPES.PARENT]: [], 
    [DISPLAY_RELATION_TYPES.CHILD]: [], 
    [DISPLAY_RELATION_TYPES.SPOUSE]: [], 
    [DISPLAY_RELATION_TYPES.EX_SPOUSE]: [], 
  }); 

  const { 
    contentLabel, 
    relationType,
    memberRelationAction, 
  } = DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG[displayRelationType]; 

  const relativeOptions = members.filter(m => 
    m.uuid !== selectedMemberUuid && !Object.values(directRelationsByRelativeUuid).includes(m.uuid)
  ); 

  function handleAddRelative(relativeUuid, relationType) {
    if (relativeUuid) { 
      createRelation(relativeUuid, relationType); 
    }
    setRelativeUuid(null);
    setEditableSection(null); 
  }

  function handleMemberSelect(uuid) { 
    setRelativeUuid(null); 
    setSelectedMemberUuid(uuid); 
  }

  function handleEditableSection(displayRelationType) { 
    setRelativeUuid(null); 
    setEditableSection(displayRelationType); 
  }

  return (
    <>
      { 
        relativesByType[displayRelationType].map((relative) => (
          <RelativeTag 
            key={relative.uuid}
            relative={relative} 
            displayRelationType={displayRelationType} 
            onMemberSelect={handleMemberSelect}
            onEditRelation={onEditRelation}
          />
        ))
      }
      {
        !isTreeEditable && relativesByType[displayRelationType].length === 0 && (
          <span>--</span>
        )
      }
      { 
        isTreeEditable && (
          editableSection === displayRelationType ? (
            <div className={css({
              display: 'flex',
              justifyContent: 'space-between', 
              alignItems: 'center',
            })}>
              <Select
                autoFocus={true}
                showSearch={true}
                value={relativeUuid}
                notFoundContent={<a onClick={() => onAddNewMemberAndRelation(memberRelationAction)}>{`Create new ${contentLabel}`}</a>}
                style={{ width: 150 }}
                onSelect={setRelativeUuid}
                placeholder={`Select ${contentLabel}`}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {
                  relativeOptions.map(r => (
                    <Select.Option
                      key={r.uuid}
                      value={r.uuid}
                    >
                      {`${r.first_name} ${r.last_name}`}
                    </Select.Option>
                  ))
                }
              </Select>
              <a 
                disabled={!relativeUuid}
                style={{ marginLeft: '5px' }} 
                onClick={() => handleAddRelative(relativeUuid, relationType)}
              >
                Add
              </a>
            </div>
          ) : ( 
            <Tag 
              onClick={() => handleEditableSection(displayRelationType)} 
              style={{ 
                border: '1px dashed lightgrey', 
                backgroundColor: 'white',
                color: 'grey', 
                width: 'fit-content', 
                fontSize: '14px', 
                padding: '3px 6px'
              }}
            >
              <PlusOutlined /> Add {contentLabel}
            </Tag>
          )
        ) 
      }
    </>
  ); 
}