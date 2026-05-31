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

create policy "allow select"
on "EVALTENANT"
for select
to anon
using (true);

create policy "allow insert"
on "EVALTENANT"
for insert
to anon
with check (true);

create policy "allow update"
on "EVALTENANT"
for update
to anon
using (true);

create policy "allow delete"
on "EVALTENANT"
for delete
to anon
using (true);

INSERT INTO public.EVALTENANT (
  pay_rank, clean_rank, respect_rank, comunic_rank, 
  noise_rank, respons_rank, exp_rank, comment, total_rank, id_usuario
) VALUES (
  5, 4, 5, 4, 3, 5, 4, 'Buen inquilino', 4.5, 1
)

SELECT * FROM public.EVALTENANT;

UPDATE public.EVALTENANT
SET 
  pay_rank = 5,
  clean_rank = 5,
  respect_rank = 5,
  comunic_rank = 5,
  noise_rank = 4,
  respons_rank = 5,
  exp_rank = 5,
  comment = 'Muy buen inquilino, mejoró',
  total_rank = 4.8
WHERE id_review = 1

DELETE FROM public.EVALTENANT WHERE id_review = 1
