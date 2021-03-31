export default class StatusError extends Error {
  public status: number

  public constructor (status: number, message?: string) {
    super(message)
    this.status = status
  }
}
