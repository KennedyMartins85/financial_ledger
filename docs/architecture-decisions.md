# Architecture Decisions

This document explains the main technical decisions behind the financial ledger design.

The goal of this project is to build a financial ledger with clear domain boundaries, auditable money movement, and consistency rules based on double-entry bookkeeping.

## User vs Account

`User` represents identity and authentication.

It stores data such as:

- name
- email
- password hash

`Account` represents a financial account inside the ledger.

It stores data such as:

- account owner
- account type
- currency
- current balance

These concepts are separated because a user is not the same thing as a financial account.

A user may own multiple accounts. For example:

- main wallet
- savings wallet
- bonus wallet

The system can also have internal accounts that do not belong to any user. For example:

- platform fee account
- revenue account
- escrow account
- adjustment account

This separation keeps authentication concerns away from financial ledger concerns.

## Double-Entry Bookkeeping

The ledger follows the idea of double-entry bookkeeping.

In double-entry bookkeeping, every posted financial event must have matching debit and credit totals.

For example, if one user sends `$100.00` to another user:

- sender account receives a debit of `10000`
- receiver account receives a credit of `10000`

The transaction is balanced because:

```txt
total debits = 10000
total credits = 10000
```

This prevents money from being created or destroyed by accident.

## LedgerTransaction vs LedgerEntry

`LedgerTransaction` represents the financial event.

Examples:

- user transfer
- deposit
- withdrawal
- platform fee
- reversal

`LedgerEntry` represents each debit or credit created by that event.

For a simple transfer, one `LedgerTransaction` creates at least two `LedgerEntry` records:

```txt
LedgerTransaction: Kennedy sends $100.00 to Maria

LedgerEntry:
- Kennedy wallet: DEBIT 10000
- Maria wallet: CREDIT 10000
```

This design is more flexible than storing only `sourceAccountId`, `destinationAccountId`, and `amount` directly on a transaction.

It supports flows such as fees, escrow, cashback, adjustments, and reversals without changing the core model.

## Debit and Credit Entries

`LedgerEntry.amount` is always stored as a positive integer.

The effect on the account is represented by `EntryType`:

```txt
DEBIT  = decreases the account balance in this wallet model
CREDIT = increases the account balance in this wallet model
```

Example:

```txt
Kennedy sends $100.00 to Maria

Kennedy wallet:
type: DEBIT
amount: 10000

Maria wallet:
type: CREDIT
amount: 10000
```

The main invariant is:

```txt
total DEBIT amount must equal total CREDIT amount
```

This makes the transaction balanced and easier to audit.

## Account Balance

`Account.balance` is kept as a materialized balance.

That means the current balance is stored directly on the account for fast reads.

For example, the dashboard can show:

```txt
Current balance: $250.00
```

without recalculating the full transaction history every time.

The ledger entries still remain the auditable source of truth.

This means:

- `Account.balance` is optimized for performance
- `LedgerEntry` explains how the balance was reached

The system can run reconciliation checks by comparing:

```txt
Account.balance
```

with the balance computed from all related ledger entries.

## Idempotency

`LedgerTransaction.idempotencyKey` prevents duplicated financial operations.

This is important because network requests can be retried.

Example:

1. The user sends `$100.00`.
2. The backend processes the transfer.
3. The network fails before the frontend receives the response.
4. The frontend retries the same request.

Without idempotency, the user could be charged twice.

With `idempotencyKey`, the same operation cannot create multiple ledger transactions.

The database enforces this using a unique constraint.

## Reversals

Ledger history should be immutable.

If a financial operation needs to be corrected, the original transaction is not deleted.

Instead, the system creates a new reversing transaction.

Example original transaction:

```txt
Kennedy wallet: DEBIT 10000
Maria wallet: CREDIT 10000
```

Example reversal transaction:

```txt
Kennedy wallet: CREDIT 10000
Maria wallet: DEBIT 10000
```

The original transaction can then be marked as `REVERSED`, and the reversal transaction stores a reference to it through `originalTransactionId`.

This preserves the audit trail and makes corrections traceable.

## Money in Minor Units

Money is stored as integers in minor currency units.

For USD:

```txt
$10.50 = 1050 cents
$100.00 = 10000 cents
```

The project uses `BigInt` for monetary values to avoid floating-point precision issues.

The system should not store money as `Float` or `Decimal` in application logic unless there is a specific reason and careful handling.

Using integer minor units makes calculations predictable and safer.

## Ledger Rules

The ledger enforces these rules in the service layer:

- a posted transaction must have at least two entries
- each entry amount must be greater than zero
- total debit amount must equal total credit amount
- all entries in the same transaction should use the same currency
- account balances must be updated atomically with ledger entries
- the same idempotency key cannot create two transactions
- reversals must create new entries instead of deleting old ones

## Cache Decision

This project does not use Redis or any external cache for account balances.

Financial consistency is more important than caching reads that can become stale.

The system keeps `Account.balance` as a fast read model in PostgreSQL and updates it atomically together with ledger entries.

This keeps the balance read path simple, consistent, and easy to audit.

Redis is intentionally not part of the core architecture because the current requirements are handled by PostgreSQL:

- durable ledger storage
- transactional balance updates
- idempotency through unique constraints
- indexed account statements
- auditable reversal history

Avoiding Redis here is a deliberate architecture decision, not a missing feature.
