--
-- PostgreSQL database dump
--

-- Dumped from database version 11.14
-- Dumped by pg_dump version 11.15 (Ubuntu 11.15-1.pgdg20.04+1)

CREATE USER doadmin WITH PASSWORD 'postgres';
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: age_type; Type: TYPE; Schema: public; Owner: doadmin
--

CREATE TYPE public.age_type AS ENUM (
    'new_tree',
    'over_two_years'
);


ALTER TYPE public.age_type OWNER TO postgres;

--
-- Name: capture_approval_type; Type: TYPE; Schema: public; Owner: doadmin
--

CREATE TYPE public.capture_approval_type AS ENUM (
    'simple_leaf',
    'complex_leaf',
    'acacia_like',
    'conifer',
    'fruit',
    'mangrove',
    'palm',
    'timber'
);


ALTER TYPE public.capture_approval_type OWNER TO postgres;

--
-- Name: morphology_type; Type: TYPE; Schema: public; Owner: doadmin
--

CREATE TYPE public.morphology_type AS ENUM (
    'seedling',
    'direct_seedling',
    'fmnr'
);


ALTER TYPE public.morphology_type OWNER TO postgres;

--
-- Name: platform_type; Type: TYPE; Schema: public; Owner: doadmin
--

CREATE TYPE public.platform_type AS ENUM (
    'admin_panel',
    'web_map'
);


ALTER TYPE public.platform_type OWNER TO postgres;

--
-- Name: rejection_reason_type; Type: TYPE; Schema: public; Owner: doadmin
--

CREATE TYPE public.rejection_reason_type AS ENUM (
    'not_tree',
    'unapproved_tree',
    'blurry_image',
    'dead',
    'duplicate_image',
    'flag_user',
    'needs_contact_or_review'
);


ALTER TYPE public.rejection_reason_type OWNER TO postgres;

--
-- Name: getentityrelationshipchildren(integer); Type: FUNCTION; Schema: public; Owner: doadmin
--

CREATE FUNCTION public.getentityrelationshipchildren(integer) RETURNS TABLE(entity_id integer, parent_id integer, depth integer, type text, relationship_role text)
    LANGUAGE sql
    AS $_$
WITH RECURSIVE children AS (
 SELECT entity.id, entity_relationship.parent_id, 1 as depth, entity_relationship.type, entity_relationship.role
 FROM entity
 LEFT JOIN entity_relationship ON entity_relationship.child_id = entity.id 
 WHERE entity.id = $1
UNION
 SELECT next_child.id, entity_relationship.parent_id, depth + 1, entity_relationship.type, entity_relationship.role
 FROM entity next_child
 JOIN entity_relationship ON entity_relationship.child_id = next_child.id 
 JOIN children c ON entity_relationship.parent_id = c.id
)
SELECT *
FROM children
$_$;


ALTER FUNCTION public.getentityrelationshipchildren(integer) OWNER TO postgres;

--
-- Name: getentityrelationshipchildren(integer, text); Type: FUNCTION; Schema: public; Owner: doadmin
--

CREATE FUNCTION public.getentityrelationshipchildren(integer, text) RETURNS TABLE(entity_id integer, parent_id integer, depth integer, type text, relationship_role text)
    LANGUAGE sql
    AS $_$
WITH RECURSIVE children AS (
 SELECT entity.id, entity_relationship.parent_id, 1 as depth, entity_relationship.type, entity_relationship.role
 FROM entity
 LEFT JOIN entity_relationship ON entity_relationship.child_id = entity.id AND entity_relationship.type = $2
 WHERE entity.id = $1
UNION
 SELECT next_child.id, entity_relationship.parent_id, depth + 1, entity_relationship.type, entity_relationship.role
 FROM entity next_child
 JOIN entity_relationship ON entity_relationship.child_id = next_child.id AND entity_relationship.type = $2
 JOIN children c ON entity_relationship.parent_id = c.id
)
SELECT *
FROM children
$_$;


ALTER FUNCTION public.getentityrelationshipchildren(integer, text) OWNER TO postgres;

--
-- Name: getentityrelationshipparents(integer, text); Type: FUNCTION; Schema: public; Owner: doadmin
--

CREATE FUNCTION public.getentityrelationshipparents(integer, text) RETURNS TABLE(entity_id integer, parent_id integer, depth integer, type text, role text)
    LANGUAGE sql
    AS $_$
WITH RECURSIVE parents AS (
 SELECT entity.id, entity_relationship.parent_id, -1 as depth, entity_relationship.type, entity_relationship.role
 FROM entity
 LEFT JOIN entity_relationship ON entity_relationship.parent_id = entity.id AND entity_relationship.type = $2
 WHERE entity.id = $1
UNION
 SELECT next_parent.id, entity_relationship.parent_id, depth - 1, entity_relationship.type, entity_relationship.role
 FROM entity next_parent
 JOIN entity_relationship ON entity_relationship.parent_id = next_parent.id AND entity_relationship.type = $2
 JOIN parents p ON entity_relationship.child_id = p.id
)
SELECT *
FROM parents
$_$;


ALTER FUNCTION public.getentityrelationshipparents(integer, text) OWNER TO postgres;

--
-- Name: makegrid_2d(public.geometry, integer, integer); Type: FUNCTION; Schema: public; Owner: doadmin
--

CREATE FUNCTION public.makegrid_2d(bound_polygon public.geometry, width_step integer, height_step integer) RETURNS public.geometry
    LANGUAGE plpgsql
    AS $_$
DECLARE
  Xmin DOUBLE PRECISION;
  Xmax DOUBLE PRECISION;
  Ymax DOUBLE PRECISION;
  X DOUBLE PRECISION;
  Y DOUBLE PRECISION;
  NextX DOUBLE PRECISION;
  NextY DOUBLE PRECISION;
  CPoint public.geometry;
  sectors public.geometry[];
  i INTEGER;
  SRID INTEGER;
BEGIN
  Xmin := ST_XMin(bound_polygon);
  Xmax := ST_XMax(bound_polygon);
  Ymax := ST_YMax(bound_polygon);
  SRID := ST_SRID(bound_polygon);

  Y := ST_YMin(bound_polygon); --current sector's corner coordinate
  i := -1;
  <<yloop>>
  LOOP
    IF (Y >= Ymax) THEN
        EXIT;
    END IF;

    X := Xmin;
    <<xloop>>
    LOOP
      IF (X >= Xmax) THEN
          EXIT;
      END IF;

      CPoint := ST_SetSRID(ST_MakePoint(X, Y), SRID);
      NextX := ST_X(ST_Project(CPoint, $2, radians(90))::geometry);
      NextY := ST_Y(ST_Project(CPoint, $3, radians(0))::geometry);

      IF (NextX > Xmax) THEN
          NextX := Xmax;
      END IF;

      IF (NextX < X) THEN
          NextX := Xmax;
      END IF;

      i := i + 1;
      sectors[i] := ST_MakeEnvelope(X, Y, NextX, NextY, SRID);

      X := NextX;
    END LOOP xloop;
    CPoint := ST_SetSRID(ST_MakePoint(X, Y), SRID);
    NextY := ST_Y(ST_Project(CPoint, $3, radians(0))::geometry);
    Y := NextY;
  END LOOP yloop;

  RETURN ST_Collect(sectors);
END;
$_$;


ALTER FUNCTION public.makegrid_2d(bound_polygon public.geometry, width_step integer, height_step integer) OWNER TO postgres;

--
-- Name: token_transaction_insert(); Type: FUNCTION; Schema: public; Owner: doadmin
--

CREATE FUNCTION public.token_transaction_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
                 BEGIN
                    INSERT INTO transaction
                    (token_id, sender_entity_id, receiver_entity_id)
                    VALUES
                    (OLD.id, OLD.entity_id, NEW.entity_id);
                    RETURN NEW;
                 END;
             $$;


ALTER FUNCTION public.token_transaction_insert() OWNER TO postgres;

--
-- Name: trigger_set_updated_at(); Type: FUNCTION; Schema: public; Owner: doadmin
--

CREATE FUNCTION public.trigger_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$;


ALTER FUNCTION public.trigger_set_updated_at() OWNER TO postgres;

--
-- Name: trees_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.trees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trees_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: trees; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.trees (
    id integer DEFAULT nextval('public.trees_id_seq'::regclass) NOT NULL,
    time_created timestamp without time zone NOT NULL,
    time_updated timestamp without time zone NOT NULL,
    missing boolean DEFAULT false,
    priority boolean DEFAULT false,
    cause_of_death_id integer,
    planter_id integer,
    primary_location_id integer,
    settings_id integer,
    override_settings_id integer,
    dead integer DEFAULT 0 NOT NULL,
    photo_id integer,
    image_url character varying,
    certificate_id integer,
    estimated_geometric_location public.geometry(Point,4326),
    lat numeric,
    lon numeric,
    gps_accuracy integer,
    active boolean DEFAULT true,
    planter_photo_url character varying,
    planter_identifier character varying,
    device_id integer,
    sequence integer,
    note character varying,
    verified boolean DEFAULT false NOT NULL,
    uuid character varying,
    approved boolean DEFAULT false NOT NULL,
    status character varying DEFAULT 'planted'::character varying NOT NULL,
    cluster_regions_assigned boolean DEFAULT false NOT NULL,
    species_id integer,
    planting_organization_id integer,
    payment_id integer,
    contract_id integer,
    token_issued boolean DEFAULT false NOT NULL,
    morphology public.morphology_type,
    age public.age_type,
    species character varying,
    capture_approval_tag public.capture_approval_type,
    rejection_reason public.rejection_reason_type,
    matching_hash character varying,
    device_identifier character varying,
    images jsonb,
    domain_specific_data jsonb,
    token_id uuid,
    name character varying,
    earnings_id uuid
);


ALTER TABLE public.trees OWNER TO postgres;

--
-- Name: entity; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.entity (
    id integer NOT NULL,
    type character varying,
    name character varying,
    first_name character varying,
    last_name character varying,
    email character varying,
    phone character varying,
    pwd_reset_required boolean DEFAULT false,
    website character varying,
    wallet character varying,
    password character varying,
    salt character varying,
    active_contract_id integer,
    offering_pay_to_plant boolean DEFAULT false NOT NULL,
    tree_validation_contract_id integer,
    logo_url character varying,
    map_name character varying,
    stakeholder_uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL
);


ALTER TABLE public.entity OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: planter; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.planter (
    id integer DEFAULT nextval('public.users_id_seq'::regclass) NOT NULL,
    first_name character varying(30) NOT NULL,
    last_name character varying(30) NOT NULL,
    email character varying,
    organization character varying,
    phone text,
    pwd_reset_required boolean DEFAULT false,
    image_url character varying,
    person_id integer,
    organization_id integer,
    image_rotation integer
);


ALTER TABLE public.planter OWNER TO postgres;

--
-- Name: token; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.token (
    id integer NOT NULL,
    tree_id integer,
    entity_id integer,
    uuid character varying DEFAULT public.uuid_generate_v4(),
    capture_id character varying
);


ALTER TABLE public.token OWNER TO postgres;

--
-- Name: ab_permission; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.ab_permission (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.ab_permission OWNER TO postgres;

--
-- Name: ab_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.ab_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ab_permission_id_seq OWNER TO postgres;

--
-- Name: ab_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.ab_permission_id_seq OWNED BY public.ab_permission.id;


--
-- Name: ab_permission_view; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.ab_permission_view (
    id integer NOT NULL,
    permission_id integer,
    view_menu_id integer
);


ALTER TABLE public.ab_permission_view OWNER TO postgres;

--
-- Name: ab_permission_view_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.ab_permission_view_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ab_permission_view_id_seq OWNER TO postgres;

--
-- Name: ab_permission_view_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.ab_permission_view_id_seq OWNED BY public.ab_permission_view.id;


--
-- Name: ab_permission_view_role; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.ab_permission_view_role (
    id integer NOT NULL,
    permission_view_id integer,
    role_id integer
);


ALTER TABLE public.ab_permission_view_role OWNER TO postgres;

--
-- Name: ab_permission_view_role_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.ab_permission_view_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ab_permission_view_role_id_seq OWNER TO postgres;

--
-- Name: ab_permission_view_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.ab_permission_view_role_id_seq OWNED BY public.ab_permission_view_role.id;


--
-- Name: ab_register_user; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.ab_register_user (
    id integer NOT NULL,
    first_name character varying(64) NOT NULL,
    last_name character varying(64) NOT NULL,
    username character varying(64) NOT NULL,
    password character varying(256),
    email character varying(64) NOT NULL,
    registration_date timestamp without time zone,
    registration_hash character varying(256)
);


ALTER TABLE public.ab_register_user OWNER TO postgres;

--
-- Name: ab_register_user_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.ab_register_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ab_register_user_id_seq OWNER TO postgres;

--
-- Name: ab_register_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.ab_register_user_id_seq OWNED BY public.ab_register_user.id;


--
-- Name: ab_role; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.ab_role (
    id integer NOT NULL,
    name character varying(64) NOT NULL
);


ALTER TABLE public.ab_role OWNER TO postgres;

--
-- Name: ab_role_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.ab_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ab_role_id_seq OWNER TO postgres;

--
-- Name: ab_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.ab_role_id_seq OWNED BY public.ab_role.id;


--
-- Name: ab_user; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.ab_user (
    id integer NOT NULL,
    first_name character varying(64) NOT NULL,
    last_name character varying(64) NOT NULL,
    username character varying(64) NOT NULL,
    password character varying(256),
    active boolean,
    email character varying(64) NOT NULL,
    last_login timestamp without time zone,
    login_count integer,
    fail_login_count integer,
    created_on timestamp without time zone,
    changed_on timestamp without time zone,
    created_by_fk integer,
    changed_by_fk integer
);


ALTER TABLE public.ab_user OWNER TO postgres;

--
-- Name: ab_user_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.ab_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ab_user_id_seq OWNER TO postgres;

--
-- Name: ab_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.ab_user_id_seq OWNED BY public.ab_user.id;


--
-- Name: ab_user_role; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.ab_user_role (
    id integer NOT NULL,
    user_id integer,
    role_id integer
);


ALTER TABLE public.ab_user_role OWNER TO postgres;

--
-- Name: ab_user_role_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.ab_user_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ab_user_role_id_seq OWNER TO postgres;

--
-- Name: ab_user_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.ab_user_role_id_seq OWNED BY public.ab_user_role.id;


--
-- Name: ab_view_menu; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.ab_view_menu (
    id integer NOT NULL,
    name character varying(250) NOT NULL
);


ALTER TABLE public.ab_view_menu OWNER TO postgres;

--
-- Name: ab_view_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.ab_view_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ab_view_menu_id_seq OWNER TO postgres;

--
-- Name: ab_view_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.ab_view_menu_id_seq OWNED BY public.ab_view_menu.id;


--
-- Name: region; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.region (
    id integer NOT NULL,
    type_id integer,
    name character varying,
    metadata jsonb,
    geom public.geometry(MultiPolygon,4326),
    centroid public.geometry(Point,4326)
);


ALTER TABLE public.region OWNER TO postgres;

--
-- Name: tree_region; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.tree_region (
    id integer NOT NULL,
    tree_id integer,
    zoom_level integer,
    region_id integer
);


ALTER TABLE public.tree_region OWNER TO postgres;

--
-- Name: active_tree_region; Type: MATERIALIZED VIEW; Schema: public; Owner: doadmin
--

CREATE MATERIALIZED VIEW public.active_tree_region AS
 SELECT tree_region.id,
    tree_region.tree_id,
    region.id AS region_id,
    region.centroid,
    region.type_id,
    tree_region.zoom_level
   FROM ((public.tree_region
     JOIN public.trees ON ((trees.id = tree_region.tree_id)))
     JOIN public.region ON ((region.id = tree_region.region_id)))
  WHERE (trees.active = true)
  WITH NO DATA;


ALTER TABLE public.active_tree_region OWNER TO postgres;

--
-- Name: admin_role; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.admin_role (
    id integer NOT NULL,
    role_name character varying NOT NULL,
    description character varying,
    policy json,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    identifier character varying DEFAULT public.uuid_generate_v4()
);


ALTER TABLE public.admin_role OWNER TO postgres;

--
-- Name: admin_role_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.admin_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admin_role_id_seq OWNER TO postgres;

--
-- Name: admin_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.admin_role_id_seq OWNED BY public.admin_role.id;


--
-- Name: admin_user; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.admin_user (
    id integer NOT NULL,
    user_name character varying,
    first_name character varying,
    last_name character varying,
    password_hash character varying,
    salt character varying,
    email character varying,
    active boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    enabled boolean DEFAULT true NOT NULL
);


ALTER TABLE public.admin_user OWNER TO postgres;

--
-- Name: admin_user_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.admin_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admin_user_id_seq OWNER TO postgres;

--
-- Name: admin_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.admin_user_id_seq OWNED BY public.admin_user.id;


--
-- Name: admin_user_role; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.admin_user_role (
    id integer NOT NULL,
    role_id integer NOT NULL,
    admin_user_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_user_role OWNER TO postgres;

--
-- Name: admin_user_role_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.admin_user_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admin_user_role_id_seq OWNER TO postgres;

--
-- Name: admin_user_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.admin_user_role_id_seq OWNED BY public.admin_user_role.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: anonymous_entities; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.anonymous_entities (
    index bigint,
    id bigint,
    type text,
    name text,
    first_name text,
    last_name text,
    website text,
    wallet text,
    offering_pay_to_plant boolean,
    logo_url text,
    map_name text
);


ALTER TABLE public.anonymous_entities OWNER TO postgres;

--
-- Name: anonymous_planters; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.anonymous_planters (
    index bigint,
    id bigint,
    first_name text,
    last_name text,
    email text,
    organization text,
    image_url text,
    person_id double precision,
    organization_id double precision
);


ALTER TABLE public.anonymous_planters OWNER TO postgres;

--
-- Name: anonymous_trees; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.anonymous_trees (
    index bigint,
    id bigint,
    time_created timestamp without time zone,
    time_updated timestamp without time zone,
    missing boolean,
    priority boolean,
    cause_of_death_id double precision,
    planter_id bigint,
    primary_location_id double precision,
    settings_id double precision,
    image_url text,
    certificate_id double precision,
    lat double precision,
    lon double precision,
    planter_photo_url text,
    planter_identifier text,
    device_id double precision,
    note text,
    verified boolean,
    uuid text,
    approved boolean,
    status text,
    species_id double precision,
    planting_organization_id double precision,
    payment_id double precision,
    contract_id text,
    token_issued boolean,
    morphology text,
    age text,
    species text,
    capture_approval_tag text,
    rejection_reason text,
    device_identifier text
);


ALTER TABLE public.anonymous_trees OWNER TO postgres;

--
-- Name: api_key; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.api_key (
    id integer NOT NULL,
    key character varying,
    tree_token_api_access boolean,
    hash character varying,
    salt character varying,
    name character varying
);


ALTER TABLE public.api_key OWNER TO postgres;

--
-- Name: api_key_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.api_key_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.api_key_id_seq OWNER TO postgres;

--
-- Name: api_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.api_key_id_seq OWNED BY public.api_key.id;


--
-- Name: audit; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.audit (
    id integer NOT NULL,
    admin_user_id integer NOT NULL,
    platform public.platform_type,
    ip character varying,
    browser character varying,
    organization character varying,
    operation json,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit OWNER TO postgres;

--
-- Name: audit_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_id_seq OWNER TO postgres;

--
-- Name: audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.audit_id_seq OWNED BY public.audit.id;


--
-- Name: celery_taskmeta; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.celery_taskmeta (
    id integer NOT NULL,
    task_id character varying(155),
    status character varying(50),
    result bytea,
    date_done timestamp without time zone,
    traceback text,
    name character varying(155),
    args bytea,
    kwargs bytea,
    worker character varying(155),
    retries integer,
    queue character varying(155)
);


ALTER TABLE public.celery_taskmeta OWNER TO postgres;

--
-- Name: celery_tasksetmeta; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.celery_tasksetmeta (
    id integer NOT NULL,
    taskset_id character varying(155),
    result bytea,
    date_done timestamp without time zone
);


ALTER TABLE public.celery_tasksetmeta OWNER TO postgres;

--
-- Name: certificates; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.certificates (
    id integer NOT NULL,
    donor_id integer,
    token character varying
);


ALTER TABLE public.certificates OWNER TO postgres;

--
-- Name: certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.certificates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.certificates_id_seq OWNER TO postgres;

--
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
-- Name: clusters; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.clusters (
    id integer NOT NULL,
    count integer,
    zoom_level integer,
    location public.geometry(Point,4326)
);


ALTER TABLE public.clusters OWNER TO postgres;

--
-- Name: clusters_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.clusters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clusters_id_seq OWNER TO postgres;

--
-- Name: clusters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.clusters_id_seq OWNED BY public.clusters.id;


--
-- Name: connection; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.connection (
    id integer NOT NULL,
    conn_id character varying(250) NOT NULL,
    conn_type character varying(500) NOT NULL,
    host character varying(500),
    schema character varying(500),
    login character varying(500),
    password character varying(5000),
    port integer,
    extra text,
    is_encrypted boolean,
    is_extra_encrypted boolean,
    description text
);


ALTER TABLE public.connection OWNER TO postgres;

--
-- Name: connection_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.connection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.connection_id_seq OWNER TO postgres;

--
-- Name: connection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.connection_id_seq OWNED BY public.connection.id;


--
-- Name: contract; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.contract (
    id integer NOT NULL,
    author_id integer NOT NULL,
    name character varying NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    contract json NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contract OWNER TO postgres;

--
-- Name: contract_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.contract_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contract_id_seq OWNER TO postgres;

--
-- Name: contract_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.contract_id_seq OWNED BY public.contract.id;


--
-- Name: dag; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.dag (
    dag_id character varying(250) NOT NULL,
    is_paused boolean,
    is_subdag boolean,
    is_active boolean,
    last_parsed_time timestamp with time zone,
    last_pickled timestamp with time zone,
    last_expired timestamp with time zone,
    scheduler_lock boolean,
    pickle_id integer,
    fileloc character varying(2000),
    owners character varying(2000),
    description text,
    default_view character varying(25),
    schedule_interval text,
    root_dag_id character varying(250),
    next_dagrun timestamp with time zone,
    next_dagrun_create_after timestamp with time zone,
    concurrency integer NOT NULL,
    has_task_concurrency_limits boolean NOT NULL
);


ALTER TABLE public.dag OWNER TO postgres;

--
-- Name: dag_code; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.dag_code (
    fileloc_hash bigint NOT NULL,
    fileloc character varying(2000) NOT NULL,
    source_code text NOT NULL,
    last_updated timestamp with time zone NOT NULL
);


ALTER TABLE public.dag_code OWNER TO postgres;

--
-- Name: dag_pickle; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.dag_pickle (
    id integer NOT NULL,
    pickle bytea,
    created_dttm timestamp with time zone,
    pickle_hash bigint
);


ALTER TABLE public.dag_pickle OWNER TO postgres;

--
-- Name: dag_pickle_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.dag_pickle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dag_pickle_id_seq OWNER TO postgres;

--
-- Name: dag_pickle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.dag_pickle_id_seq OWNED BY public.dag_pickle.id;


--
-- Name: dag_run; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.dag_run (
    id integer NOT NULL,
    dag_id character varying(250),
    execution_date timestamp with time zone,
    state character varying(50),
    run_id character varying(250),
    external_trigger boolean,
    conf bytea,
    end_date timestamp with time zone,
    start_date timestamp with time zone,
    run_type character varying(50) NOT NULL,
    last_scheduling_decision timestamp with time zone,
    dag_hash character varying(32),
    creating_job_id integer
);


ALTER TABLE public.dag_run OWNER TO postgres;

--
-- Name: dag_run_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.dag_run_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dag_run_id_seq OWNER TO postgres;

--
-- Name: dag_run_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.dag_run_id_seq OWNED BY public.dag_run.id;


--
-- Name: dag_tag; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.dag_tag (
    name character varying(100) NOT NULL,
    dag_id character varying(250) NOT NULL
);


ALTER TABLE public.dag_tag OWNER TO postgres;

--
-- Name: devices; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    android_id character varying,
    app_version character varying,
    app_build integer,
    manufacturer character varying,
    brand character varying,
    model character varying,
    hardware character varying,
    device character varying,
    serial character varying,
    android_release character varying,
    android_sdk integer,
    sequence bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.devices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.devices_id_seq OWNER TO postgres;

--
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- Name: domain_event; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
)
PARTITION BY LIST (status);


ALTER TABLE public.domain_event OWNER TO postgres;

--
-- Name: domain_event_handled; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_handled (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
)
PARTITION BY RANGE (created_at);
ALTER TABLE ONLY public.domain_event ATTACH PARTITION public.domain_event_handled FOR VALUES IN ('handled');


ALTER TABLE public.domain_event_handled OWNER TO postgres;

--
-- Name: domain_event_handled_2021; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_handled_2021 (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
ALTER TABLE ONLY public.domain_event_handled ATTACH PARTITION public.domain_event_handled_2021 FOR VALUES FROM ('2021-01-01 00:00:00+00') TO ('2022-01-01 00:00:00+00');


ALTER TABLE public.domain_event_handled_2021 OWNER TO postgres;

--
-- Name: domain_event_handled_2022; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_handled_2022 (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
ALTER TABLE ONLY public.domain_event_handled ATTACH PARTITION public.domain_event_handled_2022 FOR VALUES FROM ('2022-01-01 00:00:00+00') TO ('2023-01-01 00:00:00+00');


ALTER TABLE public.domain_event_handled_2022 OWNER TO postgres;

--
-- Name: domain_event_handled_2023; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_handled_2023 (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
ALTER TABLE ONLY public.domain_event_handled ATTACH PARTITION public.domain_event_handled_2023 FOR VALUES FROM ('2023-01-01 00:00:00+00') TO ('2024-01-01 00:00:00+00');


ALTER TABLE public.domain_event_handled_2023 OWNER TO postgres;

--
-- Name: domain_event_raised; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_raised (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
ALTER TABLE ONLY public.domain_event ATTACH PARTITION public.domain_event_raised FOR VALUES IN ('raised');


ALTER TABLE public.domain_event_raised OWNER TO postgres;

--
-- Name: domain_event_received; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_received (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
ALTER TABLE ONLY public.domain_event ATTACH PARTITION public.domain_event_received FOR VALUES IN ('received');


ALTER TABLE public.domain_event_received OWNER TO postgres;

--
-- Name: domain_event_sent; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_sent (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
)
PARTITION BY RANGE (created_at);
ALTER TABLE ONLY public.domain_event ATTACH PARTITION public.domain_event_sent FOR VALUES IN ('sent');


ALTER TABLE public.domain_event_sent OWNER TO postgres;

--
-- Name: domain_event_sent_2021; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_sent_2021 (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
ALTER TABLE ONLY public.domain_event_sent ATTACH PARTITION public.domain_event_sent_2021 FOR VALUES FROM ('2021-01-01 00:00:00+00') TO ('2022-01-01 00:00:00+00');


ALTER TABLE public.domain_event_sent_2021 OWNER TO postgres;

--
-- Name: domain_event_sent_2022; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_sent_2022 (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
ALTER TABLE ONLY public.domain_event_sent ATTACH PARTITION public.domain_event_sent_2022 FOR VALUES FROM ('2022-01-01 00:00:00+00') TO ('2023-01-01 00:00:00+00');


ALTER TABLE public.domain_event_sent_2022 OWNER TO postgres;

--
-- Name: domain_event_sent_2023; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.domain_event_sent_2023 (
    id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
ALTER TABLE ONLY public.domain_event_sent ATTACH PARTITION public.domain_event_sent_2023 FOR VALUES FROM ('2023-01-01 00:00:00+00') TO ('2024-01-01 00:00:00+00');


ALTER TABLE public.domain_event_sent_2023 OWNER TO postgres;

--
-- Name: donors; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.donors (
    id integer NOT NULL,
    organization_id integer,
    first_name character varying,
    last_name character varying,
    email character varying
);


ALTER TABLE public.donors OWNER TO postgres;

--
-- Name: donors_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.donors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.donors_id_seq OWNER TO postgres;

--
-- Name: donors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.donors_id_seq OWNED BY public.donors.id;


--
-- Name: entities; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.entities (
    index bigint,
    id bigint,
    type text,
    name text,
    first_name text,
    last_name text,
    website text,
    wallet text,
    offering_pay_to_plant boolean,
    logo_url text,
    map_name text
);


ALTER TABLE public.entities OWNER TO postgres;

--
-- Name: entity_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.entity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.entity_id_seq OWNER TO postgres;

--
-- Name: entity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.entity_id_seq OWNED BY public.entity.id;


--
-- Name: entity_manager; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.entity_manager (
    id integer NOT NULL,
    parent_entity_id integer,
    child_entity_id integer,
    active boolean DEFAULT false NOT NULL
);


ALTER TABLE public.entity_manager OWNER TO postgres;

--
-- Name: entity_manager_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.entity_manager_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.entity_manager_id_seq OWNER TO postgres;

--
-- Name: entity_manager_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.entity_manager_id_seq OWNED BY public.entity_manager.id;


--
-- Name: entity_relationship; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.entity_relationship (
    id integer NOT NULL,
    parent_id integer NOT NULL,
    child_id integer NOT NULL,
    type character varying NOT NULL,
    role character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.entity_relationship OWNER TO postgres;

--
-- Name: entity_relationship_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.entity_relationship_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.entity_relationship_id_seq OWNER TO postgres;

--
-- Name: entity_relationship_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.entity_relationship_id_seq OWNED BY public.entity_relationship.id;


--
-- Name: entity_role; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.entity_role (
    id integer NOT NULL,
    entity_id integer,
    role_name character varying,
    enabled boolean
);


ALTER TABLE public.entity_role OWNER TO postgres;

--
-- Name: entity_role_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.entity_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.entity_role_id_seq OWNER TO postgres;

--
-- Name: entity_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.entity_role_id_seq OWNED BY public.entity_role.id;


--
-- Name: import_error; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.import_error (
    id integer NOT NULL,
    "timestamp" timestamp with time zone,
    filename character varying(1024),
    stacktrace text
);


ALTER TABLE public.import_error OWNER TO postgres;

--
-- Name: import_error_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.import_error_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.import_error_id_seq OWNER TO postgres;

--
-- Name: import_error_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.import_error_id_seq OWNED BY public.import_error.id;


--
-- Name: job; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.job (
    id integer NOT NULL,
    dag_id character varying(250),
    state character varying(20),
    job_type character varying(30),
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    latest_heartbeat timestamp with time zone,
    executor_class character varying(500),
    hostname character varying(500),
    unixname character varying(1000)
);


ALTER TABLE public.job OWNER TO postgres;

--
-- Name: job_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.job_id_seq OWNER TO postgres;

--
-- Name: job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.job_id_seq OWNED BY public.job.id;


--
-- Name: khushi_denormalized; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.khushi_denormalized (
    capture_uuid character varying NOT NULL,
    planter_first_name character varying NOT NULL,
    planter_last_name character varying NOT NULL,
    planter_identifier character varying,
    lat character varying NOT NULL,
    lon character varying NOT NULL,
    note character varying,
    approved character varying NOT NULL,
    planting_organization_uuid character varying,
    planting_organization_name character varying,
    species character varying,
    date_paid timestamp with time zone,
    paid_by character varying,
    payment_local_amt numeric,
    token_id character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.khushi_denormalized OWNER TO postgres;

--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_id_seq OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_lock_index_seq OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: leaf; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.leaf (
    leaf_id integer NOT NULL,
    leaf_name character varying NOT NULL,
    leaf_type character varying NOT NULL,
    owner character varying NOT NULL
);


ALTER TABLE public.leaf OWNER TO postgres;

--
-- Name: leaf_khushi; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.leaf_khushi (
    leaf_id integer NOT NULL,
    leaf_name character varying NOT NULL,
    leaf_type character varying NOT NULL,
    owner character varying NOT NULL
);


ALTER TABLE public.leaf_khushi OWNER TO postgres;

--
-- Name: leaf_khushi_leaf_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.leaf_khushi_leaf_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.leaf_khushi_leaf_id_seq OWNER TO postgres;

--
-- Name: leaf_khushi_leaf_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.leaf_khushi_leaf_id_seq OWNED BY public.leaf_khushi.leaf_id;


--
-- Name: leaf_leaf_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.leaf_leaf_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.leaf_leaf_id_seq OWNER TO postgres;

--
-- Name: leaf_leaf_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.leaf_leaf_id_seq OWNED BY public.leaf.leaf_id;


--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.locations_id_seq OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.locations (
    id integer DEFAULT nextval('public.locations_id_seq'::regclass) NOT NULL,
    lat character varying(10) NOT NULL,
    lon character varying(10) NOT NULL,
    gps_accuracy integer,
    planter_id integer
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: log; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.log (
    id integer NOT NULL,
    dttm timestamp with time zone,
    dag_id character varying(250),
    task_id character varying(250),
    event character varying(30),
    execution_date timestamp with time zone,
    owner character varying(500),
    extra text
);


ALTER TABLE public.log OWNER TO postgres;

--
-- Name: log_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.log_id_seq OWNER TO postgres;

--
-- Name: log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.log_id_seq OWNED BY public.log.id;


--
-- Name: long_running; Type: VIEW; Schema: public; Owner: doadmin
--

CREATE VIEW public.long_running AS
 SELECT pg_stat_activity.pid,
    (now() - pg_stat_activity.query_start) AS duration,
    pg_stat_activity.query,
    pg_stat_activity.state
   FROM pg_stat_activity
  WHERE ((now() - pg_stat_activity.query_start) > '00:05:00'::interval);


ALTER TABLE public.long_running OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: migrations_state; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.migrations_state (
    key character varying NOT NULL,
    value text NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.migrations_state OWNER TO postgres;

--
-- Name: note_trees; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.note_trees (
    tree_id integer,
    note_id integer
);


ALTER TABLE public.note_trees OWNER TO postgres;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.notes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notes_id_seq OWNER TO postgres;

--
-- Name: notes; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.notes (
    id integer DEFAULT nextval('public.notes_id_seq'::regclass) NOT NULL,
    content text,
    time_created timestamp without time zone NOT NULL,
    planter_id integer
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- Name: organization_children; Type: MATERIALIZED VIEW; Schema: public; Owner: doadmin
--

CREATE MATERIALIZED VIEW public.organization_children AS
 SELECT entity.id,
    ARRAY( SELECT getentityrelationshipchildren.entity_id
           FROM public.getentityrelationshipchildren(entity.id) getentityrelationshipchildren(entity_id, parent_id, depth, type, relationship_role)) AS children,
    entity.map_name
   FROM public.entity
  WHERE (entity.map_name IS NOT NULL)
  WITH NO DATA;


ALTER TABLE public.organization_children OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.organizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.organizations_id_seq OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: orgnization_children; Type: MATERIALIZED VIEW; Schema: public; Owner: doadmin
--

CREATE MATERIALIZED VIEW public.orgnization_children AS
 SELECT entity.id,
    ARRAY( SELECT getentityrelationshipchildren.entity_id
           FROM public.getentityrelationshipchildren(entity.id) getentityrelationshipchildren(entity_id, parent_id, depth, type, relationship_role)) AS children,
    entity.map_name
   FROM public.entity
  WHERE (entity.map_name IS NOT NULL)
  WITH NO DATA;


ALTER TABLE public.orgnization_children OWNER TO postgres;

--
-- Name: payment; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.payment (
    id integer NOT NULL,
    sender_entity_id integer,
    receiver_entity_id integer,
    date_paid date,
    tree_amt integer,
    usd_amt integer,
    local_amt integer,
    paid_by character varying
);


ALTER TABLE public.payment OWNER TO postgres;

--
-- Name: payment_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_id_seq OWNER TO postgres;

--
-- Name: payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.payment_id_seq OWNED BY public.payment.id;


--
-- Name: pending_update_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.pending_update_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pending_update_id_seq OWNER TO postgres;

--
-- Name: pending_update; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.pending_update (
    id integer DEFAULT nextval('public.pending_update_id_seq'::regclass) NOT NULL,
    planter_id integer,
    settings_id integer,
    tree_id integer,
    location_id integer
);


ALTER TABLE public.pending_update OWNER TO postgres;

--
-- Name: photo_trees; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.photo_trees (
    tree_id integer,
    photo_id integer
);


ALTER TABLE public.photo_trees OWNER TO postgres;

--
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.photos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.photos_id_seq OWNER TO postgres;

--
-- Name: photos; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.photos (
    id integer DEFAULT nextval('public.photos_id_seq'::regclass) NOT NULL,
    outdated boolean DEFAULT false,
    time_taken timestamp without time zone NOT NULL,
    location_id integer,
    user_id integer,
    base64_image bytea
);


ALTER TABLE public.photos OWNER TO postgres;

--
-- Name: planter_registrations; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.planter_registrations (
    id integer NOT NULL,
    planter_id integer,
    device_id integer,
    first_name character varying,
    last_name character varying,
    organization character varying,
    phone character varying,
    email character varying,
    location_string character varying,
    device_identifier character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    lat numeric,
    lon numeric,
    gps_accuracy integer,
    geom public.geometry(Point,4326)
);


ALTER TABLE public.planter_registrations OWNER TO postgres;

--
-- Name: planter_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.planter_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.planter_registrations_id_seq OWNER TO postgres;

--
-- Name: planter_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.planter_registrations_id_seq OWNED BY public.planter_registrations.id;


--
-- Name: planters; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.planters (
    index bigint,
    id bigint,
    first_name text,
    last_name text,
    email text,
    organization text,
    image_url text,
    person_id double precision,
    organization_id double precision
);


ALTER TABLE public.planters OWNER TO postgres;

--
-- Name: region_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.region_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.region_id_seq OWNER TO postgres;

--
-- Name: region_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.region_id_seq OWNED BY public.region.id;


--
-- Name: region_type; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.region_type (
    id integer NOT NULL,
    type character varying
);


ALTER TABLE public.region_type OWNER TO postgres;

--
-- Name: region_type_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.region_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.region_type_id_seq OWNER TO postgres;

--
-- Name: region_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.region_type_id_seq OWNED BY public.region_type.id;


--
-- Name: region_zoom; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.region_zoom (
    id integer NOT NULL,
    region_id integer,
    zoom_level integer,
    priority integer
);


ALTER TABLE public.region_zoom OWNER TO postgres;

--
-- Name: region_zoom_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.region_zoom_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.region_zoom_id_seq OWNER TO postgres;

--
-- Name: region_zoom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.region_zoom_id_seq OWNED BY public.region_zoom.id;


--
-- Name: rendered_task_instance_fields; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.rendered_task_instance_fields (
    dag_id character varying(250) NOT NULL,
    task_id character varying(250) NOT NULL,
    execution_date timestamp with time zone NOT NULL,
    rendered_fields json NOT NULL,
    k8s_pod_yaml json
);


ALTER TABLE public.rendered_task_instance_fields OWNER TO postgres;

--
-- Name: sensor_instance; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.sensor_instance (
    id integer NOT NULL,
    task_id character varying(250) NOT NULL,
    dag_id character varying(250) NOT NULL,
    execution_date timestamp with time zone NOT NULL,
    state character varying(20),
    try_number integer,
    start_date timestamp with time zone,
    operator character varying(1000) NOT NULL,
    op_classpath character varying(1000) NOT NULL,
    hashcode bigint NOT NULL,
    shardcode integer NOT NULL,
    poke_context text NOT NULL,
    execution_context text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sensor_instance OWNER TO postgres;

--
-- Name: sensor_instance_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.sensor_instance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sensor_instance_id_seq OWNER TO postgres;

--
-- Name: sensor_instance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.sensor_instance_id_seq OWNED BY public.sensor_instance.id;


--
-- Name: serialized_dag; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.serialized_dag (
    dag_id character varying(250) NOT NULL,
    fileloc character varying(2000) NOT NULL,
    fileloc_hash bigint NOT NULL,
    data json NOT NULL,
    last_updated timestamp with time zone NOT NULL,
    dag_hash character varying(32) DEFAULT 'Hash not calculated yet'::character varying NOT NULL
);


ALTER TABLE public.serialized_dag OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.settings (
    id integer DEFAULT nextval('public.settings_id_seq'::regclass) NOT NULL,
    next_update integer DEFAULT 30,
    min_gps_accuracy integer DEFAULT 30
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: sla_miss; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.sla_miss (
    task_id character varying(250) NOT NULL,
    dag_id character varying(250) NOT NULL,
    execution_date timestamp with time zone NOT NULL,
    email_sent boolean,
    "timestamp" timestamp with time zone,
    description text,
    notification_sent boolean
);


ALTER TABLE public.sla_miss OWNER TO postgres;

--
-- Name: slot_pool; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.slot_pool (
    id integer NOT NULL,
    pool character varying(256),
    slots integer,
    description text
);


ALTER TABLE public.slot_pool OWNER TO postgres;

--
-- Name: slot_pool_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.slot_pool_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.slot_pool_id_seq OWNER TO postgres;

--
-- Name: slot_pool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.slot_pool_id_seq OWNED BY public.slot_pool.id;


--
-- Name: survey; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.survey (
    id uuid NOT NULL,
    title character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    active boolean NOT NULL
);


ALTER TABLE public.survey OWNER TO postgres;

--
-- Name: survey_question; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.survey_question (
    id uuid NOT NULL,
    survey_id uuid NOT NULL,
    prompt character varying NOT NULL,
    rank integer NOT NULL,
    choices character varying[] NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.survey_question OWNER TO postgres;

--
-- Name: tag; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.tag (
    id integer NOT NULL,
    tag_name character varying,
    active boolean DEFAULT true NOT NULL,
    public boolean DEFAULT true NOT NULL
);


ALTER TABLE public.tag OWNER TO postgres;

--
-- Name: tag_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tag_id_seq OWNER TO postgres;

--
-- Name: tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.tag_id_seq OWNED BY public.tag.id;


--
-- Name: task_fail; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.task_fail (
    id integer NOT NULL,
    task_id character varying(250) NOT NULL,
    dag_id character varying(250) NOT NULL,
    execution_date timestamp with time zone NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    duration integer
);


ALTER TABLE public.task_fail OWNER TO postgres;

--
-- Name: task_fail_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.task_fail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_fail_id_seq OWNER TO postgres;

--
-- Name: task_fail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.task_fail_id_seq OWNED BY public.task_fail.id;


--
-- Name: task_id_sequence; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.task_id_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_id_sequence OWNER TO postgres;

--
-- Name: task_instance; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.task_instance (
    task_id character varying(250) NOT NULL,
    dag_id character varying(250) NOT NULL,
    execution_date timestamp with time zone NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    duration double precision,
    state character varying(20),
    try_number integer,
    hostname character varying(1000),
    unixname character varying(1000),
    job_id integer,
    pool character varying(256) NOT NULL,
    queue character varying(256),
    priority_weight integer,
    operator character varying(1000),
    queued_dttm timestamp with time zone,
    pid integer,
    max_tries integer DEFAULT '-1'::integer,
    executor_config bytea,
    pool_slots integer NOT NULL,
    queued_by_job_id integer,
    external_executor_id character varying(250)
);


ALTER TABLE public.task_instance OWNER TO postgres;

--
-- Name: task_reschedule; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.task_reschedule (
    id integer NOT NULL,
    task_id character varying(250) NOT NULL,
    dag_id character varying(250) NOT NULL,
    execution_date timestamp with time zone NOT NULL,
    try_number integer NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    duration integer NOT NULL,
    reschedule_date timestamp with time zone NOT NULL
);


ALTER TABLE public.task_reschedule OWNER TO postgres;

--
-- Name: task_reschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.task_reschedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_reschedule_id_seq OWNER TO postgres;

--
-- Name: task_reschedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.task_reschedule_id_seq OWNED BY public.task_reschedule.id;


--
-- Name: taskset_id_sequence; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.taskset_id_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.taskset_id_sequence OWNER TO postgres;

--
-- Name: test; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.test (
    column1 public.geometry
);


ALTER TABLE public.test OWNER TO postgres;

--
-- Name: token_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.token_id_seq OWNER TO postgres;

--
-- Name: token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.token_id_seq OWNED BY public.token.id;


--
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tokens_id_seq OWNER TO postgres;

--
-- Name: trading.transaction; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public."trading.transaction" (
    id integer NOT NULL,
    token_id integer NOT NULL,
    transfer_id integer NOT NULL,
    source_entity_id integer NOT NULL,
    destination_entity_id integer NOT NULL,
    processed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."trading.transaction" OWNER TO postgres;

--
-- Name: transaction; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.transaction (
    id integer NOT NULL,
    token_id integer,
    sender_entity_id integer,
    receiver_entity_id integer,
    processed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transaction OWNER TO postgres;

--
-- Name: transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transaction_id_seq OWNER TO postgres;

--
-- Name: transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.transaction_id_seq OWNED BY public.transaction.id;


--
-- Name: transfer; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.transfer (
    id integer NOT NULL,
    executing_entity_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transfer OWNER TO postgres;

--
-- Name: transfer_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.transfer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transfer_id_seq OWNER TO postgres;

--
-- Name: transfer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.transfer_id_seq OWNED BY public.transfer.id;


--
-- Name: tree_attributes; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.tree_attributes (
    id integer NOT NULL,
    tree_id integer,
    key character varying,
    value character varying
);


ALTER TABLE public.tree_attributes OWNER TO postgres;

--
-- Name: tree_attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.tree_attributes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tree_attributes_id_seq OWNER TO postgres;

--
-- Name: tree_attributes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.tree_attributes_id_seq OWNED BY public.tree_attributes.id;


--
-- Name: tree_name; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.tree_name (
    id integer NOT NULL,
    name character varying,
    used boolean DEFAULT false NOT NULL
);


ALTER TABLE public.tree_name OWNER TO postgres;

--
-- Name: tree_name_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.tree_name_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tree_name_id_seq OWNER TO postgres;

--
-- Name: tree_name_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.tree_name_id_seq OWNED BY public.tree_name.id;


--
-- Name: tree_region_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.tree_region_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tree_region_id_seq OWNER TO postgres;

--
-- Name: tree_region_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.tree_region_id_seq OWNED BY public.tree_region.id;


--
-- Name: tree_species_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.tree_species_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tree_species_id_seq OWNER TO postgres;

--
-- Name: tree_species; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.tree_species (
    id integer DEFAULT nextval('public.tree_species_id_seq'::regclass) NOT NULL,
    name character varying(45) NOT NULL,
    "desc" text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    value_factor integer
);


ALTER TABLE public.tree_species OWNER TO postgres;

--
-- Name: tree_tag; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.tree_tag (
    id integer NOT NULL,
    tree_id integer,
    tag_id integer
);


ALTER TABLE public.tree_tag OWNER TO postgres;

--
-- Name: tree_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.tree_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tree_tag_id_seq OWNER TO postgres;

--
-- Name: tree_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.tree_tag_id_seq OWNED BY public.tree_tag.id;


--
-- Name: trees_active; Type: MATERIALIZED VIEW; Schema: public; Owner: doadmin
--

CREATE MATERIALIZED VIEW public.trees_active AS
 SELECT trees.id,
    trees.time_created,
    trees.time_updated,
    trees.missing,
    trees.priority,
    trees.cause_of_death_id,
    trees.planter_id AS user_id,
    trees.primary_location_id,
    trees.settings_id,
    trees.override_settings_id,
    trees.dead,
    trees.photo_id,
    trees.image_url,
    trees.certificate_id,
    trees.estimated_geometric_location,
    trees.lat,
    trees.lon,
    trees.gps_accuracy,
    trees.active,
    trees.planter_photo_url,
    trees.planter_identifier,
    trees.device_id,
    trees.sequence,
    trees.note,
    trees.verified,
    trees.uuid,
    trees.approved,
    trees.status,
    trees.cluster_regions_assigned
   FROM public.trees
  WHERE (trees.active = true)
  WITH NO DATA;


ALTER TABLE public.trees_active OWNER TO postgres;

--
-- Name: treetracker_capture_backup; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.treetracker_capture_backup (
    id uuid,
    reference_id bigint,
    tree_id uuid,
    image_url character varying,
    lat numeric,
    lon numeric,
    estimated_geometric_location public.geometry(Point,4326),
    gps_accuracy smallint,
    planter_id bigint,
    planter_photo_url character varying,
    planter_username character varying,
    planting_organization_id integer,
    device_identifier character varying,
    species_id integer,
    morphology character varying,
    age smallint,
    note character varying,
    attributes jsonb,
    domain_specific_data jsonb,
    status character varying,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    estimated_geographic_location public.geography(Point,4326)
);


ALTER TABLE public.treetracker_capture_backup OWNER TO postgres;

--
-- Name: treetracker_tree_backup; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.treetracker_tree_backup (
    id uuid,
    latest_capture_id uuid,
    image_url character varying,
    lat numeric,
    lon numeric,
    estimated_geometric_location public.geometry(Point,4326),
    gps_accuracy smallint,
    species_id integer,
    morphology character varying,
    age smallint,
    status character varying,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    estimated_geographic_location public.geography(Point,4326)
);


ALTER TABLE public.treetracker_tree_backup OWNER TO postgres;

--
-- Name: variable; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.variable (
    id integer NOT NULL,
    key character varying(250),
    val text,
    is_encrypted boolean,
    description text
);


ALTER TABLE public.variable OWNER TO postgres;

--
-- Name: variable_id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.variable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.variable_id_seq OWNER TO postgres;

--
-- Name: variable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.variable_id_seq OWNED BY public.variable.id;


--
-- Name: xcom; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE public.xcom (
    key character varying(512) NOT NULL,
    value bytea,
    "timestamp" timestamp with time zone NOT NULL,
    execution_date timestamp with time zone NOT NULL,
    task_id character varying(250) NOT NULL,
    dag_id character varying(250) NOT NULL
);


ALTER TABLE public.xcom OWNER TO postgres;

--
-- Name: ab_permission id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission ALTER COLUMN id SET DEFAULT nextval('public.ab_permission_id_seq'::regclass);


--
-- Name: ab_permission_view id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view ALTER COLUMN id SET DEFAULT nextval('public.ab_permission_view_id_seq'::regclass);


--
-- Name: ab_permission_view_role id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view_role ALTER COLUMN id SET DEFAULT nextval('public.ab_permission_view_role_id_seq'::regclass);


--
-- Name: ab_register_user id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_register_user ALTER COLUMN id SET DEFAULT nextval('public.ab_register_user_id_seq'::regclass);


--
-- Name: ab_role id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_role ALTER COLUMN id SET DEFAULT nextval('public.ab_role_id_seq'::regclass);


--
-- Name: ab_user id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user ALTER COLUMN id SET DEFAULT nextval('public.ab_user_id_seq'::regclass);


--
-- Name: ab_user_role id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user_role ALTER COLUMN id SET DEFAULT nextval('public.ab_user_role_id_seq'::regclass);


--
-- Name: ab_view_menu id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_view_menu ALTER COLUMN id SET DEFAULT nextval('public.ab_view_menu_id_seq'::regclass);


--
-- Name: admin_role id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.admin_role ALTER COLUMN id SET DEFAULT nextval('public.admin_role_id_seq'::regclass);


--
-- Name: admin_user id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.admin_user ALTER COLUMN id SET DEFAULT nextval('public.admin_user_id_seq'::regclass);


--
-- Name: admin_user_role id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.admin_user_role ALTER COLUMN id SET DEFAULT nextval('public.admin_user_role_id_seq'::regclass);


--
-- Name: api_key id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.api_key ALTER COLUMN id SET DEFAULT nextval('public.api_key_id_seq'::regclass);


--
-- Name: audit id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.audit ALTER COLUMN id SET DEFAULT nextval('public.audit_id_seq'::regclass);


--
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- Name: clusters id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.clusters ALTER COLUMN id SET DEFAULT nextval('public.clusters_id_seq'::regclass);


--
-- Name: connection id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.connection ALTER COLUMN id SET DEFAULT nextval('public.connection_id_seq'::regclass);


--
-- Name: contract id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.contract ALTER COLUMN id SET DEFAULT nextval('public.contract_id_seq'::regclass);


--
-- Name: dag_pickle id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag_pickle ALTER COLUMN id SET DEFAULT nextval('public.dag_pickle_id_seq'::regclass);


--
-- Name: dag_run id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag_run ALTER COLUMN id SET DEFAULT nextval('public.dag_run_id_seq'::regclass);


--
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- Name: donors id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.donors ALTER COLUMN id SET DEFAULT nextval('public.donors_id_seq'::regclass);


--
-- Name: entity id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity ALTER COLUMN id SET DEFAULT nextval('public.entity_id_seq'::regclass);


--
-- Name: entity_manager id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity_manager ALTER COLUMN id SET DEFAULT nextval('public.entity_manager_id_seq'::regclass);


--
-- Name: entity_relationship id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity_relationship ALTER COLUMN id SET DEFAULT nextval('public.entity_relationship_id_seq'::regclass);


--
-- Name: entity_role id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity_role ALTER COLUMN id SET DEFAULT nextval('public.entity_role_id_seq'::regclass);


--
-- Name: import_error id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.import_error ALTER COLUMN id SET DEFAULT nextval('public.import_error_id_seq'::regclass);


--
-- Name: job id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.job ALTER COLUMN id SET DEFAULT nextval('public.job_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: leaf leaf_id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.leaf ALTER COLUMN leaf_id SET DEFAULT nextval('public.leaf_leaf_id_seq'::regclass);


--
-- Name: leaf_khushi leaf_id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.leaf_khushi ALTER COLUMN leaf_id SET DEFAULT nextval('public.leaf_khushi_leaf_id_seq'::regclass);


--
-- Name: log id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.log ALTER COLUMN id SET DEFAULT nextval('public.log_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: payment id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.payment ALTER COLUMN id SET DEFAULT nextval('public.payment_id_seq'::regclass);


--
-- Name: planter_registrations id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.planter_registrations ALTER COLUMN id SET DEFAULT nextval('public.planter_registrations_id_seq'::regclass);


--
-- Name: region id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.region ALTER COLUMN id SET DEFAULT nextval('public.region_id_seq'::regclass);


--
-- Name: region_type id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.region_type ALTER COLUMN id SET DEFAULT nextval('public.region_type_id_seq'::regclass);


--
-- Name: region_zoom id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.region_zoom ALTER COLUMN id SET DEFAULT nextval('public.region_zoom_id_seq'::regclass);


--
-- Name: sensor_instance id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.sensor_instance ALTER COLUMN id SET DEFAULT nextval('public.sensor_instance_id_seq'::regclass);


--
-- Name: slot_pool id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.slot_pool ALTER COLUMN id SET DEFAULT nextval('public.slot_pool_id_seq'::regclass);


--
-- Name: tag id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.tag ALTER COLUMN id SET DEFAULT nextval('public.tag_id_seq'::regclass);


--
-- Name: task_fail id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.task_fail ALTER COLUMN id SET DEFAULT nextval('public.task_fail_id_seq'::regclass);


--
-- Name: task_reschedule id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.task_reschedule ALTER COLUMN id SET DEFAULT nextval('public.task_reschedule_id_seq'::regclass);


--
-- Name: token id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.token ALTER COLUMN id SET DEFAULT nextval('public.token_id_seq'::regclass);


--
-- Name: transaction id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.transaction ALTER COLUMN id SET DEFAULT nextval('public.transaction_id_seq'::regclass);


--
-- Name: transfer id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.transfer ALTER COLUMN id SET DEFAULT nextval('public.transfer_id_seq'::regclass);


--
-- Name: tree_attributes id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.tree_attributes ALTER COLUMN id SET DEFAULT nextval('public.tree_attributes_id_seq'::regclass);


--
-- Name: tree_name id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.tree_name ALTER COLUMN id SET DEFAULT nextval('public.tree_name_id_seq'::regclass);


--
-- Name: tree_region id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.tree_region ALTER COLUMN id SET DEFAULT nextval('public.tree_region_id_seq'::regclass);


--
-- Name: tree_tag id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.tree_tag ALTER COLUMN id SET DEFAULT nextval('public.tree_tag_id_seq'::regclass);


--
-- Name: variable id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.variable ALTER COLUMN id SET DEFAULT nextval('public.variable_id_seq'::regclass);


--
-- Name: ab_permission ab_permission_name_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission
    ADD CONSTRAINT ab_permission_name_key UNIQUE (name);


--
-- Name: ab_permission ab_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission
    ADD CONSTRAINT ab_permission_pkey PRIMARY KEY (id);


--
-- Name: ab_permission_view ab_permission_view_permission_id_view_menu_id_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view
    ADD CONSTRAINT ab_permission_view_permission_id_view_menu_id_key UNIQUE (permission_id, view_menu_id);


--
-- Name: ab_permission_view ab_permission_view_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view
    ADD CONSTRAINT ab_permission_view_pkey PRIMARY KEY (id);


--
-- Name: ab_permission_view_role ab_permission_view_role_permission_view_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view_role
    ADD CONSTRAINT ab_permission_view_role_permission_view_id_role_id_key UNIQUE (permission_view_id, role_id);


--
-- Name: ab_permission_view_role ab_permission_view_role_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view_role
    ADD CONSTRAINT ab_permission_view_role_pkey PRIMARY KEY (id);


--
-- Name: ab_register_user ab_register_user_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_register_user
    ADD CONSTRAINT ab_register_user_pkey PRIMARY KEY (id);


--
-- Name: ab_register_user ab_register_user_username_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_register_user
    ADD CONSTRAINT ab_register_user_username_key UNIQUE (username);


--
-- Name: ab_role ab_role_name_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_role
    ADD CONSTRAINT ab_role_name_key UNIQUE (name);


--
-- Name: ab_role ab_role_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_role
    ADD CONSTRAINT ab_role_pkey PRIMARY KEY (id);


--
-- Name: ab_user ab_user_email_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user
    ADD CONSTRAINT ab_user_email_key UNIQUE (email);


--
-- Name: ab_user ab_user_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user
    ADD CONSTRAINT ab_user_pkey PRIMARY KEY (id);


--
-- Name: ab_user_role ab_user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user_role
    ADD CONSTRAINT ab_user_role_pkey PRIMARY KEY (id);


--
-- Name: ab_user_role ab_user_role_user_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user_role
    ADD CONSTRAINT ab_user_role_user_id_role_id_key UNIQUE (user_id, role_id);


--
-- Name: ab_user ab_user_username_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user
    ADD CONSTRAINT ab_user_username_key UNIQUE (username);


--
-- Name: ab_view_menu ab_view_menu_name_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_view_menu
    ADD CONSTRAINT ab_view_menu_name_key UNIQUE (name);


--
-- Name: ab_view_menu ab_view_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_view_menu
    ADD CONSTRAINT ab_view_menu_pkey PRIMARY KEY (id);


--
-- Name: admin_role admin_role_identifier_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.admin_role
    ADD CONSTRAINT admin_role_identifier_key UNIQUE (identifier);


--
-- Name: admin_role admin_role_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.admin_role
    ADD CONSTRAINT admin_role_pkey PRIMARY KEY (id);


--
-- Name: admin_user admin_user_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.admin_user
    ADD CONSTRAINT admin_user_pkey PRIMARY KEY (id);


--
-- Name: admin_user_role admin_user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.admin_user_role
    ADD CONSTRAINT admin_user_role_pkey PRIMARY KEY (id);


--
-- Name: admin_user_role admin_user_role_un; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.admin_user_role
    ADD CONSTRAINT admin_user_role_un UNIQUE (role_id, admin_user_id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: api_key api_key_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.api_key
    ADD CONSTRAINT api_key_pkey PRIMARY KEY (id);


--
-- Name: audit audit_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.audit
    ADD CONSTRAINT audit_pkey PRIMARY KEY (id);


--
-- Name: celery_taskmeta celery_taskmeta_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.celery_taskmeta
    ADD CONSTRAINT celery_taskmeta_pkey PRIMARY KEY (id);


--
-- Name: celery_taskmeta celery_taskmeta_task_id_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.celery_taskmeta
    ADD CONSTRAINT celery_taskmeta_task_id_key UNIQUE (task_id);


--
-- Name: celery_tasksetmeta celery_tasksetmeta_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.celery_tasksetmeta
    ADD CONSTRAINT celery_tasksetmeta_pkey PRIMARY KEY (id);


--
-- Name: celery_tasksetmeta celery_tasksetmeta_taskset_id_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.celery_tasksetmeta
    ADD CONSTRAINT celery_tasksetmeta_taskset_id_key UNIQUE (taskset_id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: clusters clusters_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.clusters
    ADD CONSTRAINT clusters_pkey PRIMARY KEY (id);


--
-- Name: connection connection_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.connection
    ADD CONSTRAINT connection_pkey PRIMARY KEY (id);


--
-- Name: contract contract_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT contract_pkey PRIMARY KEY (id);


--
-- Name: dag_code dag_code_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag_code
    ADD CONSTRAINT dag_code_pkey PRIMARY KEY (fileloc_hash);


--
-- Name: dag_pickle dag_pickle_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag_pickle
    ADD CONSTRAINT dag_pickle_pkey PRIMARY KEY (id);


--
-- Name: dag dag_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag
    ADD CONSTRAINT dag_pkey PRIMARY KEY (dag_id);


--
-- Name: dag_run dag_run_dag_id_execution_date_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag_run
    ADD CONSTRAINT dag_run_dag_id_execution_date_key UNIQUE (dag_id, execution_date);


--
-- Name: dag_run dag_run_dag_id_run_id_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag_run
    ADD CONSTRAINT dag_run_dag_id_run_id_key UNIQUE (dag_id, run_id);


--
-- Name: dag_run dag_run_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag_run
    ADD CONSTRAINT dag_run_pkey PRIMARY KEY (id);


--
-- Name: dag_tag dag_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag_tag
    ADD CONSTRAINT dag_tag_pkey PRIMARY KEY (name, dag_id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: domain_event domain_event_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event
    ADD CONSTRAINT domain_event_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_handled domain_event_handled_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_handled
    ADD CONSTRAINT domain_event_handled_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_handled_2021 domain_event_handled_2021_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_handled_2021
    ADD CONSTRAINT domain_event_handled_2021_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_handled_2022 domain_event_handled_2022_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_handled_2022
    ADD CONSTRAINT domain_event_handled_2022_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_handled_2023 domain_event_handled_2023_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_handled_2023
    ADD CONSTRAINT domain_event_handled_2023_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_raised domain_event_raised_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_raised
    ADD CONSTRAINT domain_event_raised_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_received domain_event_received_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_received
    ADD CONSTRAINT domain_event_received_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_sent domain_event_sent_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_sent
    ADD CONSTRAINT domain_event_sent_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_sent_2021 domain_event_sent_2021_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_sent_2021
    ADD CONSTRAINT domain_event_sent_2021_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_sent_2022 domain_event_sent_2022_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_sent_2022
    ADD CONSTRAINT domain_event_sent_2022_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: domain_event_sent_2023 domain_event_sent_2023_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.domain_event_sent_2023
    ADD CONSTRAINT domain_event_sent_2023_pkey PRIMARY KEY (id, status, created_at);


--
-- Name: donors donors_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.donors
    ADD CONSTRAINT donors_pkey PRIMARY KEY (id);


--
-- Name: entity_manager entity_manager_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity_manager
    ADD CONSTRAINT entity_manager_pkey PRIMARY KEY (id);


--
-- Name: entity entity_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_pkey PRIMARY KEY (id);


--
-- Name: entity_relationship entity_relationship_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity_relationship
    ADD CONSTRAINT entity_relationship_pkey PRIMARY KEY (id);


--
-- Name: entity_role entity_role_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity_role
    ADD CONSTRAINT entity_role_pkey PRIMARY KEY (id);


--
-- Name: import_error import_error_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.import_error
    ADD CONSTRAINT import_error_pkey PRIMARY KEY (id);


--
-- Name: job job_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: leaf_khushi leaf_khushi_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.leaf_khushi
    ADD CONSTRAINT leaf_khushi_pkey PRIMARY KEY (leaf_id);


--
-- Name: leaf leaf_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.leaf
    ADD CONSTRAINT leaf_pkey PRIMARY KEY (leaf_id);


--
-- Name: locations locations_id_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_id_pkey PRIMARY KEY (id);


--
-- Name: log log_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.log
    ADD CONSTRAINT log_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: migrations_state migrations_state_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.migrations_state
    ADD CONSTRAINT migrations_state_pkey PRIMARY KEY (key);


--
-- Name: notes notes_id_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_id_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: pending_update pending_update_id_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.pending_update
    ADD CONSTRAINT pending_update_id_pkey PRIMARY KEY (id);


--
-- Name: photos photos_id_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_id_pkey PRIMARY KEY (id);


--
-- Name: xcom pk_xcom; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.xcom
    ADD CONSTRAINT pk_xcom PRIMARY KEY (dag_id, task_id, key, execution_date);


--
-- Name: planter planter_id_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.planter
    ADD CONSTRAINT planter_id_key PRIMARY KEY (id);


--
-- Name: planter_registrations planter_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.planter_registrations
    ADD CONSTRAINT planter_registrations_pkey PRIMARY KEY (id);


--
-- Name: region region_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.region
    ADD CONSTRAINT region_pkey PRIMARY KEY (id);


--
-- Name: region_type region_type_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.region_type
    ADD CONSTRAINT region_type_pkey PRIMARY KEY (id);


--
-- Name: rendered_task_instance_fields rendered_task_instance_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.rendered_task_instance_fields
    ADD CONSTRAINT rendered_task_instance_fields_pkey PRIMARY KEY (dag_id, task_id, execution_date);


--
-- Name: sensor_instance sensor_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.sensor_instance
    ADD CONSTRAINT sensor_instance_pkey PRIMARY KEY (id);


--
-- Name: serialized_dag serialized_dag_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.serialized_dag
    ADD CONSTRAINT serialized_dag_pkey PRIMARY KEY (dag_id);


--
-- Name: sla_miss sla_miss_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.sla_miss
    ADD CONSTRAINT sla_miss_pkey PRIMARY KEY (task_id, dag_id, execution_date);


--
-- Name: slot_pool slot_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.slot_pool
    ADD CONSTRAINT slot_pool_pkey PRIMARY KEY (id);


--
-- Name: slot_pool slot_pool_pool_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.slot_pool
    ADD CONSTRAINT slot_pool_pool_key UNIQUE (pool);


--
-- Name: survey survey_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_pkey PRIMARY KEY (id);


--
-- Name: survey_question survey_question_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.survey_question
    ADD CONSTRAINT survey_question_pkey PRIMARY KEY (id);


--
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: task_fail task_fail_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.task_fail
    ADD CONSTRAINT task_fail_pkey PRIMARY KEY (id);


--
-- Name: task_instance task_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.task_instance
    ADD CONSTRAINT task_instance_pkey PRIMARY KEY (task_id, dag_id, execution_date);


--
-- Name: task_reschedule task_reschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.task_reschedule
    ADD CONSTRAINT task_reschedule_pkey PRIMARY KEY (id);


--
-- Name: token token_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_pkey PRIMARY KEY (id);


--
-- Name: trading.transaction trading.transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public."trading.transaction"
    ADD CONSTRAINT "trading.transaction_pkey" PRIMARY KEY (id);


--
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (id);


--
-- Name: transfer transfer_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.transfer
    ADD CONSTRAINT transfer_pkey PRIMARY KEY (id);


--
-- Name: trees tree_id_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.trees
    ADD CONSTRAINT tree_id_key PRIMARY KEY (id);


--
-- Name: tree_name tree_name_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.tree_name
    ADD CONSTRAINT tree_name_pkey PRIMARY KEY (id);


--
-- Name: tree_species tree_species_pk; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.tree_species
    ADD CONSTRAINT tree_species_pk PRIMARY KEY (id);


--
-- Name: tree_tag tree_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.tree_tag
    ADD CONSTRAINT tree_tag_pkey PRIMARY KEY (id);


--
-- Name: connection unique_conn_id; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.connection
    ADD CONSTRAINT unique_conn_id UNIQUE (conn_id);


--
-- Name: variable variable_key_key; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.variable
    ADD CONSTRAINT variable_key_key UNIQUE (key);


--
-- Name: variable variable_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.variable
    ADD CONSTRAINT variable_pkey PRIMARY KEY (id);


--
-- Name: active_tree_region_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE UNIQUE INDEX active_tree_region_id_idx ON public.active_tree_region USING btree (id);


--
-- Name: active_tree_region_region_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX active_tree_region_region_id_idx ON public.active_tree_region USING btree (region_id);


--
-- Name: active_tree_region_zoom_level_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX active_tree_region_zoom_level_idx ON public.active_tree_region USING btree (zoom_level);


--
-- Name: admin_user_un; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE UNIQUE INDEX admin_user_un ON public.admin_user USING btree (user_name) WHERE (active = true);


--
-- Name: dag_id_state; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX dag_id_state ON public.dag_run USING btree (dag_id, state);


--
-- Name: devices_android_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE UNIQUE INDEX devices_android_id_idx ON public.devices USING btree (android_id);


--
-- Name: event_pyld_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX event_pyld_idx ON ONLY public.domain_event USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_handled_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_handled_payload_idx ON ONLY public.domain_event_handled USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_handled_2021_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_handled_2021_payload_idx ON public.domain_event_handled_2021 USING gin (payload jsonb_path_ops);


--
-- Name: event_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX event_status_idx ON ONLY public.domain_event USING btree (status);


--
-- Name: domain_event_handled_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_handled_status_idx ON ONLY public.domain_event_handled USING btree (status);


--
-- Name: domain_event_handled_2021_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_handled_2021_status_idx ON public.domain_event_handled_2021 USING btree (status);


--
-- Name: domain_event_handled_2022_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_handled_2022_payload_idx ON public.domain_event_handled_2022 USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_handled_2022_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_handled_2022_status_idx ON public.domain_event_handled_2022 USING btree (status);


--
-- Name: domain_event_handled_2023_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_handled_2023_payload_idx ON public.domain_event_handled_2023 USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_handled_2023_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_handled_2023_status_idx ON public.domain_event_handled_2023 USING btree (status);


--
-- Name: domain_event_raised_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_raised_payload_idx ON public.domain_event_raised USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_raised_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_raised_status_idx ON public.domain_event_raised USING btree (status);


--
-- Name: domain_event_received_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_received_payload_idx ON public.domain_event_received USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_received_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_received_status_idx ON public.domain_event_received USING btree (status);


--
-- Name: domain_event_sent_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_sent_payload_idx ON ONLY public.domain_event_sent USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_sent_2021_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_sent_2021_payload_idx ON public.domain_event_sent_2021 USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_sent_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_sent_status_idx ON ONLY public.domain_event_sent USING btree (status);


--
-- Name: domain_event_sent_2021_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_sent_2021_status_idx ON public.domain_event_sent_2021 USING btree (status);


--
-- Name: domain_event_sent_2022_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_sent_2022_payload_idx ON public.domain_event_sent_2022 USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_sent_2022_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_sent_2022_status_idx ON public.domain_event_sent_2022 USING btree (status);


--
-- Name: domain_event_sent_2023_payload_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_sent_2023_payload_idx ON public.domain_event_sent_2023 USING gin (payload jsonb_path_ops);


--
-- Name: domain_event_sent_2023_status_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX domain_event_sent_2023_status_idx ON public.domain_event_sent_2023 USING btree (status);


--
-- Name: entity_wallet_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE UNIQUE INDEX entity_wallet_idx ON public.entity USING btree (wallet);


--
-- Name: estimated_geometric_location_ind_gist; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX estimated_geometric_location_ind_gist ON public.trees USING gist (estimated_geometric_location);


--
-- Name: idx_fileloc_hash; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX idx_fileloc_hash ON public.serialized_dag USING btree (fileloc_hash);


--
-- Name: idx_job_state_heartbeat; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX idx_job_state_heartbeat ON public.job USING btree (state, latest_heartbeat);


--
-- Name: idx_last_scheduling_decision; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX idx_last_scheduling_decision ON public.dag_run USING btree (last_scheduling_decision);


--
-- Name: idx_log_dag; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX idx_log_dag ON public.log USING btree (dag_id);


--
-- Name: idx_next_dagrun_create_after; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX idx_next_dagrun_create_after ON public.dag USING btree (next_dagrun_create_after);


--
-- Name: idx_root_dag_id; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX idx_root_dag_id ON public.dag USING btree (root_dag_id);


--
-- Name: idx_task_fail_dag_task_date; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX idx_task_fail_dag_task_date ON public.task_fail USING btree (dag_id, task_id, execution_date);


--
-- Name: idx_task_reschedule_dag_task_date; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX idx_task_reschedule_dag_task_date ON public.task_reschedule USING btree (dag_id, task_id, execution_date);


--
-- Name: ix_anonymous_entities_index; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ix_anonymous_entities_index ON public.anonymous_entities USING btree (index);


--
-- Name: ix_anonymous_planters_index; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ix_anonymous_planters_index ON public.anonymous_planters USING btree (index);


--
-- Name: ix_anonymous_trees_index; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ix_anonymous_trees_index ON public.anonymous_trees USING btree (index);


--
-- Name: ix_entities_index; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ix_entities_index ON public.entities USING btree (index);


--
-- Name: ix_planters_index; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ix_planters_index ON public.planters USING btree (index);


--
-- Name: job_type_heart; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX job_type_heart ON public.job USING btree (job_type, latest_heartbeat);


--
-- Name: payment_receiver_entity_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX payment_receiver_entity_id_idx ON public.payment USING btree (receiver_entity_id);


--
-- Name: payment_sender_entity_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX payment_sender_entity_id_idx ON public.payment USING btree (sender_entity_id);


--
-- Name: region_gemo_index_gist; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX region_gemo_index_gist ON public.region USING gist (geom);


--
-- Name: region_zoom_region_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX region_zoom_region_id_idx ON public.region_zoom USING btree (region_id);


--
-- Name: si_hashcode; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX si_hashcode ON public.sensor_instance USING btree (hashcode);


--
-- Name: si_shardcode; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX si_shardcode ON public.sensor_instance USING btree (shardcode);


--
-- Name: si_state_shard; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX si_state_shard ON public.sensor_instance USING btree (state, shardcode);


--
-- Name: si_updated_at; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX si_updated_at ON public.sensor_instance USING btree (updated_at);


--
-- Name: sm_dag; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX sm_dag ON public.sla_miss USING btree (dag_id);


--
-- Name: ti_dag_date; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ti_dag_date ON public.task_instance USING btree (dag_id, execution_date);


--
-- Name: ti_dag_state; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ti_dag_state ON public.task_instance USING btree (dag_id, state);


--
-- Name: ti_job_id; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ti_job_id ON public.task_instance USING btree (job_id);


--
-- Name: ti_pool; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ti_pool ON public.task_instance USING btree (pool, state, priority_weight);


--
-- Name: ti_primary_key; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE UNIQUE INDEX ti_primary_key ON public.sensor_instance USING btree (dag_id, task_id, execution_date);


--
-- Name: ti_state; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ti_state ON public.task_instance USING btree (state);


--
-- Name: ti_state_lkp; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX ti_state_lkp ON public.task_instance USING btree (dag_id, task_id, execution_date, state);


--
-- Name: token_entity_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX token_entity_id_idx ON public.token USING btree (entity_id);


--
-- Name: token_trees_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX token_trees_id_idx ON public.token USING btree (tree_id);


--
-- Name: transaction_receiver_entity_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX transaction_receiver_entity_id_idx ON public.transaction USING btree (receiver_entity_id);


--
-- Name: transaction_sender_entity_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX transaction_sender_entity_id_idx ON public.transaction USING btree (sender_entity_id);


--
-- Name: tree_name_name_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE UNIQUE INDEX tree_name_name_idx ON public.tree_name USING btree (name);


--
-- Name: trees_approved_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX trees_approved_idx ON public.trees USING btree (approved);


--
-- Name: trees_name_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE UNIQUE INDEX trees_name_idx ON public.trees USING btree (name);


--
-- Name: trees_payment_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX trees_payment_id_idx ON public.trees USING btree (payment_id);


--
-- Name: trees_planter_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX trees_planter_id_idx ON public.trees USING btree (planter_id);


--
-- Name: trees_planting_organization_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX trees_planting_organization_id_idx ON public.trees USING btree (planting_organization_id);


--
-- Name: trees_species_id_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE INDEX trees_species_id_idx ON public.trees USING btree (species_id);


--
-- Name: trees_uuid_idx; Type: INDEX; Schema: public; Owner: doadmin
--

CREATE UNIQUE INDEX trees_uuid_idx ON public.trees USING btree (uuid);


--
-- Name: domain_event_handled_2021_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_handled_payload_idx ATTACH PARTITION public.domain_event_handled_2021_payload_idx;


--
-- Name: domain_event_handled_2021_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_handled_pkey ATTACH PARTITION public.domain_event_handled_2021_pkey;


--
-- Name: domain_event_handled_2021_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_handled_status_idx ATTACH PARTITION public.domain_event_handled_2021_status_idx;


--
-- Name: domain_event_handled_2022_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_handled_payload_idx ATTACH PARTITION public.domain_event_handled_2022_payload_idx;


--
-- Name: domain_event_handled_2022_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_handled_pkey ATTACH PARTITION public.domain_event_handled_2022_pkey;


--
-- Name: domain_event_handled_2022_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_handled_status_idx ATTACH PARTITION public.domain_event_handled_2022_status_idx;


--
-- Name: domain_event_handled_2023_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_handled_payload_idx ATTACH PARTITION public.domain_event_handled_2023_payload_idx;


--
-- Name: domain_event_handled_2023_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_handled_pkey ATTACH PARTITION public.domain_event_handled_2023_pkey;


--
-- Name: domain_event_handled_2023_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_handled_status_idx ATTACH PARTITION public.domain_event_handled_2023_status_idx;


--
-- Name: domain_event_handled_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.event_pyld_idx ATTACH PARTITION public.domain_event_handled_payload_idx;


--
-- Name: domain_event_handled_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_pkey ATTACH PARTITION public.domain_event_handled_pkey;


--
-- Name: domain_event_handled_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.event_status_idx ATTACH PARTITION public.domain_event_handled_status_idx;


--
-- Name: domain_event_raised_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.event_pyld_idx ATTACH PARTITION public.domain_event_raised_payload_idx;


--
-- Name: domain_event_raised_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_pkey ATTACH PARTITION public.domain_event_raised_pkey;


--
-- Name: domain_event_raised_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.event_status_idx ATTACH PARTITION public.domain_event_raised_status_idx;


--
-- Name: domain_event_received_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.event_pyld_idx ATTACH PARTITION public.domain_event_received_payload_idx;


--
-- Name: domain_event_received_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_pkey ATTACH PARTITION public.domain_event_received_pkey;


--
-- Name: domain_event_received_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.event_status_idx ATTACH PARTITION public.domain_event_received_status_idx;


--
-- Name: domain_event_sent_2021_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_sent_payload_idx ATTACH PARTITION public.domain_event_sent_2021_payload_idx;


--
-- Name: domain_event_sent_2021_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_sent_pkey ATTACH PARTITION public.domain_event_sent_2021_pkey;


--
-- Name: domain_event_sent_2021_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_sent_status_idx ATTACH PARTITION public.domain_event_sent_2021_status_idx;


--
-- Name: domain_event_sent_2022_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_sent_payload_idx ATTACH PARTITION public.domain_event_sent_2022_payload_idx;


--
-- Name: domain_event_sent_2022_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_sent_pkey ATTACH PARTITION public.domain_event_sent_2022_pkey;


--
-- Name: domain_event_sent_2022_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_sent_status_idx ATTACH PARTITION public.domain_event_sent_2022_status_idx;


--
-- Name: domain_event_sent_2023_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_sent_payload_idx ATTACH PARTITION public.domain_event_sent_2023_payload_idx;


--
-- Name: domain_event_sent_2023_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_sent_pkey ATTACH PARTITION public.domain_event_sent_2023_pkey;


--
-- Name: domain_event_sent_2023_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_sent_status_idx ATTACH PARTITION public.domain_event_sent_2023_status_idx;


--
-- Name: domain_event_sent_payload_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.event_pyld_idx ATTACH PARTITION public.domain_event_sent_payload_idx;


--
-- Name: domain_event_sent_pkey; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.domain_event_pkey ATTACH PARTITION public.domain_event_sent_pkey;


--
-- Name: domain_event_sent_status_idx; Type: INDEX ATTACH; Schema: public; Owner: doadmin
--

ALTER INDEX public.event_status_idx ATTACH PARTITION public.domain_event_sent_status_idx;


--
-- Name: token token_transaction_trigger; Type: TRIGGER; Schema: public; Owner: doadmin
--

CREATE TRIGGER token_transaction_trigger AFTER UPDATE ON public.token FOR EACH ROW EXECUTE PROCEDURE public.token_transaction_insert();


--
-- Name: ab_permission_view ab_permission_view_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view
    ADD CONSTRAINT ab_permission_view_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.ab_permission(id);


--
-- Name: ab_permission_view_role ab_permission_view_role_permission_view_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view_role
    ADD CONSTRAINT ab_permission_view_role_permission_view_id_fkey FOREIGN KEY (permission_view_id) REFERENCES public.ab_permission_view(id);


--
-- Name: ab_permission_view_role ab_permission_view_role_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view_role
    ADD CONSTRAINT ab_permission_view_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.ab_role(id);


--
-- Name: ab_permission_view ab_permission_view_view_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_permission_view
    ADD CONSTRAINT ab_permission_view_view_menu_id_fkey FOREIGN KEY (view_menu_id) REFERENCES public.ab_view_menu(id);


--
-- Name: ab_user ab_user_changed_by_fk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user
    ADD CONSTRAINT ab_user_changed_by_fk_fkey FOREIGN KEY (changed_by_fk) REFERENCES public.ab_user(id);


--
-- Name: ab_user ab_user_created_by_fk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user
    ADD CONSTRAINT ab_user_created_by_fk_fkey FOREIGN KEY (created_by_fk) REFERENCES public.ab_user(id);


--
-- Name: ab_user_role ab_user_role_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user_role
    ADD CONSTRAINT ab_user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.ab_role(id);


--
-- Name: ab_user_role ab_user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.ab_user_role
    ADD CONSTRAINT ab_user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.ab_user(id);


--
-- Name: dag_tag dag_tag_dag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.dag_tag
    ADD CONSTRAINT dag_tag_dag_id_fkey FOREIGN KEY (dag_id) REFERENCES public.dag(dag_id);


--
-- Name: entity_manager entity_manager_child_entity_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity_manager
    ADD CONSTRAINT entity_manager_child_entity_id_fk FOREIGN KEY (child_entity_id) REFERENCES public.entity(id);


--
-- Name: entity_manager entity_manager_parent_entity_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity_manager
    ADD CONSTRAINT entity_manager_parent_entity_id_fk FOREIGN KEY (parent_entity_id) REFERENCES public.entity(id);


--
-- Name: entity_role entity_role_entity_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.entity_role
    ADD CONSTRAINT entity_role_entity_id_fk FOREIGN KEY (entity_id) REFERENCES public.entity(id);


--
-- Name: locations locations_planter_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_planter_id_fk FOREIGN KEY (planter_id) REFERENCES public.planter(id);


--
-- Name: notes notes_planter_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_planter_id_fk FOREIGN KEY (planter_id) REFERENCES public.planter(id);


--
-- Name: payment payment_entity_receiver_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_entity_receiver_id_fk FOREIGN KEY (receiver_entity_id) REFERENCES public.entity(id);


--
-- Name: payment payment_entity_sender_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_entity_sender_id_fk FOREIGN KEY (sender_entity_id) REFERENCES public.entity(id);


--
-- Name: pending_update pending_update_planter_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.pending_update
    ADD CONSTRAINT pending_update_planter_id_fk FOREIGN KEY (planter_id) REFERENCES public.planter(id);


--
-- Name: planter planter_organization_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.planter
    ADD CONSTRAINT planter_organization_id_fk FOREIGN KEY (organization_id) REFERENCES public.entity(id);


--
-- Name: planter planter_person_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.planter
    ADD CONSTRAINT planter_person_id_fk FOREIGN KEY (person_id) REFERENCES public.entity(id);


--
-- Name: survey_question survey_question_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.survey_question
    ADD CONSTRAINT survey_question_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.survey(id);


--
-- Name: task_reschedule task_reschedule_dag_task_date_fkey; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.task_reschedule
    ADD CONSTRAINT task_reschedule_dag_task_date_fkey FOREIGN KEY (task_id, dag_id, execution_date) REFERENCES public.task_instance(task_id, dag_id, execution_date) ON DELETE CASCADE;


--
-- Name: token token_entity_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_entity_id_fk FOREIGN KEY (entity_id) REFERENCES public.entity(id);


--
-- Name: token token_tree_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_tree_id_fk FOREIGN KEY (tree_id) REFERENCES public.trees(id);


--
-- Name: transaction transaction_entity_receiver_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_entity_receiver_id_fk FOREIGN KEY (receiver_entity_id) REFERENCES public.entity(id);


--
-- Name: transaction transaction_entity_sender_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_entity_sender_id_fk FOREIGN KEY (sender_entity_id) REFERENCES public.entity(id);


--
-- Name: transaction transaction_token_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_token_id_fk FOREIGN KEY (token_id) REFERENCES public.token(id);


--
-- Name: trees trees_payment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.trees
    ADD CONSTRAINT trees_payment_id_fk FOREIGN KEY (payment_id) REFERENCES public.payment(id);


--
-- Name: TABLE trees; Type: ACL; Schema: public; Owner: doadmin
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.trees TO treetracker;


--
-- Name: TABLE tag; Type: ACL; Schema: public; Owner: doadmin
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.tag TO treetracker;


--
-- PostgreSQL database dump complete
--

