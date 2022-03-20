--
-- PostgreSQL database dump
--

-- Dumped from database version 11.15
-- Dumped by pg_dump version 11.15 (Ubuntu 11.15-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: wallet; Type: SCHEMA; Schema: -; Owner: doadmin
--

CREATE SCHEMA wallet;


ALTER SCHEMA wallet OWNER TO postgres;

--
-- Name: entity_trust_request_type; Type: TYPE; Schema: wallet; Owner: doadmin
--

CREATE TYPE wallet.entity_trust_request_type AS ENUM (
    'send',
    'receive',
    'manage',
    'yield',
    'deduct',
    'release'
);


ALTER TYPE wallet.entity_trust_request_type OWNER TO postgres;

--
-- Name: entity_trust_state_type; Type: TYPE; Schema: wallet; Owner: doadmin
--

CREATE TYPE wallet.entity_trust_state_type AS ENUM (
    'requested',
    'cancelled_by_originator',
    'cancelled_by_actor',
    'cancelled_by_target',
    'trusted'
);


ALTER TYPE wallet.entity_trust_state_type OWNER TO postgres;

--
-- Name: entity_trust_type; Type: TYPE; Schema: wallet; Owner: doadmin
--

CREATE TYPE wallet.entity_trust_type AS ENUM (
    'send',
    'manage',
    'deduct'
);


ALTER TYPE wallet.entity_trust_type OWNER TO postgres;

--
-- Name: transfer_state; Type: TYPE; Schema: wallet; Owner: doadmin
--

CREATE TYPE wallet.transfer_state AS ENUM (
    'requested',
    'pending',
    'completed',
    'cancelled',
    'failed'
);


ALTER TYPE wallet.transfer_state OWNER TO postgres;

--
-- Name: transfer_state_change_approval_type; Type: TYPE; Schema: wallet; Owner: doadmin
--

CREATE TYPE wallet.transfer_state_change_approval_type AS ENUM (
    'trusted',
    'manual',
    'machine'
);


ALTER TYPE wallet.transfer_state_change_approval_type OWNER TO postgres;

--
-- Name: transfer_type; Type: TYPE; Schema: wallet; Owner: doadmin
--

CREATE TYPE wallet.transfer_type AS ENUM (
    'send',
    'deduct',
    'managed'
);


ALTER TYPE wallet.transfer_type OWNER TO postgres;

--
-- Name: wallet_event_type; Type: TYPE; Schema: wallet; Owner: doadmin
--

CREATE TYPE wallet.wallet_event_type AS ENUM (
    'trust_request',
    'trust_request_granted',
    'trust_request_cancelled_by_originator',
    'trust_request_cancelled_by_actor',
    'trust_request_cancelled_by_target',
    'transfer_requested',
    'transfer_request_cancelled_by_source',
    'transfer_request_cancelled_by_destination',
    'transfer_request_cancelled_by_originator',
    'transfer_pending_cancelled_by_source',
    'transfer_pending_cancelled_by_destination',
    'transfer_pending_cancelled_by_requestor',
    'transfer_completed',
    'transfer_failed'
);


ALTER TYPE wallet.wallet_event_type OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: api_key; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.api_key (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    key character varying,
    tree_token_api_access boolean,
    hash character varying,
    salt character varying,
    name character varying
);


ALTER TABLE wallet.api_key OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE wallet.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: wallet; Owner: doadmin
--

CREATE SEQUENCE wallet.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE wallet.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: wallet; Owner: doadmin
--

ALTER SEQUENCE wallet.migrations_id_seq OWNED BY wallet.migrations.id;


--
-- Name: token; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.token (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    capture_id uuid NOT NULL,
    wallet_id uuid NOT NULL,
    transfer_pending boolean DEFAULT false NOT NULL,
    transfer_pending_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    claim boolean DEFAULT false NOT NULL
);


ALTER TABLE wallet.token OWNER TO postgres;

--
-- Name: transaction; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.transaction (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    token_id uuid NOT NULL,
    transfer_id uuid NOT NULL,
    source_wallet_id uuid NOT NULL,
    destination_wallet_id uuid NOT NULL,
    processed_at timestamp without time zone DEFAULT now() NOT NULL,
    claim boolean DEFAULT false NOT NULL
);


ALTER TABLE wallet.transaction OWNER TO postgres;

--
-- Name: transfer; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.transfer (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    originator_wallet_id uuid NOT NULL,
    source_wallet_id uuid NOT NULL,
    destination_wallet_id uuid NOT NULL,
    type wallet.transfer_type NOT NULL,
    parameters json,
    state wallet.transfer_state NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    closed_at timestamp without time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL,
    claim boolean DEFAULT false NOT NULL
);


ALTER TABLE wallet.transfer OWNER TO postgres;

--
-- Name: transfer_audit; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.transfer_audit (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    transfer_id integer NOT NULL,
    new_state wallet.transfer_state NOT NULL,
    processed_at timestamp without time zone DEFAULT now() NOT NULL,
    approval_type wallet.transfer_state_change_approval_type NOT NULL,
    entity_trust_id integer NOT NULL
);


ALTER TABLE wallet.transfer_audit OWNER TO postgres;

--
-- Name: wallet; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.wallet (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    password character varying,
    salt character varying,
    logo_url character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE wallet.wallet OWNER TO postgres;

--
-- Name: wallet_event; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.wallet_event (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    wallet_id uuid NOT NULL,
    type wallet.wallet_event_type NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE wallet.wallet_event OWNER TO postgres;

--
-- Name: wallet_trust; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.wallet_trust (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    actor_wallet_id uuid,
    target_wallet_id uuid NOT NULL,
    type wallet.entity_trust_type,
    originator_wallet_id uuid,
    request_type wallet.entity_trust_request_type NOT NULL,
    state wallet.entity_trust_state_type,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE wallet.wallet_trust OWNER TO postgres;

--
-- Name: wallet_trust_log; Type: TABLE; Schema: wallet; Owner: doadmin
--

CREATE TABLE wallet.wallet_trust_log (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    wallet_trust_id uuid NOT NULL,
    actor_wallet_id uuid NOT NULL,
    target_wallet_id uuid NOT NULL,
    type wallet.entity_trust_type NOT NULL,
    originator_wallet_id uuid NOT NULL,
    request_type wallet.entity_trust_request_type NOT NULL,
    state wallet.entity_trust_state_type NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    logged_at timestamp without time zone DEFAULT now() NOT NULL,
    active boolean NOT NULL
);


ALTER TABLE wallet.wallet_trust_log OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.migrations ALTER COLUMN id SET DEFAULT nextval('wallet.migrations_id_seq'::regclass);


--
-- Name: api_key api_key_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.api_key
    ADD CONSTRAINT api_key_pkey PRIMARY KEY (id);


--
-- Name: wallet_trust_log entity_trust_log_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.wallet_trust_log
    ADD CONSTRAINT entity_trust_log_pkey PRIMARY KEY (id);


--
-- Name: wallet_trust entity_trust_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.wallet_trust
    ADD CONSTRAINT entity_trust_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: token token_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.token
    ADD CONSTRAINT token_pkey PRIMARY KEY (id);


--
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (id);


--
-- Name: transfer_audit transfer_audit_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.transfer_audit
    ADD CONSTRAINT transfer_audit_pkey PRIMARY KEY (id);


--
-- Name: transfer transfer_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.transfer
    ADD CONSTRAINT transfer_pkey PRIMARY KEY (id);


--
-- Name: wallet_event wallet_event_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.wallet_event
    ADD CONSTRAINT wallet_event_pkey PRIMARY KEY (id);


--
-- Name: wallet wallet_pkey; Type: CONSTRAINT; Schema: wallet; Owner: doadmin
--

ALTER TABLE ONLY wallet.wallet
    ADD CONSTRAINT wallet_pkey PRIMARY KEY (id);


--
-- Name: capture_id_idx; Type: INDEX; Schema: wallet; Owner: doadmin
--

CREATE UNIQUE INDEX capture_id_idx ON wallet.token USING btree (capture_id);


--
-- Name: token_transfer_pending_id_idx; Type: INDEX; Schema: wallet; Owner: doadmin
--

CREATE INDEX token_transfer_pending_id_idx ON wallet.token USING btree (transfer_pending_id);


--
-- Name: token_wallet_id_idx; Type: INDEX; Schema: wallet; Owner: doadmin
--

CREATE INDEX token_wallet_id_idx ON wallet.token USING btree (wallet_id);


--
-- Name: wallet_name_idx; Type: INDEX; Schema: wallet; Owner: doadmin
--

CREATE UNIQUE INDEX wallet_name_idx ON wallet.wallet USING btree (name);


--
-- Name: SCHEMA wallet; Type: ACL; Schema: -; Owner: doadmin
--

GRANT USAGE ON SCHEMA wallet TO s_wallet;


--
-- Name: TABLE api_key; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.api_key TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.api_key TO s_wallet;


--
-- Name: TABLE migrations; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.migrations TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.migrations TO s_wallet;


--
-- Name: TABLE token; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.token TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.token TO s_wallet;


--
-- Name: TABLE transaction; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.transaction TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.transaction TO s_wallet;


--
-- Name: TABLE transfer; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.transfer TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.transfer TO s_wallet;


--
-- Name: TABLE transfer_audit; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.transfer_audit TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.transfer_audit TO s_wallet;


--
-- Name: TABLE wallet; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.wallet TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.wallet TO s_wallet;


--
-- Name: TABLE wallet_event; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.wallet_event TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.wallet_event TO s_wallet;


--
-- Name: TABLE wallet_trust; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.wallet_trust TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.wallet_trust TO s_wallet;


--
-- Name: TABLE wallet_trust_log; Type: ACL; Schema: wallet; Owner: doadmin
--

GRANT INSERT ON TABLE wallet.wallet_trust_log TO m_wallet;
GRANT SELECT,INSERT,UPDATE ON TABLE wallet.wallet_trust_log TO s_wallet;


--
-- PostgreSQL database dump complete
--

