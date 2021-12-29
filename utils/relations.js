import {RELATION_TYPES} from '../constants/relation-types'; 

export function getRelationColor(relationType) { 
  return relationType === RELATION_TYPES.PARENT_CHILD ? 'blue' : 'purple'; 
}