/** Raised when a date, time, timezone, or format is invalid or out of range. */
export class InvalidDateError extends RangeError {
  public override readonly name = 'InvalidDateError';

  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
