# HW10. Transactions, Isolations, Locks
### How to start
```bash
docker-compose up
```
### Tables
1. Percona
    ```mysql
    USE db;
    
    CREATE TABLE account_balance (
       id INT PRIMARY KEY,
       balance DECIMAL(10, 2)
   ) ENGINE=InnoDB;
    ```
1. PostgreSQL
    ```postgresql
    \c db;
    
    CREATE TABLE account_balance (
     id SERIAL PRIMARY KEY,
     balance NUMERIC NOT NULL
   );
    ```

### DB comparison
Default isolations levels:
- MySQL - `REPEATABLE-READ`
- PostgreSQL - `READ COMMITTED`

| Phenomenon              | MySQL                         | Percona                       | PostgreSQL                   |
|-------------------------|-------------------------------|-------------------------------|------------------------------|
| **Lost Update**         | Shallow correct update        | Shallow correct update        | Throws an error(not allowed) |
| **Dirty Read**          | Allowed in `READ UNCOMMITTED` | Allowed in `READ UNCOMMITTED` | -                            |
| **Non-repeatable Read** | Allowed in `READ COMMITTED`   | Allowed in `READ COMMITTED`   | Allowed in `READ COMMITTED`  |
| **Phantom Read**        | Allowed in `REPEATABLE-READ`  | Allowed in `READ COMMITTED`   | Allowed in `READ COMMITTED`  |


### Dictionary
#### Lost update
The "lost update" problem is a concurrency control issue in database systems. It occurs when two (or more) transactions retrieve the same row, make changes based on the row's original state, and then write the row back to the database. When the second transaction writes its changes, it might overwrite the changes made by the first transaction, leading to the first transaction's updates being "lost".

| Step | Session A                                                         | Session B                                                         | Account Balance (Expected) | Comments                                                                                   |
|------|-------------------------------------------------------------------|-------------------------------------------------------------------|----------------------------|--------------------------------------------------------------------------------------------|
| 1    | `BEGIN;`                                                          |                                                                   | 100.00                     | Start transaction in Session A.                                                            |
| 2    | `SELECT balance FROM account_balance WHERE id = 1;`               |                                                                   | 100.00                     | Read initial balance in Session A.                                                         |
| 3    |                                                                   | `BEGIN;`                                                          | 100.00                     | Start transaction in Session B.                                                            |
| 4    |                                                                   | `SELECT balance FROM account_balance WHERE id = 1;`               | 100.00                     | Read initial balance in Session B.                                                         |
| 5    |                                                                   | `UPDATE account_balance SET balance = balance + 20 WHERE id = 1;` | 120.00                     | Session B updates the balance.                                                             |
| 6    | `UPDATE account_balance SET balance = balance + 30 WHERE id = 1;` |                                                                   | 130.00                     | Session A updates based on outdated read.                                                  |
| 7    | `COMMIT;`                                                         |                                                                   | 130.00                     | Session A commits.                                                                         |
| 8    |                                                                   | `COMMIT;`                                                         | 130.00                     | Session B commits.                                                                         |
| 9    | Result: `SELECT balance FROM account_balance WHERE id = 1;`       |                                                                   | 130.00                     | The expected balance is 150.00, but due to the lost update problem, we end up with 130.00. |


#### Dirty read
 A "dirty read" in SQL refers to a situation where one transaction reads uncommitted changes made by another transaction. This can lead to inconsistencies and unpredictable results, as the read data may not reflect the final state of the data after all transactions have been completed.

| Step | Action                          | SQL Session A                                                          | SQL Session B                                               | Account Balance (Expected) | Comments                              |
|------|---------------------------------|------------------------------------------------------------------------|-------------------------------------------------------------|----------------------------|---------------------------------------|
| 1    | Set Isolation Level             | `SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;`            |                                                             | 100.00                     | Allow dirty reads in Session A.       |
| 2    | Begin Transaction & Modify Data | `BEGIN;` <br> `UPDATE account_balance SET balance = 150 WHERE id = 1;` |                                                             | 150.00 (Uncommitted)       | Start transaction and update balance. |
| 3    | Set Isolation Level             |                                                                        | `SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;` | 150.00 (Uncommitted)       | Allow dirty reads in Session B.       |
| 4    | Dirty Read                      |                                                                        | `SELECT balance FROM account_balance WHERE id = 1;`         | 150.00 (Uncommitted)       | Session B reads uncommitted data.     |
| 5    | Rollback                        | `ROLLBACK;`                                                            |                                                             | 100.00                     | Session A rolls back its changes.     |
| 6    | Confirm Data                    |                                                                        | `SELECT balance FROM account_balance WHERE id = 1;`         | 100.00                     | Session B checks the final balance.   |

#### Non-repeatable read
A "non-repeatable read" in SQL refers to a situation where, during the course of a transaction, a row that has been read once can be changed by another transaction, leading to potential inconsistencies.

| Step | Action                           | SQL Session A                                                     | SQL Session B                                                          | Account Balance (Expected) | Comments                                                              |
|------|----------------------------------|-------------------------------------------------------------------|------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------|
| 1    | Start Transaction & Initial Read | `BEGIN;` <br> `SELECT balance FROM account_balance WHERE id = 1;` |                                                                        | 100.00                     | Start transaction and read balance in Session A.                      |
| 2    | Modify Data                      |                                                                   | `UPDATE account_balance SET balance = 80 WHERE id = 1;` <br> `COMMIT;` | 80.00                      | Update and commit balance in Session B.                               |
| 3    | Second Read in Session A         | `SELECT balance FROM account_balance WHERE id = 1;`               |                                                                        | 80.00                      | Session A reads the balance again, observing the non-repeatable read. |
| 4    | Conclude Session A               | `COMMIT;` (or `ROLLBACK;`)                                        |                                                                        | 80.00                      | Conclude Session A.                                                   |


#### Phantom read
A "phantom read" in SQL refers to a situation in which a transaction re-queries data it has previously read and finds new rows that were added by another transaction in the meantime. The new rows that appear are called "phantom" rows because they were not present in the initial read but suddenly appear in a subsequent read within the same transaction.

| Step | Action                           | SQL Session A                                                         | SQL Session B                                                               | House Listings (Expected)   | Comments                                                               |
|------|----------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------------|-----------------------------|------------------------------------------------------------------------|
| 1    | Start Transaction & Initial Read | `BEGIN;` <br> `SELECT * FROM account_balance WHERE balance < 300.00;` |                                                                             | 2 accounts                  | Read accounts with balance below `$300,000` in Session A.              |
| 2    | Insert New Listing               |                                                                       | `INSERT INTO account_balance (id, balance) VALUES (5, 295);` <br> `COMMIT;` | 3 accounts below `$300,000` | Insert a new account in Session B.                                     |
| 3    | Second Read in Session A         | `SELECT * FROM account_balance WHERE balance < 300.00;`               |                                                                             | 3 accounts                  | Session A reads the balances again and sees the new "phantom" listing. |
| 4    | Conclude Session A               | `COMMIT;` (or `ROLLBACK;`)                                            |                                                                             | 3 accounts                  | Conclude Session A.                                                    |


