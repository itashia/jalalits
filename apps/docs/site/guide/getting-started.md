# Introduction and installation

JalaliTS is an ESM-first TypeScript library with separate integration packages. Its `jalalits` package provides immutable Jalali calendar and date-time values. The calendar follows the Borkowski break-year model and supports Jalali years 1 through 3177.

## Installation

```sh
npm install jalalits
```

The framework integrations are separate packages:

```sh
npm install @jalalits/react react
npm install @jalalits/zod zod
npm install @jalalits/temporal
npm install @jalalits/api
```

## Quick start

```ts
import { jalali, JalaliDateTime } from 'jalalits';

const date = jalali('۱۴۰۵/۰۸/۱۹', 'Asia/Tehran');
console.log(date.format('l j F Y'));
console.log(date.addMonths(1).format('Y/m/d'));
const typedValue = JalaliDateTime.parse('۱۴۰۵/۰۸/۱۹', 'Asia/Tehran');
```

Date strings are strict `YYYY/MM/DD`. ASCII, Persian, and Arabic-Indic digits are accepted. Supply a timezone explicitly when local wall-time interpretation matters; otherwise UTC is used. Invalid values throw `InvalidDateError`.
