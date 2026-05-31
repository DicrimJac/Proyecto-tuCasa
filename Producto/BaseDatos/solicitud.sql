CREATE TABLE public.SOLICITUD (
  id_request bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  date timestamp with time zone NOT NULL DEFAULT now(),
  id_usuario bigint,
  id_propi bigint,
  contract_time numeric,
  qty_person numeric,
  work_situation_nbr numeric,
  work_situation_desc character varying,
  income numeric,
  message character varying,
  CONSTRAINT SOLICITUD_pkey PRIMARY KEY (id_request),
  CONSTRAINT SOLICITUD_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.USUARIO(id_usuario),
  CONSTRAINT SOLICITUD_id_propi_fkey FOREIGN KEY (id_propi) REFERENCES public.PROPIEDAD(id_propi)
);