CREATE TABLE userinfo
(
  uid uuid NOT NULL,
  username character varying(100) NOT NULL,
  password character varying(100) NOT NULL
)
WITH(OIDS=FALSE);

CREATE TABLE session
(
  uid uuid NOT NULL
)
WITH(OIDS=FALSE);
