drop table asignari_membrii cascade constraints;
drop table bilete cascade constraints;
drop table selectari_servicii cascade constraints;
drop table zboruri cascade constraints;
drop table mentenante cascade constraints;
drop table avioane cascade constraints;
drop table baze_aeriene cascade constraints;
drop table modele_avioane cascade constraints;
drop table rute cascade constraints;
drop table planificari cascade constraints;
drop table piloti cascade constraints;
drop table insotitori_de_zbor cascade constraints;
drop table membrii_echipaje cascade constraints;
drop table rezervari cascade constraints;
drop table clienti cascade constraints;
drop table servicii cascade constraints;

create table baze_aeriene
(
    cod_iata varchar2(3),
    nume_baza varchar2(60) constraint nume_baza_nn not null,
    oras varchar2(20) constraint oras_nn not null,
    altitudine number(4) constraint altitudine_nn not null,
    suprafata_totala number(4, 2) constraint suprafata_totala_nn not null,
    numar_hangare number(2) constraint numar_hangare_nn not null
);

alter table baze_aeriene add
(
    constraint cod_iata_pk primary key(cod_iata),
    constraint cod_iata_ck check (
        length(cod_iata) = 3 and
        cod_iata not like '% %' and
        trim(translate(cod_iata, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ' ')) is null),
    constraint altitudine_ck check (altitudine >= -72 and
                                       altitudine <= 5600),
    constraint suprafata_totala_ck check (suprafata_totala > 0),
    constraint numar_hangare_ck check (numar_hangare >= 0)
);

create table modele_avioane
(
    tip varchar2(30),
    capacitate_pasageri number(3) constraint capacitate_pasageri_nn not null,
    capacitate_cargo number(4) constraint capacitate_cargo_nn not null,
    consum_mediu_kg number(4) constraint consum_mediu_kg_nn not null
);

alter table modele_avioane add
(
    constraint tip_pk primary key(tip),
    constraint capacitate_pasageri_ck check(capacitate_pasageri > 0),
    constraint capacitate_cargo_ck check(capacitate_cargo > 0),
    constraint consum_mediu_kg_ck check(consum_mediu_kg > 0)
);

create table avioane
(
    numar_de_inmatriculare varchar2(6),
    cod_iata varchar2(3) constraint cod_iata_avioane_nn not null,
    tip varchar2(30) constraint tip_avioane_nn not null,
    an_fabricatie number(4) constraint an_fabricatie_nn not null,
    data_achizitie date constraint data_achizitie_nn not null
);

alter table avioane add
(
    constraint numar_de_inmatriculare_pk primary key (numar_de_inmatriculare),
    constraint numar_de_inmatriculare_ck check(
        numar_de_inmatriculare like 'YR-___' and
        substr(numar_de_inmatriculare, 4, 3) not like '% %' and
        trim(translate(substr(numar_de_inmatriculare, 4, 3), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ' ')) is null
        ),
    constraint avioane_cod_iata_fk foreign key (cod_iata) references baze_aeriene(cod_iata),
    constraint avioane_tip_fk foreign key (tip) references modele_avioane(tip),
    constraint an_fabricatie_ck check(an_fabricatie > 0)
);

create table mentenante
(
    data_incepere date,
    numar_de_inmatriculare varchar2(6),
    tip_verificare varchar2(10) constraint tip_verificare_nn not null,
    data_finalizare date constraint data_finalizare_nn not null,
    cost_estimat number(8, 2) constraint cost_estimat_nn not null
);

alter table mentenante add
(
    constraint mentenante_pk primary key (data_incepere, numar_de_inmatriculare),
    constraint mentenante_numar_de_inmatriculare_fk foreign key (numar_de_inmatriculare) references avioane(numar_de_inmatriculare),
    constraint tip_verificare_ck check (
        tip_verificare in ('ATA 21',
                           'ATA 24',
                           'ATA 27',
                           'ATA 32',
                           'ATA 70-80')
        ),
    constraint data_finalizare_ck check(
        data_finalizare >= data_incepere and
        data_finalizare = trunc(data_finalizare)
        ),
    constraint data_incepere_ck check (data_incepere = trunc(data_incepere)),
    constraint cost_estimat_ck check(cost_estimat > 0)
);

create table rute
(
    id_ruta number(3),
    cod_iata_plecare varchar2(3) constraint cod_iata_plecare_nn not null,
    cod_iata_sosire varchar2(3) constraint cod_iata_sosire_nn not null,
    culoar_aerian varchar2(10) constraint culoar_aerian_nn not null
);

alter table rute add
(
    constraint id_ruta_pk primary key (id_ruta),
    constraint id_ruta_ck check (id_ruta > 0),
    constraint cod_iata_plecare_ck check(
        length(cod_iata_plecare) = 3 and
        cod_iata_plecare not like '% %' and
        trim(translate(cod_iata_plecare,
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                        ' ')) is null
    ),
    constraint cod_iata_sosire_ck check(
        cod_iata_plecare <> cod_iata_sosire and
        length(cod_iata_sosire) = 3 and
        cod_iata_sosire not like '% %' and
        trim(translate(cod_iata_sosire,
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                        ' ')) is null
    )
);

create table planificari
(
    id_planificare number(4),
    moment_decolare date constraint moment_decolare_nn not null,
    moment_aterizare date constraint moment_aterizare_nn not null
);

alter table planificari add
(
    constraint id_planificare_pk primary key (id_planificare),
    constraint id_planificare_ck check (id_planificare > 0),
    constraint durata_zbor_minima_ck check(moment_aterizare - moment_decolare >= 20/1440)
);

create table zboruri
(
    id_zbor number(4),
    id_ruta number(3) constraint id_ruta_nn not null,
    numar_de_inmatriculare varchar2(6) constraint numar_de_inmatriculare_nn not null,
    id_planificare number(4) constraint id_planificare_nn not null,
    poarta_imbarcare varchar2(4) constraint poarta_imbarcare_nn not null,
    cost_operare number(8, 2) constraint cost_operare_nn not null
);

alter table zboruri add
(
    constraint id_zbor_pk primary key (id_zbor),
    constraint id_zbor_ck check (id_zbor > 0),
    constraint zboruri_id_ruta_fk foreign key (id_ruta) references rute(id_ruta),
    constraint zboruri_numar_de_inmatriculare_fk foreign key (numar_de_inmatriculare) references avioane(numar_de_inmatriculare),
    constraint zboruri_id_planificare_fk foreign key (id_planificare) references planificari(id_planificare),
    constraint cost_operare_ck check (cost_operare > 0)
);

create table membrii_echipaje
(
    id_membru_echipaj number(6),
    tip_membru varchar2(20) constraint tip_membru_nn not null,
    nume varchar2(20) constraint nume_nn not null,
    prenume varchar2(20) constraint prenume_nn not null,
    data_angajare date constraint data_angajare_nn not null,
    salariu number(5) constraint salariu_nn not null
);

alter table membrii_echipaje add
(
    constraint id_membru_echipaj_pk primary key (id_membru_echipaj),
    constraint id_membru_echipaj_ck check(id_membru_echipaj > 0),
    constraint salariu_ck check (salariu > 0),
    constraint tip_membru_ck check(tip_membru in ('Pilot', 'Insotitor de zbor'))
);

create table piloti
(
    id_pilot number(6),
    ore_zbor_angajare number(5) constraint ore_zbor_angajare_nn not null,
    licenta varchar2(4) default 'PPL' constraint licenta_nn not null,
    grad varchar2(15) default 'Junior' constraint grad_nn not null
);

alter table piloti add
(
    constraint id_pilot_pk primary key (id_pilot),
    constraint piloti_id_membrii_echipaje_fk foreign key (id_pilot) references membrii_echipaje(id_membru_echipaj)
        on delete cascade,
    constraint ore_zbor_angajare_ck check (ore_zbor_angajare > 400),
    constraint licenta_ck check(
        licenta in ('PPL', 'CPL', 'ATPL')
        ),
    constraint grad_ck check(
        grad in ('Cadet',
                 'Capitan',
                 'Prim ofiter',
                 'Ofiter secund')
        )
);

create table insotitori_de_zbor
(
    id_insotitor_de_zbor number(6),
    nivel_limba_engleza varchar2(2) constraint nivel_limba_engleza_nn not null,
    certificare varchar2(4) constraint certificare_nn not null
);

alter table insotitori_de_zbor add
(
    constraint id_insotitor_de_zbor_pk primary key (id_insotitor_de_zbor),
    constraint insot_id_membrii_echipaje_fk foreign key (id_insotitor_de_zbor) references membrii_echipaje(id_membru_echipaj)
        on delete cascade,
    constraint nivel_limba_engleza_ck check (
        nivel_limba_engleza in ('B1','B2','C1','C2')
        ),
    constraint certificare_ck check(
        certificare in ('CCA', 'INST', 'SCCM', 'LINE')
        )
);

create table asignari_membrii
(
    id_zbor number(4),
    id_membru_echipaj number(6),
    rol_indeplinit varchar2(21) constraint rol_indeplinit_nn not null
);

alter table asignari_membrii add
(
    constraint asignari_membrii_pk primary key (id_zbor, id_membru_echipaj),
    constraint asig_id_zbor_fk foreign key (id_zbor) references zboruri(id_zbor),
    constraint asig_id_membru_echipaj_fk foreign key (id_membru_echipaj) references membrii_echipaje(id_membru_echipaj),
    constraint rol_indeplinit_ck check(
        rol_indeplinit in ('Pilot flying', 'Pilot monitoring', 'Sef de cabina', 'Senior', 'Insotitor',
                            'Responsabil bucatarie')
    )
);

create table clienti
(
    id_client number(4),
    nume varchar2(20) constraint clienti_nume_nn not null,
    prenume varchar2(20) constraint clienti_prenume_nn not null,
    email varchar2(50) unique constraint email_nn not null,
    data_nastere date constraint data_nastere_nn not null,
    nationalitate varchar2(20) constraint nationalitate_nn not null,
    numar_de_telefon varchar2(17) unique
);

alter table clienti add
(
    constraint id_client_pk primary key (id_client),
    constraint id_client_ck check (id_client > 0),
    constraint email_ck check (email like '%@%.%'),
    constraint numar_de_telefon_ck check (
        numar_de_telefon is null
        or
        (
            numar_de_telefon not like '% %' and
            numar_de_telefon like '+%' and
            trim(translate(numar_de_telefon, '+-0123456789', ' ')) is null
        )
    )
);

create table rezervari
(
    id_rezervare varchar2(6),
    id_client number(4) constraint id_client_nn not null,
    pret_de_baza number(5, 2) constraint pret_de_baza_nn not null,
    data_rezervare date constraint data_rezervare_nn not null
);

alter table rezervari add
(
    constraint id_rezervare_pk primary key (id_rezervare),
    constraint id_rezervare_ck check(
        id_rezervare not like '% %' and
        trim(translate(id_rezervare, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ' ')) is null
        ),
    constraint rezerv_id_client_fk foreign key (id_client) references clienti(id_client),
    constraint pret_de_baza_ck check (pret_de_baza > 0)
);

create table servicii
(
    id_serviciu number(2),
    denumire varchar2(22) constraint denumire_nn not null,
    tarif number(5, 2) constraint tarif_nn not null,
    metoda_achizitie varchar2(8) constraint metoda_achizitie_nn not null
);

alter table servicii add
(
    constraint id_serviciu_pk primary key(id_serviciu),
    constraint id_serviciu_ck check (id_serviciu > 0),
    constraint tarif_ck check (tarif > 0),
    constraint metoda_achizitie_ck check(metoda_achizitie in ('ONLINE', 'AEROPORT'))
);

create table selectari_servicii
(
    id_rezervare varchar2(6),
    id_serviciu number(2),
    cantitate number(1) constraint cantitate_nn not null
);

alter table selectari_servicii add
(
    constraint selectare_servicii_pk primary key (id_rezervare, id_serviciu),
    constraint selec_serv_id_rezervare_fk foreign key (id_rezervare) references rezervari(id_rezervare) on delete cascade,
    constraint selec_serv_id_serviciu_fk foreign key (id_serviciu) references servicii(id_serviciu),
    constraint cantitate_ck check(cantitate >= 1)
);

create table bilete
(
    id_rezervare varchar2(6),
    id_zbor number(4),
    cod_bilet varchar(5) unique constraint cod_bilet_nn not null
);

alter table bilete add
(
    constraint bilete_pk primary key (id_rezervare, id_zbor),
    constraint bilete_id_rezervare_fk foreign key (id_rezervare) references rezervari(id_rezervare) on delete cascade,
    constraint bilete_id_zbor_fk foreign key (id_zbor) references zboruri(id_zbor),
    constraint cod_bilet_ck check(
        cod_bilet not like '% %' and
        trim(translate(cod_bilet, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ' ')) is null
        )
);