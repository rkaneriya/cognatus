import moment from "moment";
import { useState, useContext } from "react";
import {
  Card,
  Avatar,
  Tooltip,
  Tabs,
  Popconfirm,
  Upload,
  Divider as AntDivider,
} from "antd";
import {
  UpOutlined,
  CloseCircleOutlined,
  UserOutlined,
  EditOutlined,
  ApartmentOutlined,
  PieChartOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { pluralize } from "../utils/pluralize";
import { MemberRelationContext } from "../data/contexts/member-relation";
import { RelativeContent } from "./relative-content";
import { DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG } from "../constants/display-relation-types";
import QueryRelationTab from "../components/query-relation-tab";
import StatsTab from "./stats-tab";
import { isMobile } from "react-device-detect";

const FULL_DATE_FORMAT = "ll";
const YEAR_DATE_FORMAT = "y";
const FILE_SIZE_LIMIT_IN_BYTES = 50000; // 50 KB
const SUPPORTED_FILE_TYPES = ["image/png", "image/jpeg"];

function Name({ children }) {
  return (
    <div className="uppercase font-semibold break-words text-base w-full">
      {children}
    </div>
  );
}

function Divider() {
  return <AntDivider style={{ margin: "16px 0px" }} />;
}

function SectionRow({ label, children, isLastSection }) {
  return (
    <div className={`w-full flex flex-row ${!isLastSection && "mb-[10px]"}`}>
      <div className="flex justify-end mr-4 font-semibold w-[35%]">{label}</div>
      <div className="flex flex-col w-[65%]">{children}</div>
    </div>
  );
}

function BodySection({ children }) {
  return <div className="flex flex-col items-start w-full">{children}</div>;
}

function DeleteButton({ onClick }) {
  return (
    <Tooltip placement="bottom" title="Delete">
      <Popconfirm title="Are you sure?" okText="Yes" onConfirm={onClick}>
        <DeleteOutlined key="delete" />
      </Popconfirm>
    </Tooltip>
  );
}

function EditButton({ onClick }) {
  return (
    <Tooltip placement="bottom" title="Edit">
      <EditOutlined key="edit" onClick={onClick} />
    </Tooltip>
  );
}

function CloseButton({ onClick }) {
  return (
    <Tooltip placement="bottom" title="Dismiss">
      <CloseCircleOutlined key="close" onClick={onClick} />
    </Tooltip>
  );
}

function ProfileTabLabel({ name }) {
  return (
    <Tooltip placement="top" title={`View information about ${name}`}>
      <UserOutlined /> Profile
    </Tooltip>
  );
}

function QueryRelationTabLabel({ name }) {
  return (
    <Tooltip
      placement="top"
      title={`Discover how others are related to ${name}`}
    >
      <ApartmentOutlined /> Relations
    </Tooltip>
  );
}

function StatsTabLabel() {
  return (
    <Tooltip
      placement="top"
      title="View interesting stats about the people in your tree"
    >
      <PieChartOutlined /> Stats
    </Tooltip>
  );
}

function DateSection() {
  const { selectedMemberUuid, membersByUuid } = useContext(
    MemberRelationContext
  );

  const { birth_date, death_date, use_year_only } =
    membersByUuid[selectedMemberUuid] || {};

  const mBirthDate = moment(birth_date);
  const mDeathDate = moment(death_date);
  const formattedBirthDate = mBirthDate.format(
    use_year_only ? YEAR_DATE_FORMAT : FULL_DATE_FORMAT
  );
  const formattedDeathDate = mDeathDate.format(
    use_year_only ? YEAR_DATE_FORMAT : FULL_DATE_FORMAT
  );
  const age = death_date
    ? mDeathDate.diff(mBirthDate, "years")
    : moment().diff(mBirthDate, "years");
  const deadYears = moment().diff(mDeathDate, "years");
  const dates = [];
  if (birth_date) {
    dates.push({
      label: "BORN",
      content: (
        <>
          {formattedBirthDate} ({pluralize(age, "year")})
        </>
      ),
    });
  }
  if (death_date) {
    dates.push({
      label: "DECEASED",
      content: (
        <>
          {formattedDeathDate} ({pluralize(deadYears, "year")} ago)
        </>
      ),
    });
  }

  return (
    <BodySection>
      {dates.map(({ label, content }, i) => (
        <SectionRow
          key={label}
          label={label}
          isLastSection={i === dates.length - 1}
        >
          {content}
        </SectionRow>
      ))}
    </BodySection>
  );
}

function NotesSection() {
  const { selectedMemberUuid, membersByUuid } = useContext(
    MemberRelationContext
  );

  const { notes } = membersByUuid[selectedMemberUuid] || {};

  if (!notes) {
    return null;
  }

  return (
    <>
      <Divider />
      <BodySection>
        <div className="italic max-h-[100px] overflow-auto">{notes}</div>
      </BodySection>
    </>
  );
}

export default function MemberCard({
  onAddNewMemberAndRelation,
  onEditMember,
  onEditRelation,
  isExpanded,
  setIsExpanded,
}) {
  const [editableSection, setEditableSection] = useState(null);

  const {
    deleteMemberAndRelations,
    selectedMemberUuid,
    isTreeEditable,
    membersByUuid,
    loading,
    uploadAvatar,
    deleteAvatar,
    setSelectedMemberUuid,
    setTargetRelativeUuid,
  } = useContext(MemberRelationContext);

  const {
    first_name,
    last_name,
    birth_date,
    maiden_name,
    nickname,
    is_male,
    photo_path,
  } = membersByUuid[selectedMemberUuid] || {};

  const displayName =
    `${first_name} ${last_name}` + (maiden_name ? ` (${maiden_name})` : "");
  const mBirthDate = moment(birth_date);
  const isBirthday =
    moment().date() === mBirthDate.date() &&
    moment().month() === mBirthDate.month();

  const actions = [
    <EditButton key="edit" onClick={onEditMember} />,
    <DeleteButton
      key="add_relation"
      onClick={() => deleteMemberAndRelations(selectedMemberUuid)}
    />,
    <CloseButton key="close" onClick={() => setSelectedMemberUuid(null)} />,
  ];

  async function handleUploadFile({ file }) {
    if (!SUPPORTED_FILE_TYPES.includes(file?.type)) {
      alert("File must be a JPEG or PNG image.");
      return;
    }

    if (file?.size > FILE_SIZE_LIMIT_IN_BYTES) {
      alert("Photo size must not exceed 50 KB.");
      return;
    }

    if (file?.status === "done") {
      uploadAvatar(file?.originFileObj);
    }
  }

  async function handleRemoveAvatar() {
    deleteAvatar(photo_path);
  }

  function onHandleTargetClick(target) {
    setSelectedMemberUuid(target.uuid);
    setTargetRelativeUuid(null);
    setIsExpanded(false);
  }

  let filename = is_male ? "/male.jpg" : "/female.jpg";
  if (photo_path) {
    filename = photo_path;
  }

  const cardStyles = isMobile
    ? {
        zIndex: 1,
        position: "absolute",
        top: 0,
        backgroundColor: "white",
        width: "100%",
        boxShadow: "-1px 2px 5px 2px rgba(0, 0, 0, 0.2)",
        maxHeight: "85vh",
        overflow: "auto",
      }
    : {
        zIndex: 1,
        position: "absolute",
        top: 20,
        left: 20,
        margin: "20px",
        backgroundColor: "white",
        width: "380px",
        boxShadow: "-1px 2px 5px 2px rgba(0, 0, 0, 0.2)",
        maxHeight: "85vh",
        overflow: "auto",
      };

  const tabs = [
    {
      key: "1",
      label: <ProfileTabLabel name={first_name} />,
      children: (
        <>
          {" "}
          <DateSection />
          <Divider />
          <BodySection>
            {Object.keys(DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG).map(
              (section, i) => (
                <SectionRow
                  key={i}
                  label={
                    DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG[section]
                      .sectionLabel
                  }
                >
                  <RelativeContent
                    isEditable={editableSection === section}
                    displayRelationType={section}
                    onAddNewMemberAndRelation={onAddNewMemberAndRelation}
                    onEditRelation={onEditRelation}
                    setEditableSection={setEditableSection}
                  />
                </SectionRow>
              )
            )}
          </BodySection>
          <NotesSection />
        </>
      ),
    },
    {
      key: "2",
      label: <QueryRelationTabLabel name={first_name} />,
      children: (
        <QueryRelationTab onSelectTargetInRelation={onHandleTargetClick} />
      ),
    },
    {
      key: "3",
      label: <StatsTabLabel />,
      children: <StatsTab />,
    },
    // {
    //   key: "4",
    //   label: (
    //     <span>
    //       <CalendarOutlined /> Events
    //     </span>
    //   ),
    //   children: null,
    // },
  ];

  return (
    <Card
      style={cardStyles}
      actions={isTreeEditable ? actions : undefined}
      loading={loading}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isTreeEditable && false ? (
            <div className="flex flex-col items-center">
              <Tooltip title="Click to upload new photo">
                <Upload showUploadList={false} onChange={handleUploadFile}>
                  <Avatar
                    src={filename}
                    size={50}
                    style={{ cursor: "pointer" }}
                  />
                </Upload>
              </Tooltip>
              {Boolean(photo_path) && (
                <a onClick={handleRemoveAvatar} className="text-[10px]">
                  Clear
                </a>
              )}
            </div>
          ) : (
            <Avatar src={filename} size={50} />
          )}
          <div className="flex flex-col items-start w-56 ml-5">
            <Name>
              {displayName}
              {isBirthday ? " 🎂" : ""}
            </Name>
            {nickname && <div className="italic">&quot;{nickname}&quot;</div>}
          </div>
        </div>
        <div
          className="flex text-gray-500 justify-center items-center w-8 h-8 hover:border-[0.1px] hover:border-solid hover:cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <UpOutlined
            style={{
              transform: `rotate(${isExpanded ? "0" : "180"}deg)`,
              transition: "transform 0.3s ease-in-out",
            }}
          />
        </div>
      </div>

      <div
        className={`overflow-hidden ${isExpanded ? "max-h-[700px]" : "max-h-0"} transition-[max-height] duration-[0.3s] ease-in-out`}
      >
        <Divider />
        <Tabs defaultActiveKey="1" items={tabs} type="card" size="small"></Tabs>
      </div>
    </Card>
  );
}
