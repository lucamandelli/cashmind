---
type: log
status: current
updated: 2026-06-09
summary: Transaction date can shift by a day if stored/parsed as a timestamp instead of a DATE.
tags: [log, gotcha, dates]
---

# 0001 — Transaction date shifts by one day

## Symptom

A transaction logged on the 8th shows up on the 7th, and lands in the wrong
month on reports.

## Cause

Treating the transaction date as a timestamp and converting through UTC ↔ local
time. The calendar day gets shifted across the timezone boundary.

## Fix

Store the transaction date as a `DATE` (no time, no timezone). Carry it over the
wire as a plain `"YYYY-MM-DD"` string (validated by Zod), and format for pt-BR
only at the UI edge with date-fns. `created_at` / `updated_at` stay `timestamptz`.

## Where

- [[transactions]] (API) · [[log-expense]] (feature)

Parent: [[log-index]]
