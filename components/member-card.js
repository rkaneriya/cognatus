import moment from 'moment'; 
import { useEffect, useState } from 'react';
import { Card, Button, Select, Avatar, Tooltip, Tag, AutoComplete, Popconfirm, Divider as AntDivider } from 'antd';
import { useStyletron, styled, autoComposeDeep } from 'styletron-react';
import { UpOutlined, EditOutlined, ApartmentOutlined, DeleteOutlined, PlusOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {pluralize} from '../utils/pluralize'; 
import { RELATION_TYPES } from '../constants/relation-types';
import { MEMBER_RELATION_ACTIONS } from '../constants/member-relation-actions';
import {getRelationEdgeColor} from '../utils/relations'; 

const DATE_FORMAT = 'll'; 

const DISPLAY_RELATION_TYPES = { 
  PARENT: 'parent', 
  CHILD: 'child', 
  SPOUSE: 'spouse',
  EX_SPOUSE: 'ex_spouse', 
}; 

function Name({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      fontWeight: '600', 
      textTransform: 'uppercase',
      fontSize: '16px',   
      width: '100%', 
      overflowWrap: 'break-word', 
    })}>
      {children}
    </div>
  ); 
}

function Divider() { 
  return (
    <AntDivider style={{ margin: '16px 0px' }} /> 
  ); 
}

function SectionRow({label, children, styles}) {
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex', 
      flexDirection: 'row',   
      width: '100%', 
      marginBottom: '10px',
      ...styles,  
    })}>
      <div className={css({
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginRight: '15px', 
        fontWeight: '600',
        width: '90px',  
      })}>
        {label}
      </div>
      <div className={css({
        display: 'flex', 
        flexDirection: 'column',
        width: '60%', 
      })}>
        {children}
      </div>
    </div>
  )
}

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

function BodySection({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex',
      alignItems: 'flex-start', 
      flexDirection: 'column',    
      width: '100%',          
    })}>
      {children}
    </div>
  ); 
}

function DeleteButton({onClick}) { 
  return (
    <Tooltip placement='bottom' title='Delete'>
      <Popconfirm title="Are you sure?" okText="Yes" onConfirm={onClick}>
        <DeleteOutlined key="delete" />
      </Popconfirm>  
    </Tooltip>
  ); 
}

function EditButton({onClick}) { 
  return (
    <Tooltip placement='bottom' title='Edit'>  
      <EditOutlined key="edit" onClick={onClick} />
    </Tooltip>
  ); 
}

function QueryRelationButton({name, onClick}) { 
  return (
    <Tooltip placement='bottom' title={`Discover how others are related to ${name}`}>  
      <ApartmentOutlined key="query_relation" onClick={onClick} />
    </Tooltip>
  ); 
}

export default function MemberCard({
  onAddNewMemberAndRelation, 
  onAddRelation, 
  onEditMember, 
  onDeleteMemberAndRelations, 
  selectedMember, 
  onDeleteRelation,
  onEditRelation, 
  members, 
  relations, 
  loading,
  isTreeEditable, 
  setSelectedMemberUuid,
}) {
  const [css] = useStyletron(); 
  const [relativeUuid, setRelativeUuid] = useState(null); 
  const [editableSection, setEditableSection] = useState(null); 
  const [isExpanded, setIsExpanded] = useState(true); 

  const {
    first_name,
    last_name,
    maiden_name,  
    nickname,
    is_male,
    birth_date,
    death_date, 
    notes, 
  } = selectedMember; 

  // member data 
  const membersByUuid = members.reduce((acc, member) => ({
    ...acc, 
    [member.uuid]: member, 
  }), {});

  const mBirthDate = moment(birth_date); 
  const mDeathDate = moment(death_date); 
  const formattedBirthDate = mBirthDate.format(DATE_FORMAT);
  const formattedDeathDate = mDeathDate.format(DATE_FORMAT); 
  const age = death_date
    ? mDeathDate.diff(mBirthDate, 'years')
    : moment().diff(mBirthDate, 'years'); 
  const deadYears = moment().diff(mDeathDate, 'years'); 
  const displayName = `${first_name} ${last_name}` + (maiden_name ? ` (${maiden_name})` : ''); 
  const dates = [
    birth_date ? { 
      label: 'BORN', 
      content: <>{formattedBirthDate} ({pluralize(age, 'year')})</>,
    } : {}, 
    death_date ? { 
      label: 'DIED', 
      content: <>{formattedDeathDate} ({pluralize(deadYears, 'year')} ago)</>,
    } : {}
  ]; 

  // relation data 
  const relationsByMemberUuid = relations.reduce((acc, relation) => {
    if (acc[relation.from_member_uuid]) { 
      acc[relation.from_member_uuid].push(relation); 
    } else {
      acc[relation.from_member_uuid] = [relation]; 
    }

    if (acc[relation.to_member_uuid]) { 
      acc[relation.to_member_uuid].push(relation); 
    } else {
      acc[relation.to_member_uuid] = [relation]; 
    }
    return acc;
  }, {}); 

  const directRelations = relationsByMemberUuid[selectedMember.uuid] || []; 
  const directRelationsByRelativeUuid = directRelations.reduce((acc, relation) => { 
    const relative = relation.from_member_uuid === selectedMember.uuid 
      ? membersByUuid[relation.to_member_uuid] 
      : membersByUuid[relation.from_member_uuid]; 
    return {
      ...acc,
      [relative.uuid]: relation, 
    }; 
  }, {}); 
    const directRelativesByUuid = directRelations.reduce((acc, relation) => {
    const relative = relation.from_member_uuid === selectedMember.uuid 
      ? membersByUuid[relation.to_member_uuid] 
      : membersByUuid[relation.from_member_uuid]; 
    return { 
      ...acc,
      [relative.uuid]: relative, 
    }
  }, {}); 
  const relativesByType = directRelations.reduce((acc, relation) => { 
    const relativeUuid = relation.from_member_uuid === selectedMember.uuid 
      ? relation.to_member_uuid 
      : relation.from_member_uuid;  
    const relative = directRelativesByUuid[relativeUuid]; 
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

  const relativeOptions = members.filter(m => 
    m.uuid !== selectedMember.uuid && !Object.keys(directRelativesByUuid).includes(m.uuid)
  ); 
  
  const actions = [
    <QueryRelationButton key='query_relation' name={first_name} onClick={handleQueryRelation} />,
    ...(isTreeEditable ? [
      <EditButton key='edit' onClick={onEditMember} />,
      <DeleteButton key='add_relation' onClick={onDeleteMemberAndRelations} />,
    ] : [])
  ]; 

  const DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG = {
    [DISPLAY_RELATION_TYPES.PARENT]: { 
      sectionLabel: 'PARENTS', 
      contentLabel: 'parent', 
      relationType: RELATION_TYPES.PARENT_CHILD, 
      memberRelationAction: MEMBER_RELATION_ACTIONS.ADD_NEW_PARENT, 
    },
    [DISPLAY_RELATION_TYPES.CHILD]: { 
      sectionLabel: 'CHILDREN', 
      contentLabel: 'child', 
      relationType: RELATION_TYPES.PARENT_CHILD, 
      memberRelationAction: MEMBER_RELATION_ACTIONS.ADD_NEW_CHILD, 
    },
    [DISPLAY_RELATION_TYPES.SPOUSE]: { 
      sectionLabel: 'SPOUSES', 
      contentLabel: 'spouse', 
      relationType: RELATION_TYPES.SPOUSE, 
      memberRelationAction: MEMBER_RELATION_ACTIONS.ADD_NEW_SPOUSE, 
    },
    [DISPLAY_RELATION_TYPES.EX_SPOUSE]: { 
      sectionLabel: 'EX-SPOUSES', 
      contentLabel: 'ex-spouse', 
      relationType: RELATION_TYPES.EX_SPOUSE, 
      memberRelationAction: MEMBER_RELATION_ACTIONS.ADD_NEW_EX_SPOUSE, 
    }, 
  }; 

  function handleRelativeSelect(value) { 
    setRelativeUuid(value); 
  }

  function handleAddRelative(relativeUuid, relationType) {
    if (relativeUuid) { 
      onAddRelation(relativeUuid, relationType); 
    }
    setRelativeUuid(null);
    setEditableSection(null); 
  }

  function handleMemberSelect(uuid) { 
    setRelativeUuid(null); 
    setSelectedMemberUuid(uuid); 
  }

  function handleDeleteRelation(relativeUuid) { 
    const relations = relationsByMemberUuid[relativeUuid];
    const relationToDelete = relations.find((relation) => (
      (relation.from_member_uuid === relativeUuid && relation.to_member_uuid === selectedMember.uuid) || 
      (relation.from_member_uuid === selectedMember.uuid && relation.to_member_uuid === relativeUuid)
    )); 
    onDeleteRelation(relationToDelete.uuid)
  } 

  function handleEditableSection(displayRelationType) { 
    setRelativeUuid(null); 
    setEditableSection(displayRelationType); 
  }

  function handleQueryRelation() {
    setIsExpanded(false); 
  }

  function RelativeTag({isTreeEditable, relative, displayRelationType}) {     
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

    return (
      <div>
        <a onClick={() => handleMemberSelect(relative.uuid)}>
          <TagValue
            isTreeEditable={isTreeEditable}
            relationType={relationType}
            onDelete={() => handleDeleteRelation(relative.uuid)}
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

  function RelativeContent({isTreeEditable, displayRelationType}) { 
    const { 
      contentLabel, 
      relationType,
      memberRelationAction, 
    } = DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG[displayRelationType]; 

    return (
      <>
        { 
          relativesByType[displayRelationType].map((relative) => (
            <RelativeTag 
              key={relative.uuid}
              isTreeEditable={isTreeEditable} 
              relative={relative} 
              displayRelationType={displayRelationType} 
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
                  onSelect={handleRelativeSelect}
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

  return (
    <Card
      style={{ 
        zIndex: 1, 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        margin: '20px', 
        backgroundColor: 'white',
        width: '350px',
        boxShadow: '-1px 2px 5px 2px rgba(0, 0, 0, 0.2)',
        maxHeight: '85vh', 
        overflow: 'auto',
      }}
      actions={actions}
      loading={loading}
    > 
      <div className={css({display: 'flex', alignItems: 'center', justifyContent: 'space-between'})}>
        <div className={css({display: 'flex', alignItems: 'center'})}>
          <Avatar src={is_male ? '/male.jpg' : '/female.jpg'} size={50} />
          <div className={css({
            marginLeft: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
          })}>
            <Name>{displayName}</Name>
            {nickname && <div className={css({fontStyle: 'italic'})}>&quot;{nickname}&quot;</div>}
          </div>
        </div>
        <div 
          className={css({
            display: 'flex', 
            color: 'gray', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '30px', 
            height: '30px',
            ':hover': { 
              border: '0.1px solid lightgray',
              cursor: 'pointer'
            }
          })} 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <UpOutlined style={{ 
            transform: `rotate(${isExpanded ? '0' : '180'}deg)`,
            transition: 'transform 0.3s ease-in-out', 
          }}/> 
        </div>
      </div>

      <div className={css({
        maxHeight: isExpanded ? '700px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
      })}>
        <Divider /> 

        <BodySection>
          {
            dates.map(({label, content}, i) => (
              <SectionRow 
                key={label} 
                label={label}
                styles={{ marginBottom: i === dates.length - 1 ? '0px' : '10px' }}
              >
                {content}
              </SectionRow>
            ))
          }
        </BodySection>

        <Divider /> 

        <BodySection>
          {
            Object.keys(DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG).map((section, i) => (
              <SectionRow 
                key={i} 
                label={DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG[section].sectionLabel}
              >
                <RelativeContent isTreeEditable={isTreeEditable} displayRelationType={section} />
              </SectionRow>
            ))
          }
        </BodySection>

        { 
          notes && 
          (
            <>
              <Divider /> 
              
              <BodySection>
                <div className={css({
                  fontStyle: 'italic',
                  maxHeight: '100px', 
                  overflow: 'auto', 
                })}>
                  {notes}
                </div>
              </BodySection>
            </>
          )
        }
      </div>
    </Card>
  )     
}
