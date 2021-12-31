import { MEMBER_RELATION_ACTIONS } from "./member-relation-actions";
import { RELATION_TYPES } from "./relation-types";

export const DISPLAY_RELATION_TYPES = { 
  PARENT: 'parent', 
  CHILD: 'child', 
  SPOUSE: 'spouse',
  EX_SPOUSE: 'ex_spouse', 
}; 

export const DISPLAY_RELATION_TYPE_TO_SECTION_ROW_CONFIG = {
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
