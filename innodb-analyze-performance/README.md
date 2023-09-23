# HW9: 


### How to
#### Start container
1. Start docker
    ```bash
    docker-compose up --build
    ```
1. Create Users table and generate 40M users(will take a while)
    ```bash
    docker exec -i some-mysql sh -c 'exec mysql -uroot -p"pass"' < /etc/mysql/users-provision.sql
    ```
#### Update/Set index to `date_of_birth`
1. BTREE
   ```bash
   ALTER TABLE users
   ADD INDEX idx_birth_date USING BTREE (date_of_birth);
   ```
1. HASH
   ```bash
   ALTER TABLE users
   ADD INDEX idx_birth_date USING HASH (date_of_birth);
   ```

#### Update `innodb_flush_log_at_trx_commit`
Default value = `1`. To update it do it either temporary(till server restart) or permanently
1. Temporary - SQL query
   ```bash
   SET GLOBAL innodb_flush_log_at_trx_commit = 0;
   ```
1. Permanent - update [mysq-innodb.cnf](./mysql-innodb.cnf). 
   ```
   [mysqld]
   innodb_flush_log_at_trx_commit = 0
   ```


#### Create load

```bash
cd ./client && npm run generate -- --size=100000
```

### Table Information
1. Data is distributed between `1970-1-1` and `2019-12-19` with `2100-2300` user's birthdate each day.
1. Default index is `id` with index type `BTREE`
    ```bash
    SELECT *
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'projector'
    AND TABLE_NAME = 'users';
    ```

### Results
#### Selection by date of birth

#### Detailed info
_Note_: All time in seconds
1. Without Index
   ```
   ┌─────────────────────────┬────────┬────────┬─────────┐
   │    (index)              │  best  │ worst  │ average │
   ├─────────────────────────┼────────┼────────┼─────────┤
   │  singleDate             │  6.002 │  7.739 │  6.5944 │
   │  singleDateLimit50000   │  8.534 │  12.52 │  9.3553 │
   │   wholeYear             │  6.825 │  9.022 │  7.4884 │
   │   wholeYearLimit50000   │  0.507 │  0.586 │  0.5442 │
   │ multipleYears           │ 10.751 │ 17.041 │ 13.8005 │
   │ multipleYearsLimit50000 │  0.069 │  0.143 │  0.0944 │
   └─────────────────────────┴────────┴────────┴─────────┘
   ```

1. BTREE Index
   ```
   ┌────────────────────┬────────┬────────┬──────────────────────┐
   │    (index)         │  best  │ worst  │       average        │
   ├────────────────────┼────────┼────────┼──────────────────────┤
   │  singleDate        │  0.014 │ 0.119  │ 0.034699999999999995 │
   │   wholeYear        │ 18.573 │ 24.391 │       21.2044        │
   │ wholeYearLimit     │  0.247 │  2.078 │        0.6458        │
   │ multipleYears      │  9.905 │ 19.934 │  13.429400000000001  │
   │ multipleYearsLimit │  0.393 │ 3.551  │        1.3243        │
   └────────────────────┴────────┴────────┴──────────────────────┘

   ```

1. Hash Tree
   ```
   ┌────────────────────┬────────┬────────┬─────────────────────┐
   │    (index)         │  best  │ worst  │       average       │
   ├────────────────────┼────────┼────────┼─────────────────────┤
   │  singleDate        │ 0.009  │  0.197 │ 0.03540000000000001 │
   │   wholeYear        │ 10.615 │ 29.486 │       21.6993       │
   │ wholeYearLimit     │ 0.9400 │  9.738 │        2.8309       │
   │ multipleYears      │ 10.371 │ 21.293 │ 13.497900000000001  │
   │ multipleYearsLimit │  1.354 │ 21.683 │        5.068        │
   └────────────────────┴────────┴────────┴─────────────────────┘

   ```

1. **w/o LIMIT**Average times:
   
   | Time taken       | 30/12/1991 | 01/01/1999-31/12/1999 | 01/01/2000-31/12/2010 |
   |------------------|------------|-----------------------|-----------------------|
   | Without index    |  6.5944    |      7.4884           |    13.8005            |
   | With BTREE index |  0.03469   |     21.2044           |    13.4294            |
   | With HASH index  |  0.0354    |     21.6993           |    13.4979            |

1. **w/ LIMIT**Average times:
   
   | Time taken       | 30/12/1991 | 01/01/1999-31/12/1999 | 01/01/2000-31/12/2010  |
   |------------------|------------|------------------------|-----------------------|
   | Without index    |  9.3553    | 0.5442                | 0.094399               |
   | With BTREE index |  0.03469   | 0.6458                | 1.3243                 |
   | With HASH index  |  0.0354    | 2.8309                | 5.068                  |

 
#### Insert

Single insert (1 user in batch)

| innodb_flush_log_at_trx_commit | RPS    |
|--------------------------------|--------|
| 0                              | 575.80 |
| 1                              | 310.76 |
| 2                              | 493.10 |

Batch insert (100 users in batch)

| innodb_flush_log_at_trx_commit | RPS      |
|--------------------------------|----------|
| 0                              | 34766.89 |
| 1                              | 21767.05 |
| 2                              | 33454.88 |

Batch insert (500 users in batch. 10 concurrency) inserting 10M users

| innodb_flush_log_at_trx_commit | RPS       |
|--------------------------------|-----------|
| 0                              | 100070.05 |
| 1                              | 72615.84  |
| 2                              | 101125.53 |

Batch insert (500 users in batch. 10 concurrency) inserting 10M users. With BTREE index

| innodb_flush_log_at_trx_commit | RPS      |
|--------------------------------|----------|
| 0                              | 64256.62 |
| 1                              | 49148.50 |
| 2                              | 54530.09 |
