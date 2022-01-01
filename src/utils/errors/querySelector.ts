import { ErrorName } from '../enums'

export class QuerySelectorError extends Error {
  constructor() {
    super()

    this.name = ErrorName.QuerySelector

    Object.setPrototypeOf(this, QuerySelectorError.prototype)
  }
}
