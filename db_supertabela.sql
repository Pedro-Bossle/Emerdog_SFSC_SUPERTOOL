-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categorias (
  id integer NOT NULL DEFAULT nextval('categorias_id_seq'::regclass),
  nome text NOT NULL,
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cidades (
  id integer NOT NULL DEFAULT nextval('cidades_id_seq'::regclass),
  nome text NOT NULL UNIQUE,
  regiao_id integer,
  CONSTRAINT cidades_pkey PRIMARY KEY (id),
  CONSTRAINT cidades_regiao_id_fkey FOREIGN KEY (regiao_id) REFERENCES public.regioes(id)
);
CREATE TABLE public.negociacoes_vet (
  id integer NOT NULL DEFAULT nextval('negociacoes_vet_id_seq'::regclass),
  veterinario_id integer,
  procedimento_id integer,
  porte_id integer,
  valor numeric NOT NULL,
  CONSTRAINT negociacoes_vet_pkey PRIMARY KEY (id),
  CONSTRAINT negociacoes_vet_veterinario_id_fkey FOREIGN KEY (veterinario_id) REFERENCES public.veterinarios(id),
  CONSTRAINT negociacoes_vet_procedimento_id_fkey FOREIGN KEY (procedimento_id) REFERENCES public.procedimentos(id),
  CONSTRAINT negociacoes_vet_porte_id_fkey FOREIGN KEY (porte_id) REFERENCES public.portes(id)
);
CREATE TABLE public.planos (
  id integer NOT NULL DEFAULT nextval('planos_id_seq'::regclass),
  nome text NOT NULL UNIQUE,
  CONSTRAINT planos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.planos_cidade (
  id integer NOT NULL DEFAULT nextval('planos_cidade_id_seq'::regclass),
  plano_id integer,
  diferenca numeric DEFAULT 0,
  procedimento_cod text,
  regiao_id integer,
  CONSTRAINT planos_cidade_pkey PRIMARY KEY (id),
  CONSTRAINT planos_cidade_plano_id_fkey FOREIGN KEY (plano_id) REFERENCES public.planos(id),
  CONSTRAINT fk_regiao FOREIGN KEY (regiao_id) REFERENCES public.regioes(id),
  CONSTRAINT planos_cidade_procedimento_cod_fkey FOREIGN KEY (procedimento_cod) REFERENCES public.procedimentos(codigo)
);
CREATE TABLE public.planos_config (
  id integer NOT NULL DEFAULT nextval('planos_config_id_seq'::regclass),
  plano_id integer,
  carencia text,
  limite text,
  procedimento text,
  CONSTRAINT planos_config_pkey PRIMARY KEY (id),
  CONSTRAINT planos_config_plano_id_fkey FOREIGN KEY (plano_id) REFERENCES public.planos(id),
  CONSTRAINT planos_config_procedimento_fkey FOREIGN KEY (procedimento) REFERENCES public.procedimentos(codigo)
);
CREATE TABLE public.portes (
  id integer NOT NULL DEFAULT nextval('portes_id_seq'::regclass),
  nome text NOT NULL UNIQUE,
  CONSTRAINT portes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.procedimentos (
  id integer NOT NULL DEFAULT nextval('procedimentos_id_seq'::regclass),
  nome text NOT NULL,
  codigo text NOT NULL UNIQUE,
  categoria_id integer,
  CONSTRAINT procedimentos_pkey PRIMARY KEY (id),
  CONSTRAINT procedimentos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.regioes (
  id integer NOT NULL DEFAULT nextval('regioes_id_seq'::regclass),
  nome text NOT NULL UNIQUE,
  CONSTRAINT regioes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.repasses (
  id integer NOT NULL DEFAULT nextval('repasses_id_seq'::regclass),
  procedimento_id text,
  cidade_id integer,
  porte_id integer,
  valor numeric NOT NULL,
  CONSTRAINT repasses_pkey PRIMARY KEY (id),
  CONSTRAINT repasses_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.cidades(id),
  CONSTRAINT repasses_porte_id_fkey FOREIGN KEY (porte_id) REFERENCES public.portes(id),
  CONSTRAINT repasses_procedimento_id_fkey FOREIGN KEY (procedimento_id) REFERENCES public.procedimentos(codigo)
);
CREATE TABLE public.veterinarios (
  id integer NOT NULL DEFAULT nextval('veterinarios_id_seq'::regclass),
  nome text NOT NULL,
  cidade_id integer,
  CONSTRAINT veterinarios_pkey PRIMARY KEY (id),
  CONSTRAINT veterinarios_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.cidades(id)
);