--
-- PostgreSQL database dump
--


-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

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
-- Name: AppStatus; Type: TYPE; Schema: public; Owner: saravanansankaralingam
--

CREATE TYPE public."AppStatus" AS ENUM (
    'draft',
    'live',
    'archived'
);


ALTER TYPE public."AppStatus" OWNER TO postgres;

--
-- Name: AppType; Type: TYPE; Schema: public; Owner: saravanansankaralingam
--

CREATE TYPE public."AppType" AS ENUM (
    'app',
    'portal'
);


ALTER TYPE public."AppType" OWNER TO postgres;

--
-- Name: ComponentMethod; Type: TYPE; Schema: public; Owner: saravanansankaralingam
--

CREATE TYPE public."ComponentMethod" AS ENUM (
    'scratch',
    'ai'
);


ALTER TYPE public."ComponentMethod" OWNER TO postgres;

--
-- Name: ComponentType; Type: TYPE; Schema: public; Owner: saravanansankaralingam
--

CREATE TYPE public."ComponentType" AS ENUM (
    'page',
    'form'
);


ALTER TYPE public."ComponentType" OWNER TO postgres;

--
-- Name: DataLayerType; Type: TYPE; Schema: public; Owner: saravanansankaralingam
--

CREATE TYPE public."DataLayerType" AS ENUM (
    'dataform',
    'board',
    'process',
    'list'
);


ALTER TYPE public."DataLayerType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: saravanansankaralingam
--

CREATE TYPE public."UserRole" AS ENUM (
    'admin',
    'member',
    'viewer'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: apps; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.apps (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text DEFAULT 'Folder'::text NOT NULL,
    icon_bg text DEFAULT '#3b82f6'::text NOT NULL,
    type public."AppType" DEFAULT 'app'::public."AppType" NOT NULL,
    status public."AppStatus" DEFAULT 'draft'::public."AppStatus" NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_by_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by_id text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.apps OWNER TO postgres;

--
-- Name: components; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.components (
    id text NOT NULL,
    app_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    type public."ComponentType" DEFAULT 'page'::public."ComponentType" NOT NULL,
    config jsonb,
    parameters jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    method public."ComponentMethod" DEFAULT 'scratch'::public."ComponentMethod" NOT NULL,
    prompt text
);


ALTER TABLE public.components OWNER TO postgres;

--
-- Name: data_items; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.data_items (
    id text NOT NULL,
    data_layer_id text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    current_step_id text,
    created_by_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by_id text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.data_items OWNER TO postgres;

--
-- Name: data_layers; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.data_layers (
    id text NOT NULL,
    app_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    type public."DataLayerType" DEFAULT 'dataform'::public."DataLayerType" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    config jsonb
);


ALTER TABLE public.data_layers OWNER TO postgres;

--
-- Name: fields; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.fields (
    id text NOT NULL,
    data_layer_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    type text NOT NULL,
    required boolean DEFAULT false NOT NULL,
    default_value jsonb,
    options jsonb,
    config jsonb,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.fields OWNER TO postgres;

--
-- Name: navigations; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.navigations (
    id text NOT NULL,
    app_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    config jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.navigations OWNER TO postgres;

--
-- Name: pages; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.pages (
    id text NOT NULL,
    app_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    config jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pages OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    token text NOT NULL,
    user_id text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.reports (
    id text NOT NULL,
    data_layer_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    type text NOT NULL,
    description text,
    config jsonb,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    avatar_url text,
    phone text,
    department text,
    job_title text,
    location text,
    role public."UserRole" DEFAULT 'member'::public."UserRole" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    email_verified_at timestamp(3) without time zone,
    last_login_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: views; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.views (
    id text NOT NULL,
    data_layer_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    type text NOT NULL,
    description text,
    config jsonb,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.views OWNER TO postgres;

--
-- Name: workflow_steps; Type: TABLE; Schema: public; Owner: saravanansankaralingam
--

CREATE TABLE public.workflow_steps (
    id text NOT NULL,
    data_layer_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    color text,
    "order" integer DEFAULT 0 NOT NULL,
    allowed_next_steps text[] DEFAULT ARRAY[]::text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.workflow_steps OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
060d6268-3b4b-42c1-8dae-b68bf88c1d69	d1b839723d7d7014e58667ef01ad00d82ead7283dc1ef166e61e2bcbe95c54f2	2026-01-28 23:21:55.771561+05:30	20260128175155_init	\N	\N	2026-01-28 23:21:55.764718+05:30	1
02dbc8f3-577e-4266-8f13-621961a86196	e4cde258ece0adf85768c14554f9ea875be31a9397e2015fea38cbf5d8546ed4	2026-02-04 17:05:05.71102+05:30	20260204113505_add_app_model	\N	\N	2026-02-04 17:05:05.695863+05:30	1
3478cb03-5dad-4636-8fa0-c1d52d254650	ecc9bc3707c17c8b917856e241117cadded468113dfda9a528208ff8628830bb	2026-02-06 17:49:42.806052+05:30	20260206000000_update_icon_colors	\N	\N	2026-02-06 17:49:42.777282+05:30	1
82a23147-35c8-441c-8e3f-001f4963edfc	da5620e6edf0c54bf480c24e633512ecf7e8b70855f3a168446da00a79e247e4	2026-02-06 18:40:26.148436+05:30	20260206131026_add_data_layer_models	\N	\N	2026-02-06 18:40:26.130522+05:30	1
f5cdca4b-b65f-4e0e-a3e5-83a5e092e7d7	a3fcd2f322fa12d3157bfa155305b18a21cf143aa7b796a1a5fd5a1ed8f809ed	2026-02-10 07:54:28.167392+05:30	20260210022428_add_navigation_and_page	\N	\N	2026-02-10 07:54:28.155644+05:30	1
237dbf15-a6ba-4147-89a8-cd033131168f	1b7cf1b546eb7a820c7bf4a0bd61bb1069591010ee6218ca58dca5156fe930fb	2026-02-10 22:57:21.708594+05:30	20260210172721_add_list_type	\N	\N	2026-02-10 22:57:21.707075+05:30	1
967c9b91-60b2-47bc-813f-4ce588f7ac96	f362f14bd8f3d600901ed5dcf2eafd19b2049dedb815b1d1a8d171a1c598efa1	2026-02-10 23:08:13.257752+05:30	20260210173813_add_data_layer_config	\N	\N	2026-02-10 23:08:13.255481+05:30	1
901dc392-b058-4872-9b05-f8bb3ac9026f	be0d526699878923c17bf039985848a40a0b229ff5f438b4afab953b89065a20	2026-02-16 18:40:33.625643+05:30	20260216131033_add_views_table	\N	\N	2026-02-16 18:40:33.383787+05:30	1
48b7ecac-17dc-4223-9e0a-6630970bda84	163cf1b106d343867f693d2dcfc0438005fd66ddb56c4294a42c10e8a63cc936	2026-02-17 12:58:02.352163+05:30	20260217072802_add_reports_table	\N	\N	2026-02-17 12:58:02.333111+05:30	1
20ef7e25-8175-4d5d-bc32-e9fee47b33a1	b7b1274ea01ba6759fa3f9bcb2a8f8f366b851050f9cb4a15b7e1e13818fccb7	2026-02-23 14:17:08.957672+05:30	20260223084708_add_component_model	\N	\N	2026-02-23 14:17:08.94433+05:30	1
b2e70fad-1320-46a5-8786-0b2d20c15ce8	87c57cb89bda3224c47e68e0a3bd2cec3832bfad724b1f1fb6ed460716194633	2026-02-24 08:58:48.170603+05:30	20260224032848_add_component_method_and_prompt	\N	\N	2026-02-24 08:58:48.165398+05:30	1
\.


--
-- Data for Name: apps; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.apps (id, name, slug, description, icon, icon_bg, type, status, is_public, version, created_by_id, created_at, updated_by_id, updated_at) FROM stdin;
8682c800-01bb-44cc-9df7-664dfd238497	Test App	test-app	A test application	Folder	#3b82f6	app	draft	f	1	22bce078-3227-4571-b68a-2035f1e2da5c	2026-02-04 11:37:54.157	22bce078-3227-4571-b68a-2035f1e2da5c	2026-02-04 11:37:54.157
e6fb8246-db0e-4e8c-afaf-97894f7aa156	My Test App	my-test-app	This is the basic test app created to test all the development items.	Calendar	#f59e0b	app	draft	f	1	22bce078-3227-4571-b68a-2035f1e2da5c	2026-02-06 11:28:27.468	22bce078-3227-4571-b68a-2035f1e2da5c	2026-02-06 11:28:27.468
fe0dd2f4-9238-4ba6-8324-cb0c27a08712	Test App Sara	test-app-sara	Test App Sara	Folder	#3b82f6	app	draft	f	1	22bce078-3227-4571-b68a-2035f1e2da5c	2026-03-18 07:25:49.614	22bce078-3227-4571-b68a-2035f1e2da5c	2026-03-18 07:25:49.614
18e61ae8-8f92-4850-892f-8744e2fcef6c	Expense Management	expense-management-brd	Streamline expense reporting with easy submission, receipt uploads, multi-level approvals, and real-time budget tracking.	Folder	#3b82f6	app	draft	f	1	22bce078-3227-4571-b68a-2035f1e2da5c	2026-03-17 06:27:47.746	22bce078-3227-4571-b68a-2035f1e2da5c	2026-03-17 09:37:38.101
4fbe6509-57d8-4bc6-9e59-5110e095ec4e	Leave management app	leave-management-app	Leave management app	Folder	#3b82f6	app	draft	f	1	22bce078-3227-4571-b68a-2035f1e2da5c	2026-03-27 11:29:40.946	22bce078-3227-4571-b68a-2035f1e2da5c	2026-03-27 11:29:40.946
10130c1d-4396-400a-aaf4-ce5447493832	Employee Management	employee-management	Employee Management App	Folder	#3b82f6	app	draft	f	1	22bce078-3227-4571-b68a-2035f1e2da5c	2026-04-06 09:40:03.431	22bce078-3227-4571-b68a-2035f1e2da5c	2026-04-06 09:40:03.431
\.


--
-- Data for Name: components; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.components (id, app_id, name, slug, description, type, config, parameters, created_at, updated_at, method, prompt) FROM stdin;
41b4ab62-482a-4de0-b8b9-f44ac812caec	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Test Component	test-component	\N	page	{}	[{"id": "param-123", "name": "User ID", "type": "string", "paramId": "userId"}]	2026-02-23 09:07:24.412	2026-02-23 09:07:33.736	scratch	\N
13d38f67-c352-4175-bc9b-87fd4e4b83d3	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Input component	input-component	\N	form	{"bundleFile": {"size": 1350, "filename": "13d38f67-c352-4175-bc9b-87fd4e4b83d3-66d867d6-8654-46dc-8e6f-5e466a59e59c.zip", "mimetype": "application/zip", "uploadedAt": "2026-02-23T18:41:01.113Z", "originalName": "helloworld.zip"}}	[]	2026-02-23 18:40:43.043	2026-02-23 18:41:01.113	scratch	\N
bd78c468-63a4-4920-bc7c-9397de30e9e6	e6fb8246-db0e-4e8c-afaf-97894f7aa156	User Component	user-component	\N	page	{}	[]	2026-02-24 03:34:10.314	2026-02-24 03:34:10.314	ai	I want a user details component
d7ab8fd1-0f3d-4e8b-bd54-a74f9a2086d4	e6fb8246-db0e-4e8c-afaf-97894f7aa156	User Details Component	user-details-component	\N	page	{}	[]	2026-02-24 03:37:38.242	2026-02-24 03:37:38.242	ai	I want a component to show the user details in card
e1dbd290-45a5-45e0-90b2-211b1b779810	e6fb8246-db0e-4e8c-afaf-97894f7aa156	AI gen component	ai-gen-component	\N	page	{}	[]	2026-02-24 03:45:46.006	2026-02-24 03:45:46.006	ai	Generate a user details component
d2372a3c-1402-450b-bf0a-df9116e766e7	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Dropdown Component	dropdown-component	\N	form	{"bundleFile": {"size": 1350, "filename": "d2372a3c-1402-450b-bf0a-df9116e766e7-a651d398-155a-4b68-8906-badd28e1b02e.zip", "mimetype": "application/zip", "uploadedAt": "2026-02-24T05:59:10.688Z", "originalName": "helloworld.zip"}}	[{"id": "param-1771912815542", "name": "Title", "type": "string", "paramId": "title", "defaultValue": "Title"}]	2026-02-23 18:44:45.653	2026-02-24 06:00:15.581	scratch	\N
5af20af0-92dd-4953-aff9-3fdb7b9789e6	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Table Component	table-component	\N	page	{"bundleFile": null}	[{"id": "param-1771843114837", "name": "Title", "type": "string", "paramId": "title", "defaultValue": "Title"}]	2026-02-23 09:08:24.57	2026-02-24 06:14:03.576	scratch	\N
88c810ad-9c0d-4919-b758-d229e0c0f646	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Sudhan Test	sudhan-test	\N	page	{"bundleFile": null}	[]	2026-02-26 06:25:25.734	2026-03-04 08:14:53.218	scratch	\N
b1dda9c0-dbbb-48da-ae86-7bc6d9565931	e6fb8246-db0e-4e8c-afaf-97894f7aa156	hhjh	hhjh	\N	page	{}	[]	2026-03-12 11:20:50.301	2026-03-12 11:20:50.301	ai	fol;kl;k
\.


--
-- Data for Name: data_items; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.data_items (id, data_layer_id, data, current_step_id, created_by_id, created_at, updated_by_id, updated_at) FROM stdin;
\.


--
-- Data for Name: data_layers; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.data_layers (id, app_id, name, slug, description, type, created_at, updated_at, config) FROM stdin;
5805d73a-ce7b-4e7c-8816-20526806951e	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Test board	test-board	\N	board	2026-02-10 01:55:03.186	2026-02-10 01:55:03.186	\N
95ebbae3-d47f-4060-8d94-6599b11980cb	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Test process	test-process	\N	process	2026-02-10 02:01:19.95	2026-02-10 02:01:19.95	\N
1fa50fd7-fdab-4275-97d5-48c22f6a7cf3	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Test list	test-list	\N	list	2026-02-10 20:31:14.864	2026-02-10 20:59:29.913	{"items": [{"id": "item-1770757169893", "label": "New Items", "value": "new_items"}]}
0cf7323c-d54b-48c4-b8a9-f33f83058247	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Test Data Form	test-data-form	\N	dataform	2026-02-08 08:04:12.851	2026-02-22 07:31:23.66	\N
2a5460df-c926-44b7-852d-b075e46695ca	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Test Data Form - 2	test-data-form-2	\N	dataform	2026-02-22 08:29:49.311	2026-02-22 08:29:49.311	\N
\.


--
-- Data for Name: fields; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.fields (id, data_layer_id, name, slug, type, required, default_value, options, config, "order", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: navigations; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.navigations (id, app_id, name, slug, description, config, created_at, updated_at) FROM stdin;
a774cbd2-87c0-4e82-a98d-5fac8f40eedf	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Test navigation	test-navigation	\N	{}	2026-02-11 07:30:39.104	2026-02-11 07:30:39.104
4e3e7c40-b709-43c5-a96b-51ae151eb2d5	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Test navigation 1	test-navigation-1	\N	{}	2026-02-11 09:36:13.816	2026-02-11 09:36:13.816
3a85ca10-c6ea-4208-aba6-e1df250860be	18e61ae8-8f92-4850-892f-8744e2fcef6c	Main Navigation	main-navigation	Default navigation menu	{}	2026-03-17 06:27:47.762	2026-03-17 06:27:47.762
e8183b7e-4313-4ce3-aefc-edaad353adb3	fe0dd2f4-9238-4ba6-8324-cb0c27a08712	Main Navigation	main-navigation	Default navigation menu	{}	2026-03-18 07:25:49.634	2026-03-18 07:25:49.634
cb17ac69-f0fb-4f7f-8123-a746e06a2739	4fbe6509-57d8-4bc6-9e59-5110e095ec4e	Main Navigation	main-navigation	Default navigation menu	{}	2026-03-27 11:29:40.956	2026-03-27 11:29:40.956
b7cd44dc-445d-48ae-97d6-a4e28899719f	10130c1d-4396-400a-aaf4-ce5447493832	Main Navigation	main-navigation	Default navigation menu	{}	2026-04-06 09:40:03.444	2026-04-06 09:40:03.444
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.pages (id, app_id, name, slug, description, config, created_at, updated_at) FROM stdin;
c740dffa-ef87-4052-b4ac-135b22efe0d2	e6fb8246-db0e-4e8c-afaf-97894f7aa156	Test Page	test-page	\N	{}	2026-02-12 12:14:38.509	2026-02-12 12:14:38.509
bde6bcf7-96e4-433e-b5f4-3bf562d0429f	18e61ae8-8f92-4850-892f-8744e2fcef6c	Home Page	home-page	Default home page	{}	2026-03-17 06:27:47.768	2026-03-17 06:27:47.768
d1158e5d-5f54-4c8b-878d-924454bc1054	fe0dd2f4-9238-4ba6-8324-cb0c27a08712	Home Page	home-page	Default home page	{}	2026-03-18 07:25:49.642	2026-03-18 07:25:49.642
fe2bcc83-9bff-4f6a-b195-d3bf2d7c9983	4fbe6509-57d8-4bc6-9e59-5110e095ec4e	Home Page	home-page	Default home page	{}	2026-03-27 11:29:40.961	2026-03-27 11:29:40.961
4523a49d-6630-4f92-af98-1cd0266d40bd	10130c1d-4396-400a-aaf4-ce5447493832	Home Page	home-page	Default home page	{}	2026-04-06 09:40:03.449	2026-04-06 09:40:03.449
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.refresh_tokens (id, token, user_id, expires_at, created_at) FROM stdin;
e2c8d890-3ab0-430e-8a3b-6cd06735cc1a	b5a3adaf-2b82-4d3f-8c92-21c674ffd375	c4674e1c-5f23-4062-923a-93ed53376305	2026-02-04 17:55:49.433	2026-01-28 17:55:49.434
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.reports (id, data_layer_id, name, slug, type, description, config, is_default, created_at, updated_at) FROM stdin;
eeac5f32-0dd1-4f3a-bb7e-47e07c4bbe64	0cf7323c-d54b-48c4-b8a9-f33f83058247	Test Report	test-report	table	\N	{}	f	2026-02-17 07:38:48.813	2026-02-17 07:38:48.813
f7aa73f1-401c-497e-90e4-51ab94a9c69f	0cf7323c-d54b-48c4-b8a9-f33f83058247	Chart Report	chart-report	chart	\N	{}	f	2026-03-02 09:25:26.624	2026-03-02 09:25:26.624
6362cbb0-5a40-4979-aed3-010157a41a9f	0cf7323c-d54b-48c4-b8a9-f33f83058247	Pivot Report	pivot-report	pivot	\N	{}	f	2026-03-02 09:25:40.07	2026-03-02 09:25:40.07
bef154e0-26d6-4c76-9e01-312cbf9b9db8	0cf7323c-d54b-48c4-b8a9-f33f83058247	Card Report	card-report	card	\N	{}	f	2026-03-02 09:25:52.665	2026-03-02 09:25:52.665
afd35e4c-b233-4eac-9ec1-69c0b67ffae0	0cf7323c-d54b-48c4-b8a9-f33f83058247	Card Report 2	card-report-2	card	\N	{}	f	2026-03-02 09:26:07.226	2026-03-02 09:26:07.226
00579f94-de9f-4232-9030-35220565a9a3	0cf7323c-d54b-48c4-b8a9-f33f83058247	User Report	user-report	table	\N	{}	f	2026-03-02 09:26:19.217	2026-03-02 09:26:19.217
6c981e83-9d6a-4d7d-a4d3-e6090d9a8ec6	0cf7323c-d54b-48c4-b8a9-f33f83058247	Gender Report	gender-report	chart	\N	{}	f	2026-03-02 09:26:35.082	2026-03-02 09:26:35.082
09cb9ab2-e874-4c62-9970-eb5bb79e27da	0cf7323c-d54b-48c4-b8a9-f33f83058247	Finance Report	finance-report	pivot	\N	{}	f	2026-03-02 09:26:51.266	2026-03-02 09:26:51.266
4e4d536e-4875-46c5-b60b-97429e594c98	0cf7323c-d54b-48c4-b8a9-f33f83058247	KPI Report	kpi-report	card	\N	{}	f	2026-03-02 09:27:02.733	2026-03-02 09:27:02.733
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.users (id, email, password_hash, name, avatar_url, phone, department, job_title, location, role, is_active, email_verified_at, last_login_at, created_at, updated_at) FROM stdin;
c4674e1c-5f23-4062-923a-93ed53376305	test@example.com	$2b$12$V9NZe4S9WkWWKDh8DaQwOu.bVhZq6v2TmQzBs1JyhdUYe6GNZifya	Test User	\N	\N	Engineering	Developer	\N	member	t	\N	2026-01-28 17:55:49.428	2026-01-28 17:55:39.687	2026-01-28 17:55:49.429
22bce078-3227-4571-b68a-2035f1e2da5c	system@kissflow.local	$2b$12$bHjpQ1D5vzEqhkC2HMjEtu.VXoET5vB96l/Z3lc7.TAWPw1jo3g4G	System Bot	\N	\N	System	Automated System User	\N	admin	t	\N	\N	2026-02-04 11:35:22.919	2026-02-04 11:35:22.919
\.


--
-- Data for Name: views; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.views (id, data_layer_id, name, slug, type, description, config, is_default, created_at, updated_at) FROM stdin;
955e5262-190b-4a59-81c7-d3e5c4da0ca1	0cf7323c-d54b-48c4-b8a9-f33f83058247	All Records	all-records	datatable	Updated description	{}	t	2026-02-16 13:18:09.471	2026-02-16 13:18:30.92
c12316de-2de5-4ece-b110-04972cc287e3	0cf7323c-d54b-48c4-b8a9-f33f83058247	Default Table	default-table	datatable	\N	{}	f	2026-02-17 06:28:53.882	2026-02-17 06:28:53.882
2432b52b-7ccf-4bd3-ad35-5f980587e8ed	0cf7323c-d54b-48c4-b8a9-f33f83058247	Sample Gallery	sample-gallery	gallery	\N	{}	f	2026-02-17 06:39:32.933	2026-02-17 06:39:32.933
47ec068b-4155-4b6c-88e5-27c9eabb38bf	0cf7323c-d54b-48c4-b8a9-f33f83058247	Test Sheet	test-sheet	sheet	\N	{}	f	2026-02-17 06:40:01.596	2026-02-17 06:40:01.596
0f2c6a94-3d82-4268-b140-d73f4b968e6a	0cf7323c-d54b-48c4-b8a9-f33f83058247	Data table 1	data-table-1	sheet	\N	{}	f	2026-02-17 06:40:13.307	2026-02-17 06:40:13.307
573fc9d2-1946-4a78-8a3c-43d6021c0fdc	0cf7323c-d54b-48c4-b8a9-f33f83058247	Employee Table	employee-table	sheet	\N	{}	f	2026-02-17 06:40:23.863	2026-02-17 06:40:23.863
c4875c2e-439f-4e75-9b6e-5597eaf590e1	0cf7323c-d54b-48c4-b8a9-f33f83058247	Employee Gallery	employee-gallery	gallery	\N	{}	f	2026-02-17 06:40:34.691	2026-02-17 06:40:34.691
ec378b3f-192c-4dcb-aa84-149201f0cfc0	0cf7323c-d54b-48c4-b8a9-f33f83058247	Team Gallery	team-gallery	gallery	\N	{}	f	2026-02-17 06:40:44.93	2026-02-17 06:40:44.93
80f65b8c-d737-41b6-b446-39080326475e	0cf7323c-d54b-48c4-b8a9-f33f83058247	Employee Sheet	employee-sheet	datatable	\N	{}	f	2026-02-17 06:40:58.639	2026-02-17 06:40:58.639
08d2e95e-5fce-443e-808f-e91ea5df07bc	0cf7323c-d54b-48c4-b8a9-f33f83058247	Test Table	test-table	datatable	\N	{}	f	2026-02-17 06:41:14.208	2026-02-17 06:41:14.208
835e1f38-91b8-4898-8971-aed59fed4a7e	2a5460df-c926-44b7-852d-b075e46695ca	All Records	all-records	datatable	Updated description	{}	f	2026-02-22 08:29:49.325	2026-02-22 08:29:49.325
d24eb32f-f816-4dbc-9a8f-a63a4d3a9a82	2a5460df-c926-44b7-852d-b075e46695ca	Default Table	default-table	datatable	\N	{}	f	2026-02-22 08:29:49.328	2026-02-22 08:29:49.328
cd958a38-82f0-47e5-a238-ec35605ed926	2a5460df-c926-44b7-852d-b075e46695ca	Sample Gallery	sample-gallery	gallery	\N	{}	f	2026-02-22 08:29:49.33	2026-02-22 08:29:49.33
6fa25fc0-0e12-442e-8085-59bc994f5648	2a5460df-c926-44b7-852d-b075e46695ca	Test Sheet	test-sheet	sheet	\N	{}	f	2026-02-22 08:29:49.332	2026-02-22 08:29:49.332
f5ecd181-8ad5-4ac0-8f87-6c2e9bd5cf35	2a5460df-c926-44b7-852d-b075e46695ca	Data table 1	data-table-1	sheet	\N	{}	f	2026-02-22 08:29:49.333	2026-02-22 08:29:49.333
4389bde5-f34c-4634-a061-e13ee8e0227c	2a5460df-c926-44b7-852d-b075e46695ca	Employee Table	employee-table	sheet	\N	{}	f	2026-02-22 08:29:49.334	2026-02-22 08:29:49.334
ec18c437-e0ef-4af3-960a-1537667da26f	2a5460df-c926-44b7-852d-b075e46695ca	Employee Gallery	employee-gallery	gallery	\N	{}	f	2026-02-22 08:29:49.335	2026-02-22 08:29:49.335
bca2a5ef-0741-46b8-a4ca-a7c6f23c0b50	2a5460df-c926-44b7-852d-b075e46695ca	Team Gallery	team-gallery	gallery	\N	{}	f	2026-02-22 08:29:49.336	2026-02-22 08:29:49.336
242cac6c-31d2-45b3-aed6-f8c1ef414ebc	2a5460df-c926-44b7-852d-b075e46695ca	Employee Sheet	employee-sheet	datatable	\N	{}	f	2026-02-22 08:29:49.337	2026-02-22 08:29:49.337
4a75beff-f993-4dfb-9d96-fb701dbf009c	2a5460df-c926-44b7-852d-b075e46695ca	Test Table	test-table	datatable	\N	{}	f	2026-02-22 08:29:49.338	2026-02-22 08:29:49.338
\.


--
-- Data for Name: workflow_steps; Type: TABLE DATA; Schema: public; Owner: saravanansankaralingam
--

COPY public.workflow_steps (id, data_layer_id, name, slug, color, "order", allowed_next_steps, created_at, updated_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: apps apps_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_pkey PRIMARY KEY (id);


--
-- Name: components components_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.components
    ADD CONSTRAINT components_pkey PRIMARY KEY (id);


--
-- Name: data_items data_items_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.data_items
    ADD CONSTRAINT data_items_pkey PRIMARY KEY (id);


--
-- Name: data_layers data_layers_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.data_layers
    ADD CONSTRAINT data_layers_pkey PRIMARY KEY (id);


--
-- Name: fields fields_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_pkey PRIMARY KEY (id);


--
-- Name: navigations navigations_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.navigations
    ADD CONSTRAINT navigations_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: views views_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.views
    ADD CONSTRAINT views_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_pkey PRIMARY KEY (id);


--
-- Name: apps_created_by_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX apps_created_by_id_idx ON public.apps USING btree (created_by_id);


--
-- Name: apps_slug_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX apps_slug_idx ON public.apps USING btree (slug);


--
-- Name: apps_slug_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX apps_slug_key ON public.apps USING btree (slug);


--
-- Name: apps_status_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX apps_status_idx ON public.apps USING btree (status);


--
-- Name: apps_updated_by_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX apps_updated_by_id_idx ON public.apps USING btree (updated_by_id);


--
-- Name: components_app_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX components_app_id_idx ON public.components USING btree (app_id);


--
-- Name: components_app_id_slug_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX components_app_id_slug_key ON public.components USING btree (app_id, slug);


--
-- Name: data_items_created_by_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX data_items_created_by_id_idx ON public.data_items USING btree (created_by_id);


--
-- Name: data_items_current_step_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX data_items_current_step_id_idx ON public.data_items USING btree (current_step_id);


--
-- Name: data_items_data_layer_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX data_items_data_layer_id_idx ON public.data_items USING btree (data_layer_id);


--
-- Name: data_layers_app_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX data_layers_app_id_idx ON public.data_layers USING btree (app_id);


--
-- Name: data_layers_app_id_slug_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX data_layers_app_id_slug_key ON public.data_layers USING btree (app_id, slug);


--
-- Name: fields_data_layer_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX fields_data_layer_id_idx ON public.fields USING btree (data_layer_id);


--
-- Name: fields_data_layer_id_slug_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX fields_data_layer_id_slug_key ON public.fields USING btree (data_layer_id, slug);


--
-- Name: navigations_app_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX navigations_app_id_idx ON public.navigations USING btree (app_id);


--
-- Name: navigations_app_id_slug_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX navigations_app_id_slug_key ON public.navigations USING btree (app_id, slug);


--
-- Name: pages_app_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX pages_app_id_idx ON public.pages USING btree (app_id);


--
-- Name: pages_app_id_slug_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX pages_app_id_slug_key ON public.pages USING btree (app_id, slug);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);


--
-- Name: reports_data_layer_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX reports_data_layer_id_idx ON public.reports USING btree (data_layer_id);


--
-- Name: reports_data_layer_id_slug_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX reports_data_layer_id_slug_key ON public.reports USING btree (data_layer_id, slug);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: views_data_layer_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX views_data_layer_id_idx ON public.views USING btree (data_layer_id);


--
-- Name: views_data_layer_id_slug_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX views_data_layer_id_slug_key ON public.views USING btree (data_layer_id, slug);


--
-- Name: workflow_steps_data_layer_id_idx; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE INDEX workflow_steps_data_layer_id_idx ON public.workflow_steps USING btree (data_layer_id);


--
-- Name: workflow_steps_data_layer_id_slug_key; Type: INDEX; Schema: public; Owner: saravanansankaralingam
--

CREATE UNIQUE INDEX workflow_steps_data_layer_id_slug_key ON public.workflow_steps USING btree (data_layer_id, slug);


--
-- Name: apps apps_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: apps apps_updated_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_updated_by_id_fkey FOREIGN KEY (updated_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: components components_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.components
    ADD CONSTRAINT components_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: data_items data_items_data_layer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.data_items
    ADD CONSTRAINT data_items_data_layer_id_fkey FOREIGN KEY (data_layer_id) REFERENCES public.data_layers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: data_layers data_layers_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.data_layers
    ADD CONSTRAINT data_layers_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fields fields_data_layer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_data_layer_id_fkey FOREIGN KEY (data_layer_id) REFERENCES public.data_layers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: navigations navigations_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.navigations
    ADD CONSTRAINT navigations_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pages pages_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_data_layer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_data_layer_id_fkey FOREIGN KEY (data_layer_id) REFERENCES public.data_layers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: views views_data_layer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.views
    ADD CONSTRAINT views_data_layer_id_fkey FOREIGN KEY (data_layer_id) REFERENCES public.data_layers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflow_steps workflow_steps_data_layer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saravanansankaralingam
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_data_layer_id_fkey FOREIGN KEY (data_layer_id) REFERENCES public.data_layers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict XTJcDTAUflsZrpw7NF7UVUbGrlKcFCLeg77aHoBkxhIfOVMUoOsKFdPbp24Q400

