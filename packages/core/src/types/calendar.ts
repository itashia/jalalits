export interface JalaliDateFields {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export interface GregorianDateFields {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export interface DateTimeFields extends JalaliDateFields {
  readonly hour?: number;
  readonly minute?: number;
  readonly second?: number;
  readonly millisecond?: number;
  readonly microsecond?: number;
  /** Nanoseconds since the start of the second; takes precedence over lower precision fields. */
  readonly nanosecond?: number;
}
