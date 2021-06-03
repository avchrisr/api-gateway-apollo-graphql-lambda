-- create sequence
CREATE SEQUENCE sequence_number MINVALUE 1;

-- create tables
CREATE TABLE person ( data jsonb );
CREATE UNIQUE INDEX person_primary_key ON person USING BTREE (((data->>'id')::BIGINT));

CREATE TABLE book ( data jsonb );
CREATE UNIQUE INDEX book_primary_key ON book USING BTREE (((data->>'id')::BIGINT));

CREATE TABLE video ( data jsonb );
CREATE UNIQUE INDEX video_primary_key ON video USING BTREE (((data->>'id')::BIGINT));

-- insert data
-- INSERT INTO book (data) VALUES ('{"id": 1, "title": "Sleeping Beauties", "genres": ["Fiction", "Thriller", "Horror"], "published": false}');
-- INSERT INTO book (data) VALUES ('{"id": 2, "title": "Influence", "genres": ["Marketing & Sales", "Self-Help ", "Psychology"], "published": true}');
-- INSERT INTO book (data) VALUES ('{"id": 3, "title": "The Dictator''s Handbook", "genres": ["Law", "Politics"], "authors": ["Bruce Bueno de Mesquita", "Alastair Smith"], "published": true}');
-- INSERT INTO book (data) VALUES ('{"id": 4, "title": "Deep Work", "genres": ["Productivity", "Reference"], "published": true}');
-- INSERT INTO book (data) VALUES ('{"id": 5, "title": "Siddhartha", "genres": ["Fiction", "Spirituality"], "published": true}');

-- INSERT INTO person (data) VALUES ('{"id": 5, "firstname": "Chris", "lastname": "Ro", "email": "cr.test@everguard.ai", "isEnabled": true}, "cognitoId": "a1087907-cb94-4d90-ad7f-dcd6d5717fdc"');
-- INSERT INTO person (data) VALUES ('{"id": 5, "firstname": "Chris", "lastname": "Ro", "email": "cr.test@everguard.ai", "isEnabled": true}, "cognitoId": "d3063d07-ed80-457f-b925-70fabc70223d"');
