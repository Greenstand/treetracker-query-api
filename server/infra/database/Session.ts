import { Knex } from 'knex'

import knex from './knex'

export default class Session {
  transaction: Knex.Transaction | undefined

  constructor() {
    this.transaction = undefined
  }

  getDB() {
    if (this.transaction) {
      return this.transaction
    }
    return knex
  }

  isTransactionInProgress() {
    return this.transaction !== undefined
  }

  async beginTransaction() {
    if (this.transaction) {
      throw new Error('Can not start transaction in transaction')
    }
    this.transaction = await knex.transaction()
  }

  async commitTransaction() {
    if (!this.transaction) {
      throw new Error('Can not commit transaction before start it!')
    }
    await this.transaction.commit()
    this.transaction = undefined
  }

  async rollbackTransaction() {
    if (!this.transaction) {
      throw new Error('Can not rollback transaction before start it!')
    }
    await this.transaction.rollback()
    this.transaction = undefined
  }
}
