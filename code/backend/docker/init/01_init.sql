--
-- PostgreSQL database dump
--

\restrict ZxghZ3nFN7gWeMpyonIzwCRZNRp35GY7EhP6dV0avlCCRxi4u8IfA2ECpgrwPfC

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: orders_payment_method_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.orders_payment_method_enum AS ENUM (
    'CASH',
    'TRANSFER'
);


--
-- Name: orders_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.orders_status_enum AS ENUM (
    'NEW',
    'PREPARING',
    'SERVED',
    'PAID',
    'CANCEL'
);


--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_role_enum AS ENUM (
    'OWNER',
    'STAFF'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    price numeric(10,2) NOT NULL,
    images_url json,
    description character varying(500),
    is_remain boolean DEFAULT true NOT NULL,
    category_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    order_id integer NOT NULL,
    item_id integer NOT NULL,
    quantity integer NOT NULL,
    price_at_order numeric(10,2) NOT NULL,
    note character varying(255)
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    table_id uuid NOT NULL,
    tracking_code uuid NOT NULL,
    status public.orders_status_enum DEFAULT 'NEW'::public.orders_status_enum NOT NULL,
    total_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    payment_method public.orders_payment_method_enum,
    cancel_reason character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    paid_at timestamp without time zone
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id character varying(36) NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(512) NOT NULL,
    expired_at timestamp without time zone NOT NULL,
    revoked_at timestamp without time zone
);


--
-- Name: tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tables (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    capacity integer,
    is_available boolean DEFAULT true NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.users_role_enum NOT NULL,
    full_name character varying(100) NOT NULL,
    phone character varying(20),
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, "createdAt", "updatedAt") FROM stdin;
1	Khai Vị	Các món ăn nhẹ, khai vị trước bữa chính	2026-06-29 02:02:43.379376	2026-06-29 02:02:43.379376
2	Món Chính	Cơm, phở, bún và các món ăn no	2026-06-29 02:02:43.379376	2026-06-29 02:02:43.379376
3	Lẩu & Nướng	Lẩu nóng hổi và đồ nướng thơm lừng	2026-06-29 02:02:43.379376	2026-06-29 02:02:43.379376
4	Đồ Uống	Nước giải khát, cà phê, trà, sinh tố	2026-06-29 02:02:43.379376	2026-06-29 02:02:43.379376
5	Tráng Miệng	Chè, bánh ngọt và trái cây tươi	2026-06-29 02:02:43.379376	2026-06-29 02:02:43.379376
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.items (id, name, price, images_url, description, is_remain, category_id, created_at, updated_at, deleted_at) FROM stdin;
1	Gỏi Cuốn Tôm Thịt	45000.00	["https://images.unsplash.com/photo-1562967916-eb82221dfb44?w=500&q=80"]	Gỏi cuốn tươi với tôm, thịt heo, bún và rau sống	t	1	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
2	Chả Giò Sài Gòn	55000.00	["https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=500&q=80"]	Chả giò chiên giòn vàng ươm, nhân thịt heo và nấm	t	1	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
3	Bánh Khọt Vũng Tàu	60000.00	["https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&q=80"]	Bánh khọt giòn rụm, ăn kèm rau sống và nước mắm chua ngọt	t	1	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
4	Súp Bào Ngư Hải Sản	85000.00	["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80"]	Súp bào ngư nấu với nấm đông cô và hải sản tươi	t	1	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
5	Salad Trộn Kiểu Thái	50000.00	["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80"]	Salad tôm chua cay kiểu Thái với sốt chanh dây	t	1	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
6	Đậu Hũ Chiên Sả Ớt	40000.00	["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"]	Đậu hũ chiên giòn xào sả ớt thơm nức	t	1	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
7	Cánh Gà Chiên Nước Mắm	65000.00	["https://images.unsplash.com/photo-1527477396000-e27163b4bdb1?w=500&q=80"]	Cánh gà chiên giòn rim nước mắm tỏi ớt	t	1	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
8	Hàu Nướng Mỡ Hành	90000.00	["https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=500&q=80"]	Hàu tươi nướng mỡ hành và đậu phộng rang	t	1	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
9	Phở Bò Tái Nạm	75000.00	["https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=500&q=80"]	Phở bò truyền thống với nước dùng hầm xương 12 tiếng	t	2	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
10	Bún Chả Hà Nội	65000.00	["https://images.unsplash.com/photo-1626804475297-41609ea074eb?w=500&q=80"]	Bún chả thịt nướng than hoa, ăn kèm rau sống	t	2	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
11	Cơm Tấm Sườn Bì Chả	80000.00	["https://images.unsplash.com/photo-1623910271018-ce80ec210f92?w=500&q=80"]	Cơm tấm Sài Gòn đặc biệt với sườn, bì và chả trứng	t	2	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
12	Bún Bò Huế	70000.00	["https://images.unsplash.com/photo-1576577445504-6af96477db52?w=500&q=80"]	Bún bò Huế cay nồng đặc trưng xứ cố đô	t	2	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
13	Cơm Chiên Dương Châu	65000.00	["https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80"]	Cơm chiên với tôm, lạp xưởng, trứng và rau củ	t	2	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
14	Mì Xào Hải Sản	85000.00	["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80"]	Mì xào giòn với tôm, mực và rau xanh	t	2	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
15	Gà Rán Sốt Cay Hàn Quốc	90000.00	["https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80"]	Gà chiên giòn phủ sốt cay ngọt Hàn Quốc	t	2	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
16	Cá Lóc Kho Tộ	95000.00	["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80"]	Cá lóc kho tộ đậm đà, ăn kèm cơm trắng nóng	t	2	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
17	Lẩu Thái Tomyum Hải Sản	280000.00	["https://images.unsplash.com/photo-1555126634-ae23443a53e5?w=500&q=80"]	Lẩu Thái chua cay với tôm, mực, nghêu và nấm	t	3	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
18	Lẩu Gà Lá É	250000.00	["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&q=80"]	Lẩu gà ta nấu với lá é thơm, vị ngọt thanh tự nhiên	t	3	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
19	Lẩu Bò Nhúng Giấm	300000.00	["https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=500&q=80"]	Lẩu bò nhúng giấm chua nhẹ, ăn kèm bún và rau	t	3	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
20	Sườn Nướng BBQ	120000.00	["https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80"]	Sườn heo nướng BBQ mật ong, thơm lừng bếp than	t	3	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
21	Bò Nướng Lá Lốt	95000.00	["https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&q=80"]	Bò cuốn lá lốt nướng thơm, ăn kèm bún và rau	t	3	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
22	Tôm Nướng Muối Ớt	150000.00	["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80"]	Tôm sú nướng muối ớt xanh, vỏ giòn thịt ngọt	t	3	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
23	Mực Nướng Sa Tế	130000.00	["https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80"]	Mực tươi nướng sa tế thơm lừng, dai giòn sần sật	t	3	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
24	Combo Nướng Hỗn Hợp	350000.00	["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80"]	Combo bò, heo, gà, tôm nướng cho 2-3 người	t	3	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
25	Trà Đào Cam Sả	45000.00	["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80"]	Trà đào thanh mát với cam tươi và sả thơm	t	4	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
26	Cà Phê Sữa Đá	35000.00	["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80"]	Cà phê phin Việt Nam đậm đà với sữa đặc	t	4	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
27	Sinh Tố Bơ	50000.00	["https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80"]	Sinh tố bơ sáp béo ngậy, thêm sữa đặc	t	4	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
28	Nước Ép Cam Tươi	40000.00	["https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80"]	Cam vắt tươi 100%, không thêm đường	t	4	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
29	Trà Sữa Trân Châu	55000.00	["https://images.unsplash.com/photo-1558857563-b37102e96041?w=500&q=80"]	Trà sữa oolong với trân châu đen dẻo mềm	t	4	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
30	Bia Tiger	30000.00	["https://images.unsplash.com/photo-1614315584061-689360c75cce?w=500&q=80"]	Bia Tiger chai 330ml ướp lạnh	t	4	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
31	Mojito Chanh Bạc Hà	60000.00	["https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&q=80"]	Mojito không cồn với chanh tươi và bạc hà	t	4	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
32	Nước Dừa Tươi	35000.00	["https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=500&q=80"]	Nước dừa xiêm tươi nguyên trái, mát lạnh	t	4	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
33	Chè Bưởi	30000.00	["https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80"]	Chè bưởi cốt dừa thơm béo, mát lịm	t	5	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
34	Bánh Flan Caramen	25000.00	["https://images.unsplash.com/photo-1605697686566-f1388653fb8b?w=500&q=80"]	Bánh flan mịn màng với caramen đắng nhẹ	t	5	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
35	Kem Dừa Trái Dừa	55000.00	["https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&q=80"]	Kem dừa tươi phục vụ trong trái dừa non	t	5	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
36	Chè Thái	35000.00	["https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80"]	Chè Thái nhiều topping: thạch, trái cây và nước cốt dừa	t	5	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
37	Rau Câu Dừa	20000.00	["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80"]	Rau câu dừa hai lớp mát lạnh, dai giòn	t	5	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
38	Trái Cây Tươi Thập Cẩm	45000.00	["https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500&q=80"]	Dĩa trái cây theo mùa: xoài, dưa hấu, thanh long, dứa	t	5	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
39	Bánh Chuối Nướng	30000.00	["https://images.unsplash.com/photo-1571115177098-24de17e889a9?w=500&q=80"]	Bánh chuối nướng nóng hổi, thơm bùi hương chuối	t	5	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
40	Sữa Chua Nếp Cẩm	30000.00	["https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&q=80"]	Sữa chua mịn màng kết hợp nếp cẩm dẻo thơm	t	5	2026-06-29 02:02:43.380649	2026-06-29 02:02:43.380649	\N
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (order_id, item_id, quantity, price_at_order, note) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, table_id, tracking_code, status, total_amount, payment_method, cancel_reason, created_at, updated_at, paid_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, user_id, token_hash, expired_at, revoked_at) FROM stdin;
7a949732-ffec-4e9d-ad1d-027f545eee0f	1	$2b$10$X/YQHaDNk.eieJjIRcbVueajYv8YrA5JEXUYEk99XgKjCLE47D8y.	2026-07-04 02:05:02.862	\N
\.


--
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tables (id, name, capacity, is_available) FROM stdin;
da27133a-b8f9-45d1-9f21-4cba52e3d884	Bàn 01	2	t
fe277fdd-e705-43bb-90f3-514113aa60e6	Bàn 02	2	t
48067133-ce1c-42b3-a135-88781a4bff94	Bàn 03	4	t
79c12875-3c17-41ba-8ce2-711a1c719fd9	Bàn 04	4	t
dd167a07-e08b-433b-b111-c3c4b44d9782	Bàn 05	6	t
d43bca3b-042c-4913-9fb5-f1661d5cc993	Bàn 06	6	t
66c23e41-d348-4428-984a-634d06723faa	Bàn VIP 01	8	t
40593f51-7960-49b3-849a-7444ccab9852	Bàn VIP 02	10	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, full_name, phone, is_active) FROM stdin;
1	newowner@restaurant.com	$2b$10$yay9jyVi.0idCL7zRm.5cOC2Nblow0dNUWXpxGjj4u9xsVKC0Lzki	OWNER	New Owner	\N	t
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.items_id_seq', 40, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: tables PK_7cf2aca7af9550742f855d4eb69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT "PK_7cf2aca7af9550742f855d4eb69" PRIMARY KEY (id);


--
-- Name: refresh_tokens PK_7d8bee0204106019488c4c50ffa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: items PK_ba5885359424c15ca6b9e79bcf6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY (id);


--
-- Name: order_items PK_ccaae5c30f7c857ec2ed5fd3881; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "PK_ccaae5c30f7c857ec2ed5fd3881" PRIMARY KEY (order_id, item_id);


--
-- Name: orders UQ_2db49e09e0f0475e2171a502e0f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "UQ_2db49e09e0f0475e2171a502e0f" UNIQUE (tracking_code);


--
-- Name: refresh_tokens UQ_3ddc983c5f7bcf132fd8732c3f4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "UQ_3ddc983c5f7bcf132fd8732c3f4" UNIQUE (user_id);


--
-- Name: tables UQ_672c2f353f696989bb92d5e799c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT "UQ_672c2f353f696989bb92d5e799c" UNIQUE (name);


--
-- Name: categories UQ_8b0be371d28245da6e4f4b61878; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE (name);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: items FK_0c4aa809ddf5b0c6ca45d8a8e80; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "FK_0c4aa809ddf5b0c6ca45d8a8e80" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: order_items FK_145532db85752b29c57d2b7b1f1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders FK_3d36410e89a795172fa6e0dd968; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_3d36410e89a795172fa6e0dd968" FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE RESTRICT;


--
-- Name: refresh_tokens FK_3ddc983c5f7bcf132fd8732c3f4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items FK_de591fd3dc04191ab115c03eab1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_de591fd3dc04191ab115c03eab1" FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict ZxghZ3nFN7gWeMpyonIzwCRZNRp35GY7EhP6dV0avlCCRxi4u8IfA2ECpgrwPfC

