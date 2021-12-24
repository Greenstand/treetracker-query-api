import mockKnex from 'mock-knex'

import BaseRepository from './BaseRepository'
import knex from './knex'
import Session from './session'

const tracker = mockKnex.getTracker()

describe('BaseRepository', () => {
  let baseRepository: BaseRepository

  beforeEach(() => {
    mockKnex.mock(knex)
    tracker.install()
    const session = new Session()
    baseRepository = new BaseRepository('testTable', session)
  })

  afterEach(() => {
    tracker.uninstall()
    mockKnex.unmock(knex)
  })

  it('getById', async () => {
    tracker.uninstall()
    tracker.install()
    tracker.on('query', (query) => {
      expect(query.sql).toMatch(/select.*testTable.*/)
      query.response([{ id: 1 }])
    })
    const entity = await baseRepository.getById(1)
    expect(entity).toHaveProperty('id', 1)
  })

  //TODO
  it.skip('getById can not find result, should throw 404', () => {})

  describe.only('getByFilter', () => {
    it('getByFilter', async () => {
      tracker.uninstall()
      tracker.install()
      tracker.on('query', (query) => {
        expect(query.sql).toMatch(/select.*testTable.*name.*/)
        query.response([{ id: 1 }])
      })
      const result = await baseRepository.getByFilter({
        name: 'testName',
      })
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('id', 1)
    })

    it('getByFilter with limit', async () => {
      tracker.uninstall()
      tracker.install()
      tracker.on('query', (query) => {
        expect(query.sql).toMatch(/select.*testTable.*limit.*/)
        query.response([{ id: 1 }])
      })
      const result = await baseRepository.getByFilter(
        {
          name: 'testName',
        },
        {
          limit: 1,
        },
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('id', 1)
    })

    describe("'and' 'or' phrase", () => {
      it('{and: [{c:1}, {b:2}]}', async () => {
        tracker.uninstall()
        tracker.install()
        tracker.on('query', (query) => {
          expect(query.sql).toMatch(
            /select.*testTable.*where.*c1.*=.*and.*c2.*=.*/,
          )
          query.response([{ id: 1 }])
        })
        const result = await baseRepository.getByFilter({
          and: [
            {
              c1: 1,
            },
            {
              c2: 2,
            },
          ],
        })
        expect(result).toHaveLength(1)
        expect(result[0]).toHaveProperty('id', 1)
      })

      it('{or: [{c:1}, {b:2}]}', async () => {
        tracker.uninstall()
        tracker.install()
        tracker.on('query', (query) => {
          expect(query.sql).toMatch(
            /select.*testTable.*where.*c1.*=.*or.*c2.*=.*/,
          )
          query.response([{ id: 1 }])
        })
        const result = await baseRepository.getByFilter({
          or: [
            {
              c1: 1,
            },
            {
              c2: 2,
            },
          ],
        })
        expect(result).toHaveLength(1)
        expect(result[0]).toHaveProperty('id', 1)
      })

      it('{and: [{c:1}, {b:2}, {or: [{d:1}, {e:1}]]}', async () => {
        tracker.uninstall()
        tracker.install()
        tracker.on('query', (query) => {
          expect(query.sql).toMatch(
            /select.*testTable.*where.*c1.*=.*and.*c2.*=.*and.*c3.*or.*c4.*/,
          )
          query.response([{ id: 1 }])
        })
        const result = await baseRepository.getByFilter({
          and: [
            {
              c1: 1,
            },
            {
              c2: 2,
            },
            {
              or: [
                {
                  c3: 1,
                },
                {
                  c4: 1,
                },
              ],
            },
          ],
        })
        expect(result).toHaveLength(1)
        expect(result[0]).toHaveProperty('id', 1)
      })

      it('{or: [{c:1}, {b:2}, {and: [{d:1}, {e:1}]]}', async () => {
        tracker.uninstall()
        tracker.install()
        tracker.on('query', (query) => {
          console.log('sql:', query.sql)
          expect(query.sql).toMatch(
            /select.*testTable.*where.*c1.*=.*or.*c2.*=.*or.*c3.*and.*c4.*/,
          )
          query.response([{ id: 1 }])
        })
        const result = await baseRepository.getByFilter({
          or: [
            {
              c1: 1,
            },
            {
              c2: 2,
            },
            {
              and: [
                {
                  c3: 1,
                },
                {
                  c4: 1,
                },
              ],
            },
          ],
        })
        expect(result).toHaveLength(1)
        expect(result[0]).toHaveProperty('id', 1)
      })

      it('(a=1 and b =2) or (a=2 and b=1)', async () => {
        tracker.uninstall()
        tracker.install()
        tracker.on('query', (query) => {
          console.log('sql:', query.sql)
          expect(query.sql).toMatch(
            /select.*testTable.*where.*c3.*=.*and.*c4.*=.*or.*c3.*and.*c4.*/,
          )
          query.response([{ id: 1 }])
        })
        const result = await baseRepository.getByFilter({
          or: [
            {
              and: [
                {
                  c3: 1,
                },
                {
                  c4: 2,
                },
              ],
            },
            {
              and: [
                {
                  c3: 2,
                },
                {
                  c4: 1,
                },
              ],
            },
          ],
        })
        expect(result).toHaveLength(1)
        expect(result[0]).toHaveProperty('id', 1)
      })
    })
  })

  describe('update', () => {
    it('update', async () => {
      tracker.uninstall()
      tracker.install()
      tracker.on('query', (query) => {
        expect(query.sql).toMatch(/update.*testTable.*/)
        query.response({ id: 1 })
      })
      const result = await baseRepository.update({
        id: 1,
        name: 'testName',
      })
      expect(result).toHaveProperty('id', 1)
    })
  })

  describe('create', () => {
    it('create', async () => {
      tracker.uninstall()
      tracker.install()
      tracker.on('query', (query) => {
        expect(query.sql).toMatch(/insert.*testTable.*returning.*/)
        query.response([{ id: 1 }])
      })
      const result = await baseRepository.create({
        name: 'testName',
      })
      expect(result).toHaveProperty('id', 1)
    })
  })

  describe('countByFilter', () => {
    it('successfully', async () => {
      tracker.uninstall()
      tracker.install()
      tracker.on('query', (query) => {
        expect(query.sql).toMatch(/.*count.*column.*/)
        query.response([
          {
            count: '1',
          },
        ])
      })
      const result = await baseRepository.countByFilter({
        column: 'testColumn',
      })
      expect(result).toBe(1)
    })

    //TODO
    describe.skip('count support and and or', () => {})
  })
})
