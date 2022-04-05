import moment from 'moment'; 
import converter from 'number-to-words'; 
import {RELATION_TYPES} from '../constants/relation-types'; 

export function findPath(from, to, cy) { 
  const pathNodes = []; 
  const pathEdges = []; 

  if (!from || !to) { 
    return {
      pathNodes,
      pathEdges, 
    }
  }

  const f = "#" + from; 
  const t = "#" + to; 

  const dijkstra = cy.elements().dijkstra({
    root: f,
    directed: false,
  });

  const pathToJ = dijkstra.pathTo(cy.$(t));
  pathToJ.forEach(function(el) { 
    if (el.isNode()) {
      pathNodes.push(el.data('id')); 
    }

    if (el.isEdge()) { 
      pathEdges.push(el.data('id')); 
    }
  });

  return {
    pathNodes,
    pathEdges
  }; 
}; 

export function getRelation(people, relations) { 
  if (people.length === 0 || relations.length === 0) { 
    return '--';
  }

  people.reverse(); 
  relations.reverse(); 
  
  const source = people[0]; 
  const target = people[people.length-1];   

  let prefixStr = `${target.first_name} is ${source.first_name}'s `; 

  let parentCount = 0; 
  let childCount = 0; 
  let spouseCount = 0; 

  const isLastMale = target.is_male;  
  let relationStr = ''; 

  relations.forEach(({type}, i) => { 
    const a = people[i]; 
    const b = people[i+1]; 
    const isOlder = moment(b.birth_date).isBefore(moment(a.birth_date));
    
    if (type === RELATION_TYPES.PARENT_CHILD) { 
      if (isOlder) {
        parentCount++; 
      } else {
        childCount++; 
      }
    } else if (type === RELATION_TYPES.SPOUSE || type === RELATION_TYPES.EX_SPOUSE) { 
      spouseCount++; 
    }
  });

  // same generation, no spouses 
  if (parentCount === childCount && spouseCount === 0) { 
    if (parentCount === 1) { 
      relationStr = isLastMale ? "brother" : "sister"; 
    } else { 
      relationStr = `${converter.toWordsOrdinal(parentCount-1)} cousin`; 
    }
  }

  // same generation, spouse
  if (parentCount === childCount && spouseCount === 1) { 
    if (parentCount === 0) { 
      relationStr = isLastMale ? "husband" : "wife"; 
    } else if (parentCount === 1) { 
      relationStr = isLastMale ? "brother-in-law" : "sister-in-law"; 
    } else { 
      relationStr = `${converter.toWordsOrdinal(parentCount-1)} cousin-in-law`; 
    }
  }

  // lower generation, no spouse 
  if (childCount > parentCount && spouseCount === 0) { 
    if (parentCount === 0) { 
      relationStr = `${getGrandPrefix(childCount-parentCount-1)}${isLastMale ? "son" : "daughter"}`;  
    } else { 
      relationStr = `${getGrandPrefix(childCount-parentCount-1)}${isLastMale ? "nephew" : "niece"}`; 
    }
  }

  // lower generation, spouse 
  if (childCount > parentCount && spouseCount === 1) { 
    if (parentCount === 0) { 
      relationStr = `${getGrandPrefix(childCount-parentCount-1)}${isLastMale ? "son-in-law" : "daughter-in-law"}`;  
    } else { 
      relationStr = `${getGrandPrefix(childCount-parentCount-1)}${isLastMale ? "nephew-in-law" : "niece-in-law"}`; 
    }
  }
  
  // higher generation, no spouse 
  if (parentCount > childCount && spouseCount === 0) { 
    if (childCount === 0) { 
      relationStr = `${getGrandPrefix(parentCount-childCount-1)}${isLastMale ? "father" : "mother"}`; 
    } else { 
      relationStr = `${getGrandPrefix(parentCount-childCount-1)}${isLastMale ? "uncle" : "aunt"}`; 
    }
  }

  // higher generation, spouse 
  if (parentCount > childCount && spouseCount === 1) { 
    if (childCount === 0) { 
      relationStr = `${getGrandPrefix(parentCount-childCount-1)}${isLastMale ? "father-in-law" : "mother-in-law"}`; 
    } else { 
      relationStr = `${getGrandPrefix(parentCount-childCount-1)}${isLastMale ? "uncle-in-law" : "aunt-in-law"}`; 
    }
  }

  if (!relationStr) { 
    return `${prefixStr} ${getRawRelation(people, relations)}.`; 
  }

  return `${prefixStr} ${relationStr}.`; 
}; 

function getGrandPrefix(numGrands) { 
  if (numGrands === 0) { 
    return ""; 
  }
  if (numGrands === 1) {
    return "grand"; 
  }
 
  const greatCount = Array(numGrands-1).fill().map(i => "great-").join(""); 
  return `${greatCount}grand`; 
} 

function getRawRelation(people, relations) { 
  let str = ''; 
  const specificRelations = relations.map(({type}, i) => { 
    const a = people[i]; 
    const b = people[i+1]; 
    const isOlder = moment(b.birth_date).isBefore(moment(a.birth_date)); 
    const isMale = b.is_male;  

    if (type === "SIBLING") { 
      return isMale ? "brother" : "sister"; 
    }
    else if (type === RELATION_TYPES.PARENT_CHILD) { 
      if (isOlder) {
        return isMale ? "father" : "mother"; 
      } else { 
        return isMale ? "son" : "daughter"; 
      }
    }
    else if (type === RELATION_TYPES.SPOUSE) { 
      return isMale ? "husband" : "wife"; 
    } else if (type === RELATION_TYPES.EX_SPOUSE) { 
      return isMale ? "ex-husband" : "ex-wife"; 
    }
  });
  
  for (let i = 0; i < specificRelations.length-1; i++) { 
    str += specificRelations[i] + "\'s "; 
  }
  str += specificRelations[specificRelations.length-1];
  return str;  
}

export function getRelationEdgeColor(relationType) { 
  return relationType === RELATION_TYPES.PARENT_CHILD 
    ? 'blue' 
    : 'purple'; 
}

export function getIsRelationEdgeDashed(relationType) { 
  return relationType === RELATION_TYPES.EX_SPOUSE; 
}