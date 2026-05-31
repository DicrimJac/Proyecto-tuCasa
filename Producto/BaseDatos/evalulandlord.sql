CREATE TABLE public.EVALULANDLORD (
  id_landlord bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  date timestamp with time zone NOT NULL DEFAULT now(),
  comunicacion_rank numeric,
  respect_rank numeric,
  mainte_rank numeric,
  timeless_rank numeric,
  trasparency_rank numeric,
  availability_rank numeric,
  trust_rank numeric,
  general_exp_rank numeric,
  total_point numeric,
  descr character varying,
  id_usuario bigint,
  CONSTRAINT EVALULANDLORD_pkey PRIMARY KEY (id_landlord),
  CONSTRAINT EVALULANDLORD_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.USUARIO(id_usuario)
);