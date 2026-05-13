-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- Para UNIQUE parcial / dedupe em bases reais: sql/supertabela_dedup_unique_indexes.sql e sql/planos_cidade_dedup_and_unique.sql

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
CREATE TABLE public.cidades_credenciamento (
  id integer NOT NULL DEFAULT nextval('cidades_credenciamento_id_seq'::regclass),
  nome character varying NOT NULL,
  uf text,
  CONSTRAINT cidades_credenciamento_pkey PRIMARY KEY (id)
);
CREATE TABLE public.especialidades (
  id integer NOT NULL DEFAULT nextval('especialidades_id_seq'::regclass),
  nome character varying NOT NULL UNIQUE,
  tipo character varying,
  CONSTRAINT especialidades_pkey PRIMARY KEY (id)
);
CREATE TABLE public.negociacoes_vet (
  id integer NOT NULL DEFAULT nextval('negociacoes_vet_id_seq'::regclass),
  veterinario_id integer,
  procedimento_id integer,
  porte_id integer,
  valor numeric NOT NULL,
  nome_alternativo text,
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
-- Em bases novas, aplicar também (após dados limpos):
-- CREATE UNIQUE INDEX planos_cidade_regiao_plano_proc_uidx ON public.planos_cidade (regiao_id, plano_id, procedimento_cod);
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
CREATE TABLE public.prestador_cidades (
  id integer NOT NULL DEFAULT nextval('prestador_cidades_id_seq'::regclass),
  prestador_id integer,
  cidade_id integer,
  principal boolean DEFAULT false,
  CONSTRAINT prestador_cidades_pkey PRIMARY KEY (id),
  CONSTRAINT prestador_cidades_prestador_id_fkey FOREIGN KEY (prestador_id) REFERENCES public.prestadores(id),
  CONSTRAINT prestador_cidades_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.cidades_credenciamento(id)
);
CREATE TABLE public.prestador_especialidades (
  id integer NOT NULL DEFAULT nextval('prestador_especialidades_id_seq'::regclass),
  prestador_id integer,
  especialidade_id integer,
  principal boolean DEFAULT false,
  CONSTRAINT prestador_especialidades_pkey PRIMARY KEY (id),
  CONSTRAINT prestador_especialidades_prestador_id_fkey FOREIGN KEY (prestador_id) REFERENCES public.prestadores(id),
  CONSTRAINT prestador_especialidades_especialidade_id_fkey FOREIGN KEY (especialidade_id) REFERENCES public.especialidades(id)
);
CREATE TABLE public.prestador_estabelecimentos (
  id integer NOT NULL DEFAULT nextval('prestador_estabelecimentos_id_seq'::regclass),
  veterinario_id integer,
  estabelecimento_id integer,
  principal boolean DEFAULT false,
  CONSTRAINT prestador_estabelecimentos_pkey PRIMARY KEY (id),
  CONSTRAINT prestador_estabelecimentos_veterinario_id_fkey FOREIGN KEY (veterinario_id) REFERENCES public.prestadores(id),
  CONSTRAINT prestador_estabelecimentos_estabelecimento_id_fkey FOREIGN KEY (estabelecimento_id) REFERENCES public.prestadores(id)
);
CREATE TABLE public.prestadores (
  id integer NOT NULL DEFAULT nextval('prestadores_id_seq'::regclass),
  nome character varying NOT NULL,
  tipo character varying NOT NULL,
  telefone character varying,
  cidade_id integer,
  endereco text,
  modalidade text,
  especialidade_id integer,
  situacao_id integer,
  no_sistema boolean DEFAULT false,
  tem_pdf boolean DEFAULT false,
  no_site boolean DEFAULT false,
  no_mapa boolean DEFAULT false,
  data_cadastro date DEFAULT CURRENT_DATE,
  data_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  observacoes text,
  ativo boolean DEFAULT true,
  CONSTRAINT prestadores_pkey PRIMARY KEY (id),
  CONSTRAINT prestadores_especialidade_id_fkey FOREIGN KEY (especialidade_id) REFERENCES public.especialidades(id),
  CONSTRAINT prestadores_situacao_id_fkey FOREIGN KEY (situacao_id) REFERENCES public.situacoes(id),
  CONSTRAINT prestadores_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.cidades_credenciamento(id)
);
CREATE TABLE public.procedimentos (
  id integer NOT NULL DEFAULT nextval('procedimentos_id_seq'::regclass),
  nome text NOT NULL,
  codigo text NOT NULL UNIQUE,
  categoria_id integer,
  plano_base_id bigint NOT NULL,
  CONSTRAINT procedimentos_pkey PRIMARY KEY (id),
  CONSTRAINT procedimentos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id),
  CONSTRAINT procedimentos_plano_base_fk FOREIGN KEY (plano_base_id) REFERENCES public.planos(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying,
  credenciamento_read_only boolean NOT NULL DEFAULT false,
  email text,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
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
  regiao_id integer DEFAULT 1,
  CONSTRAINT repasses_pkey PRIMARY KEY (id),
  CONSTRAINT repasses_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.cidades(id),
  CONSTRAINT repasses_porte_id_fkey FOREIGN KEY (porte_id) REFERENCES public.portes(id),
  CONSTRAINT repasses_procedimento_id_fkey FOREIGN KEY (procedimento_id) REFERENCES public.procedimentos(codigo),
  CONSTRAINT repasses_regiao_id_fkey FOREIGN KEY (regiao_id) REFERENCES public.regioes(id)
);
CREATE TABLE public.servico_valor_venda (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cod_procedimento text,
  valor_venda real,
  CONSTRAINT servico_valor_venda_pkey PRIMARY KEY (id),
  CONSTRAINT servico_valor_venda_cod_procedimento_fkey FOREIGN KEY (cod_procedimento) REFERENCES public.procedimentos(codigo)
);
CREATE TABLE public.situacoes (
  id integer NOT NULL DEFAULT nextval('situacoes_id_seq'::regclass),
  codigo character varying NOT NULL UNIQUE,
  descricao character varying NOT NULL,
  ordem integer,
  ativo boolean DEFAULT true,
  CONSTRAINT situacoes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.veterinarios (
  id integer NOT NULL DEFAULT nextval('veterinarios_id_seq'::regclass),
  nome text NOT NULL,
  cidade_id integer,
  tipo text,
  CONSTRAINT veterinarios_pkey PRIMARY KEY (id),
  CONSTRAINT veterinarios_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.cidades(id)
);