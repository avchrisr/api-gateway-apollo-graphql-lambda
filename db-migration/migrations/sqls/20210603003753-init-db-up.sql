-- create sequence
CREATE SEQUENCE sequence_number MINVALUE 1;

-- create tables
CREATE TABLE person ( data jsonb );
CREATE UNIQUE INDEX person_primary_key ON person USING BTREE (((data->>'id')::BIGINT));

CREATE TABLE book ( data jsonb );
CREATE UNIQUE INDEX book_primary_key ON book USING BTREE (((data->>'id')::BIGINT));

CREATE TABLE video ( data jsonb );
CREATE UNIQUE INDEX video_primary_key ON video USING BTREE (((data->>'id')::BIGINT));
