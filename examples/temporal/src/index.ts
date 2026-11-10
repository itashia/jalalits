import { Temporal } from '@js-temporal/polyfill';
import { fromTemporalInstant, toTemporalInstant } from '@jalalits/temporal';

const input = Temporal.Instant.from('2026-11-10T12:30:45.123456789Z');
const jalali = fromTemporalInstant(input, 'Asia/Tehran');
const output = toTemporalInstant(jalali, Temporal);
console.log(jalali.format('Y/m/d H:i:s.u'), output.epochNanoseconds.toString());
