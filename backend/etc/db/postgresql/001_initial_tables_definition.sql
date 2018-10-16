CREATE TABLE userinfo
(
  uid uuid NOT NULL,
  username character varying(100) NOT NULL,
  password character varying(100) NOT NULL,
  firstName character varying(100) NOT NULL,
  middleName character varying(100) NULL,
  lastName character varying(100) NULL
)
WITH(OIDS=FALSE);

CREATE TABLE session
(
  uid uuid NOT NULL
)
WITH(OIDS=FALSE);
