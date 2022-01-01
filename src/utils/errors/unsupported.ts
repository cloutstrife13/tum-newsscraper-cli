import { ErrorName } from '../enums'

export class UnsupportedError extends Error {
  constructor(msg: string) {
    super(msg)

    this.name = ErrorName.UnsupportedError

    Object.setPrototypeOf(this, UnsupportedError.prototype)
  }
}
