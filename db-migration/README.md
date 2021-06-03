# Pre-requisite
- install `db-migrate` globally
```
npm i db-migrate -g
npm i db-migrate-pg -g
```

- create `.env` file under `db-migration` folder with following environment variables:
```
# valid NODE_ENV values:
# local, development, staging, demo, production
NODE_ENV=

LOCAL_PG_HOST=
LOCAL_PG_USER=
LOCAL_PG_PASS=
LOCAL_PG_DB=

DEV_PG_HOST=
DEV_PG_USER=
DEV_PG_PASS=
DEV_PG_DB=

STG_PG_HOST=
STG_PG_USER=
STG_PG_PASS=
STG_PG_DB=

DEMO_PG_HOST=
DEMO_PG_USER=
DEMO_PG_PASS=
DEMO_PG_DB=

PROD_PG_HOST=
PROD_PG_USER=
PROD_PG_PASS=
PROD_PG_DB=
```
---

# Create migration template
```
$ db-migrate create create-persons-table --sql-file
```

# Running Migrations

## Migrating UP

### migrate all new steps
```
$ db-migrate up
```
- a table named `migrations` will be automatically created in your database to track which migrations have been applied.

### migrate all new steps up to 20200510
```
$ db-migrate up 20200510
```

### migrate 5 new steps up
```
$ db-migrate up -c 5
```

## Migrating DOWN

### migrate one step down
```
$ db-migrate down
```

### migrate 5 steps down
```
$ db-migrate down -c 5
```

### migrate all the way down (reset)
```
$ db-migrate reset
```
