import {RELATION_TYPES} from '../constants/relation-types'; 

export function getRelationEdgeColor(relationType) { 
  return relationType === RELATION_TYPES.PARENT_CHILD 
    ? 'blue' 
    : 'purple'; 
}

export function getIsRelationEdgeDashed(relationType) { 
  return relationType === RELATION_TYPES.EX_SPOUSE; 
}