--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

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
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_modified_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dictionary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dictionary (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.dictionary OWNER TO postgres;

--
-- Name: dictionary_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dictionary_attribute (
    id integer NOT NULL,
    dictionary_id integer,
    name character varying(255) NOT NULL
);


ALTER TABLE public.dictionary_attribute OWNER TO postgres;

--
-- Name: dictionary_attribute_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dictionary_attribute_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dictionary_attribute_id_seq OWNER TO postgres;

--
-- Name: dictionary_attribute_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dictionary_attribute_id_seq OWNED BY public.dictionary_attribute.id;


--
-- Name: dictionary_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dictionary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dictionary_id_seq OWNER TO postgres;

--
-- Name: dictionary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dictionary_id_seq OWNED BY public.dictionary.id;


--
-- Name: incident_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incident_category (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.incident_category OWNER TO postgres;

--
-- Name: incident_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incident_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incident_category_id_seq OWNER TO postgres;

--
-- Name: incident_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incident_category_id_seq OWNED BY public.incident_category.id;


--
-- Name: incident_field; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incident_field (
    id integer NOT NULL,
    type_id integer NOT NULL,
    name character varying(255) NOT NULL,
    field_type character varying(50) NOT NULL,
    dropdown_values text[],
    dictionary_id integer
);


ALTER TABLE public.incident_field OWNER TO postgres;

--
-- Name: incident_field_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incident_field_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incident_field_id_seq OWNER TO postgres;

--
-- Name: incident_field_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incident_field_id_seq OWNED BY public.incident_field.id;


--
-- Name: incident_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incident_type (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.incident_type OWNER TO postgres;

--
-- Name: incident_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incident_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incident_type_id_seq OWNER TO postgres;

--
-- Name: incident_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incident_type_id_seq OWNED BY public.incident_type.id;


--
-- Name: incidents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incidents (
    id integer NOT NULL,
    organization_id integer,
    category_id integer,
    type_id integer,
    creator character varying(255),
    responsible character varying(255),
    evidence_link character varying(255),
    evidence_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(255) DEFAULT 'New'::character varying,
    custom_fields jsonb
);


ALTER TABLE public.incidents OWNER TO postgres;

--
-- Name: incidents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incidents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incidents_id_seq OWNER TO postgres;

--
-- Name: incidents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incidents_id_seq OWNED BY public.incidents.id;


--
-- Name: organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.organization OWNER TO postgres;

--
-- Name: organization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organization_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organization_id_seq OWNER TO postgres;

--
-- Name: organization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organization_id_seq OWNED BY public.organization.id;


--
-- Name: dictionary id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictionary ALTER COLUMN id SET DEFAULT nextval('public.dictionary_id_seq'::regclass);


--
-- Name: dictionary_attribute id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictionary_attribute ALTER COLUMN id SET DEFAULT nextval('public.dictionary_attribute_id_seq'::regclass);


--
-- Name: incident_category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_category ALTER COLUMN id SET DEFAULT nextval('public.incident_category_id_seq'::regclass);


--
-- Name: incident_field id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_field ALTER COLUMN id SET DEFAULT nextval('public.incident_field_id_seq'::regclass);


--
-- Name: incident_type id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_type ALTER COLUMN id SET DEFAULT nextval('public.incident_type_id_seq'::regclass);


--
-- Name: incidents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents ALTER COLUMN id SET DEFAULT nextval('public.incidents_id_seq'::regclass);


--
-- Name: organization id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization ALTER COLUMN id SET DEFAULT nextval('public.organization_id_seq'::regclass);


--
-- Data for Name: dictionary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dictionary (id, name) FROM stdin;
7	Статус инцидента
8	животные2
10	тест2
12	2342
\.


--
-- Data for Name: dictionary_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dictionary_attribute (id, dictionary_id, name) FROM stdin;
9	7	Закрыт
10	7	Зарегистрирован
11	7	Расследование
12	8	собака
13	8	кошка
15	10	123
17	12	123
\.


--
-- Data for Name: incident_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incident_category (id, organization_id, name) FROM stdin;
25	32	123
24	31	Общий инцидент245
\.


--
-- Data for Name: incident_field; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incident_field (id, type_id, name, field_type, dropdown_values, dictionary_id) FROM stdin;
344	24	1234567	Дата	\N	\N
351	24	43254354356	Номер	\N	\N
356	24	ФИНЦЕРТ	Чек бокс	\N	\N
353	24	Справочник (животные2)	Справочник	\N	8
342	25	тест24	Справочник	\N	12
343	25	1234е	Чек бокс	\N	\N
354	24	Справочник (тест2)	Справочник	\N	10
355	24	Справочник (2342)	Справочник	\N	12
\.


--
-- Data for Name: incident_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incident_type (id, category_id, name) FROM stdin;
28	24	12345
24	24	Вирусная активност25
25	25	123
\.


--
-- Data for Name: incidents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incidents (id, organization_id, category_id, type_id, creator, responsible, evidence_link, evidence_name, created_at, updated_at, status, custom_fields) FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization (id, name) FROM stdin;
32	12356
31	СКБ12345689
\.


--
-- Name: dictionary_attribute_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dictionary_attribute_id_seq', 17, true);


--
-- Name: dictionary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dictionary_id_seq', 12, true);


--
-- Name: incident_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incident_category_id_seq', 26, true);


--
-- Name: incident_field_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incident_field_id_seq', 356, true);


--
-- Name: incident_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incident_type_id_seq', 28, true);


--
-- Name: incidents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incidents_id_seq', 9, true);


--
-- Name: organization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organization_id_seq', 33, true);


--
-- Name: dictionary_attribute dictionary_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictionary_attribute
    ADD CONSTRAINT dictionary_attribute_pkey PRIMARY KEY (id);


--
-- Name: dictionary dictionary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictionary
    ADD CONSTRAINT dictionary_pkey PRIMARY KEY (id);


--
-- Name: incident_category incident_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_category
    ADD CONSTRAINT incident_category_pkey PRIMARY KEY (id);


--
-- Name: incident_field incident_field_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_field
    ADD CONSTRAINT incident_field_pkey PRIMARY KEY (id);


--
-- Name: incident_type incident_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_type
    ADD CONSTRAINT incident_type_pkey PRIMARY KEY (id);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: incidents update_incidents_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_incidents_modtime BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: dictionary_attribute dictionary_attribute_dictionary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dictionary_attribute
    ADD CONSTRAINT dictionary_attribute_dictionary_id_fkey FOREIGN KEY (dictionary_id) REFERENCES public.dictionary(id) ON DELETE CASCADE;


--
-- Name: incident_type fk_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_type
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.incident_category(id) ON DELETE CASCADE;


--
-- Name: incident_category fk_organization; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_category
    ADD CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE;


--
-- Name: incident_field fk_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_field
    ADD CONSTRAINT fk_type FOREIGN KEY (type_id) REFERENCES public.incident_type(id) ON DELETE CASCADE;


--
-- Name: incident_category incident_category_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_category
    ADD CONSTRAINT incident_category_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE;


--
-- Name: incident_field incident_field_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_field
    ADD CONSTRAINT incident_field_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.incident_type(id) ON DELETE CASCADE;


--
-- Name: incident_type incident_type_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_type
    ADD CONSTRAINT incident_type_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.incident_category(id) ON DELETE CASCADE;


--
-- Name: incidents incidents_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.incident_category(id);


--
-- Name: incidents incidents_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: incidents incidents_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.incident_type(id);


--
-- PostgreSQL database dump complete
--

