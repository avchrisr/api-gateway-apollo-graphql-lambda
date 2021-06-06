-- create sequence
CREATE SEQUENCE sequence_number MINVALUE 1;

-- create tables
CREATE TABLE person ( data jsonb );
CREATE UNIQUE INDEX person_primary_key ON person USING BTREE (((data->>'id')::BIGINT));
CREATE INDEX person_lastname_firstname_lookup_ix ON person USING BTREE ((data->>'lastname'), (data->>'firstname'));
CREATE INDEX person_updated_lookup_ix ON person USING BTREE ((data->>'updated'));

CREATE TABLE book ( data jsonb );
CREATE UNIQUE INDEX book_primary_key ON book USING BTREE (((data->>'id')::BIGINT));
CREATE INDEX book_title_lookup_ix ON book USING BTREE ((data->>'title'));
CREATE INDEX book_updated_lookup_ix ON book USING BTREE ((data->>'updated'));

CREATE TABLE video ( data jsonb );
CREATE UNIQUE INDEX video_primary_key ON video USING BTREE (((data->>'id')::BIGINT));
CREATE INDEX video_updated_lookup_ix ON video USING BTREE ((data->>'updated'));

-- For Videos, sorting by updated timestamp might be better, whereas for person or book, sorting by Name might be better. --
