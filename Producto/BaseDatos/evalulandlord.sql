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

create policy "allow select"
on "EVALULANDLORD"
for select
to anon
using (true);

create policy "allow insert"
on "EVALULANDLORD"
for insert
to anon
with check (true);

create policy "allow update"
on "EVALULANDLORD"
for update
to anon
using (true);

create policy "allow delete"
on "EVALULANDLORD"
for delete
to anon
using (true);

INSERT INTO public.EVALULANDLORD (
  comunicacion_rank, respect_rank, mainte_rank, timeless_rank,
  trasparency_rank, availability_rank, trust_rank, general_exp_rank,
  total_point, descr, id_usuario
) VALUES (
  5, 4, 5, 4, 5, 4, 5, 4, 4.5, 'Buen arrendador', 1
)

SELECT * FROM public.EVALULANDLORD

UPDATE public.EVALULANDLORD
SET 
  comunicacion_rank = 5,
  respect_rank = 5,
  mainte_rank = 5,
  timeless_rank = 5,
  trasparency_rank = 5,
  availability_rank = 5,
  trust_rank = 5,
  general_exp_rank = 5,
  total_point = 5.0,
  descr = 'Excelente arrendador, muy recomendable'
WHERE id_landlord = 1

DELETE FROM public.EVALULANDLORD WHERE id_landlord = 1