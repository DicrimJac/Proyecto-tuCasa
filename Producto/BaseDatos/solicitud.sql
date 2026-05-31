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

create policy "allow select"
on "SOLICITUD"
for select
to anon
using (true);

create policy "allow insert"
on "SOLICITUD"
for insert
to anon
with check (true);

create policy "allow update"
on "SOLICITUD"
for update
to anon
using (true);

create policy "allow delete"
on "SOLICITUD"
for delete
to anon
using (true);

INSERT INTO public.SOLICITUD (
  id_usuario, id_propi, contract_time, qty_person, 
  work_situation_nbr, work_situation_desc, income, message
) VALUES (
  1, 1, 12, 3, 1, 'Trabajador dependiente', 1500000, 'Interesado en la propiedad'
)

SELECT * FROM public.SOLICITUD

UPDATE public.SOLICITUD
SET 
  id_usuario = 1,
  id_propi = 1,
  contract_time = 24,
  qty_person = 4,
  work_situation_nbr = 1,
  work_situation_desc = 'Trabajador dependiente',
  income = 1800000,
  message = 'Actualización de datos'
WHERE id_request = 1

DELETE FROM public.SOLICITUD WHERE id_request = 1