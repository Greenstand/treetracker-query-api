import log from 'loglevel';
import Session from './Session';

// enum
export enum PATCH_TYPE {
  EXTRA_PLANTER = 'extra_planter',
  EXTRA_ORG = 'extra_organization',
  EXTRA_WALLET = 'extra_wallet',
}

async function patch(object: any, patchType: PATCH_TYPE, session: Session) {
  let configName;
  switch (patchType) {
    case PATCH_TYPE.EXTRA_PLANTER:
      configName = 'extra-planter';
      break;
    case PATCH_TYPE.EXTRA_ORG:
      configName = 'extra-organization';
      break;
    case PATCH_TYPE.EXTRA_WALLET:
      configName = 'extra-wallet';
      break;
    default:
      throw new Error('Invalid patch type');
  }

  let result = object;
  if (object instanceof Array) {
    if (object.length > 0) {
      const ids = object.map((o) => o.id);

      const res = await session.getDB().raw(
        `
        select data, ref_id from webmap.config where name = '${configName}' and ref_id in (${ids
          .map((e) => `'${e}'`)
          .join(',')})
      `,
      );

      if (res.rows.length > 0) {
        result = [];
        log.debug('found result, patch');
        object.forEach((o) => {
          const extra = res.rows.find((r) => r.ref_id === o.id);
          if (extra) {
            if (patchType === PATCH_TYPE.EXTRA_WALLET) {
              delete extra.data?.about;
            }
            result.push({ ...o, ...extra.data });
          } else {
            result.push(o);
          }
        });
      }
    }
  } else {
    const res = await session.getDB().raw(`
      select data from webmap.config where name = '${configName}' and ref_id = '${object.id}'
    `);

    if (res.rows.length === 1) {
      log.debug('found result, patch');
      const patchData = res.rows[0];
      if (patchType === PATCH_TYPE.EXTRA_WALLET) {
        delete patchData.data?.about;
      }
      result = { ...object, ...patchData.data };
    }
  }

  return result;
}

export default patch;
