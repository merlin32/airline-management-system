--adaugare de servicii pe rezervari existente

create or replace view adaugare_servicii as
select c.nume, c.prenume,
       sel.id_rezervare, sel.id_serviciu, sel.cantitate,
       s.denumire "DENUMIRE SERVICIU", s.tarif "TARIF (EUR)"
from clienti c
join rezervari r on (r.id_client = c.id_client)
join selectari_servicii sel on (sel.id_rezervare = r.id_rezervare)
join servicii s on (sel.id_serviciu = s.id_serviciu);

--cost operare total fiecare ruta 2025

create or replace view cost_ruta as
select r.cod_iata_plecare || ' -> ' || r.cod_iata_sosire "RUTA", nvl(sum(z.cost_operare), 0) "COST TOTAL OPERARE RUTA (EUR)"
from rute r
left join zboruri z on (r.id_ruta = z.id_ruta)
left join planificari using (id_planificare)
where  moment_decolare >= to_date('01-01-2025 00:00', 'dd-mm-yyyy hh24:mi') and
       moment_aterizare < to_date('01-01-2026 00:00', 'dd-mm-yyyy hh24:mi')
group by r.cod_iata_plecare, r.cod_iata_sosire
order by "COST TOTAL OPERARE RUTA (EUR)" desc;

--reparatii avioane 2024

create or replace view reparatii_avioane_2024 as
select numar_de_inmatriculare, sum(cost_estimat) "COST REPARATII (EUR)"
from mentenante right join avioane using (numar_de_inmatriculare)
where data_incepere >= to_date('01-01-2024 00:00', 'dd-mm-yyyy hh24:mi') and
      data_finalizare < to_date('01-01-2025 00:00', 'dd-mm-yyyy hh24:mi')
group by numar_de_inmatriculare
order by "COST REPARATII (EUR)" desc;