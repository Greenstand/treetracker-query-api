import log from 'loglevel';
import Session from './Session';

// enum
export enum PATCH_TYPE {
  EXTRA_PLANTER = 'extra_planter',
  EXTRA_TREE = 'extra_tree',
}

async function patch(object: any, patchType: PATCH_TYPE, session: Session) {
  let configName;
  switch (patchType) {
    case PATCH_TYPE.EXTRA_PLANTER:
      configName = 'extra-planter';
      break;
    case PATCH_TYPE.EXTRA_TREE:
      configName = 'extra-tree';
      break;
    default:
      throw new Error('Invalid patch type');
  }

  const res = await session.getDB().raw(`
    select data from webmap.config where name = '${configName}' and ref_id = ${object.id}
  `);

  let result = object;

  if (res.rows.length === 1) {
    log.debug('found result, patch');
    result = { ...object, ...res.rows[0].data };
  }

  return result;
}

export default patch;
