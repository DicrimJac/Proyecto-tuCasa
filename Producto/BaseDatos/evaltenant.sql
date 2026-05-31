CREATE TABLE public.EVALTENANT (
  id_review bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  date_review date DEFAULT now(),
  pay_rank numeric,
  clean_rank numeric,
  respect_rank numeric,
  comunic_rank numeric,
  noise_rank numeric,
  respons_rank numeric,
  exp_rank numeric,
  comment character varying,
  total_rank numeric,
  id_usuario bigint,
  CONSTRAINT EVALTENANT_pkey PRIMARY KEY (id_review),
  CONSTRAINT EVALTENANT_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.USUARIO(id_usuario)
);