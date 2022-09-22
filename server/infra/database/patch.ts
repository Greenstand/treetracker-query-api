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

  let result = object;
  if (object instanceof Array) {
    const ids = object.map((o) => parseInt(o.id));

    const res = await session.getDB().raw(
      `
        select data, ref_id from webmap.config where name = '${configName}' and ref_id in (${ids.join(
        ',',
      )})
  `,
    );

    if (res.rows.length > 0) {
      result = [];
      log.debug('found result, patch');
      object.forEach((o) => {
        const extra = res.rows.find(
          (r) => parseInt(r.ref_id) === parseInt(o.id),
        );
        if (extra) {
          result.push({ ...o, ...extra.data });
        } else {
          result.push(o);
        }
      });
    }
  } else {
    const res = await session.getDB().raw(`
      select data from webmap.config where name = '${configName}' and ref_id = ${object.id}
    `);

    if (res.rows.length === 1) {
      log.debug('found result, patch');
      result = { ...object, ...res.rows[0].data };
    }
  }

  return result;
}

export default patch;
