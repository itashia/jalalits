import { zJalaliDate } from '@jalalits/zod';

export const bookingFormSchema = zJalaliDate({
  min: '1300/01/01',
  max: '1500/12/29',
  locale: 'fa',
});
export const validBookingDate = bookingFormSchema.parse('۱۴۰۵/۰۸/۱۹');
console.log(validBookingDate.format('Y/m/d'));
