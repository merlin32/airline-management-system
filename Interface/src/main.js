import express from 'express';
import oracledb from 'oracledb';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbConfig = {};

const style = `
    <style>
      body { font-family: sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
      .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 800px; margin: auto; }
      h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
      .menu { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
      .btn { padding: 15px; background: #0056b3; color: white; text-decoration: none; border-radius: 4px; text-align: center; font-weight: bold; border: none; cursor: pointer; }
      .btn:hover { background: #004494; }
      .btn-back { background: #666; margin-top: 20px; display: inline-block; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background: #f2f2f2; }
      .error { color: red; background: #fee; padding: 10px; border-radius: 4px; }
    </style>
`;

const dashboardStyle = `
<style>
    * { box-sizing: border-box; }
    body { 
        margin: 0; display: flex; height: 100vh; 
        font-family: 'Segoe UI', Tahoma, sans-serif;
        background-color: #0d1117; color: #c9d1d9; overflow: hidden;
    }
    /* SIDEBAR */
    .sidebar {
        width: 260px; background-color: #161b22;
        border-right: 1px solid #30363d; display: flex; flex-direction: column;
    }
    .sidebar-header { 
        padding: 12px 20px; font-size: 11px; font-weight: 600; 
        color: #8b949e; text-transform: uppercase; border-bottom: 1px solid #30363d;
    }
    .table-list { flex-grow: 1; overflow-y: auto; padding: 10px 0; }
    .table-link {
        display: block; padding: 8px 20px; color: #c9d1d9; 
        text-decoration: none; font-size: 13px; transition: 0.2s;
    }
    .table-link:hover { background: #21262d; color: #58a6ff; }
    .table-link.active { background: #1f6feb; color: white; }

    /* ZONA CENTRALA */
    .main-view { flex-grow: 1; display: flex; flex-direction: column; }
    .tabs-bar { 
        background: #161b22; height: 35px; display: flex; 
        border-bottom: 1px solid #30363d;
    }
    .tab { 
        padding: 0 15px; display: flex; align-items: center; 
        background: #0d1117; border-right: 1px solid #30363d;
        font-size: 12px; border-top: 1px solid #1f6feb;
    }
    .content-area { padding: 25px; overflow: auto; flex-grow: 1; }
    
    /* TABEL DATE */
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { text-align: left; padding: 10px; border: 1px solid #30363d; background: #161b22; color: #58a6ff; font-size: 13px; }
    td { padding: 8px; border: 1px solid #30363d; font-size: 13px; }
    tr:hover { background: rgba(255,255,255,0.02); }

    .btn-nav {
        padding: 8px 16px; background: #238636; color: white;
        text-decoration: none; border-radius: 6px; font-size: 13px;
    }
    .logout { padding: 15px; color: #f85149; text-decoration: none; font-size: 12px; border-top: 1px solid #30363d; }
    th {
    background: #161b22;
    position: sticky;
    top: 0; /* Capul de tabel rămâne fix la scroll */
    z-index: 10;
    td div a { visibility: hidden; }
    td:hover div a { visibility: visible; opacity: 1 !important; }
    tr:hover { background-color: #21262d; }
    /* Stil pentru butonul de editare tip icon */
.btn-edit-small {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background: #21262d;
    color: #8b949e;
    border: 1px solid #30363d;
    transition: all 0.2s ease;
    visibility: hidden; /* Apare doar la hover pe rând */
}

.btn-edit-small:hover {
    background: #30363d;
    color: #58a6ff;
    border-color: #8b949e;
}

/* Facem iconița vizibilă când ducem mouse-ul peste celulă */
td:hover .btn-edit-small {
    visibility: visible;
}
      .btn-delete-small {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background: #21262d;
    border: 1px solid #30363d;
    transition: all 0.2s;
    cursor: pointer;
}

.btn-delete-small:hover {
    background: rgba(248, 81, 73, 0.15);
    border-color: #f85149;
}
}
th a:hover {
    color: #f0f6fc !important;
}
</style>
`;

app.get('/', (req, res) => {
  res.send(`
    <style>
        body { background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
        .login-card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 400px; }
        h2 { margin-bottom: 20px; color: #1c1e21; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
        button { width: 100%; padding: 12px; background: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    </style>
    <div class="login-card">
        <h2>Romanian Airways SRL</h2>
        <form action="/login" method="POST">
            <label>User</label><input type="text" name="user" required>
            <label>Parolă</label><input type="password" name="password" required>
            <label>Connect String</label><input type="text" name="connectString" value="localhost:1521/orcl">
            <button type="submit">Conectare</button>
        </form>
    </div>
    `);
});

app.post('/login', async (req, res) => {
  const { user, password, connectString } = req.body;
  dbConfig = { user, password, connectString };
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.close();
    res.redirect('/dashboard');
  } catch (err) {
    res.send(
      `${style}<div class="container"><h2>Eroare</h2><p class="error">${err.message}</p><a href="/" class="btn btn-back">Inapoi</a></div>`,
    );
  }
});

app.get('/dashboard', async (req, res) => {
  let conn;
  const selectedTable = req.query.tabel;
  const selectedQuery = req.query.cerere;
  const sortColumn = req.query.sort;
  const isCascadeDemo = req.query.view === 'cascade';
  const operatiuniLinks = `
  <a href="/dashboard?view=servicii_flow" class="table-link ${req.query.view === 'servicii_flow' ? 'active' : ''}">Adaugare Servicii</a>
  <a href="/dashboard?view=statistici" class="table-link ${req.query.view === 'statistici' ? 'active' : ''}">Statistici</a>
`;

  try {
    conn = await oracledb.getConnection(dbConfig);

    // 1. Preluăm lista tabelelor pentru sidebar
    const resultTabele = await conn.execute(
      `SELECT table_name FROM user_tables ORDER BY table_name`,
    );
    const tableLinks = resultTabele.rows
      .map((row) => {
        const name = row[0];
        const active = selectedTable === name ? 'active' : '';
        return `<a href="/dashboard?tabel=${name}" class="table-link ${active}">📄 ${name}</a>`;
      })
      .join('');

    // --- SECȚIUNE CERERI ACTUALIZATĂ CU AMBELE CERERI ---
    const cereriLinks = `
      <a href="/dashboard?cerere=mentenanta_a320" class="table-link ${selectedQuery === 'mentenanta_a320' ? 'active' : ''}">
         Mentenanta A320neo 2020 - prezent
      </a>
      <a href="/dashboard?cerere=grupare_having" class="table-link ${selectedQuery === 'grupare_having' ? 'active' : ''}">
          Detalii rezervari
      </a>
    `;

    const integritateLinks = `
      <a href="/dashboard?view=cascade" class="table-link ${isCascadeDemo ? 'active' : ''}">🗑️ Demo Delete Cascade</a>
    `;

    let mainHtml = '';
    const view = req.query.view;

    // --- LOGICĂ CERERI COMPLEXE (SQL-URILE TALE NEMODIFICATE) ---
    if (selectedQuery === 'mentenanta_a320') {
      const sql = `select b.nume_baza "NUME BAZA", a.numar_de_inmatriculare "NUMAR DE INMATRICULARE", 
                                 m.cost_estimat "COST ESTIMAT (EUR)"
                          from baze_aeriene b
                          join avioane a on (b.cod_iata = a.cod_iata)
                          right join mentenante m on (a.numar_de_inmatriculare = m.numar_de_inmatriculare)
                          where trim(lower(a.tip)) like 'a20n' and m.data_incepere >= to_date('01-01-2020', 'dd-mm-yyyy')
                          order by b.nume_baza desc`;

      const result = await conn.execute(sql, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      const hHtml = `<tr>${result.metaData.map((m) => `<th>${m.name}</th>`).join('')}</tr>`;
      const rHtml = result.rows
        .map(
          (row) =>
            `<tr>${result.metaData.map((m) => `<td>${row[m.name] || ''}</td>`).join('')}</tr>`,
        )
        .join('');

      mainHtml = `
        <h2 style="color:#58a6ff; margin-bottom:15px;">Afisarea numelui bazei aeriene, a numarului de inmatriculare si a costului estimat al mentenantelor care au avut loc incepand cu anul 2020 asupra avioanelor de tip „Airbus A320neo”. </h2>
        <div style="overflow-x:auto;"><table><thead>${hHtml}</thead><tbody>${rHtml}</tbody></table></div>`;
    } else if (selectedQuery === 'grupare_having') {
      const sql = `select c.nume || ' ' || c.prenume "CLIENT",
                          c.nationalitate "NATIONALITATE",
                          ext.id_rezervare "ID REZERVARE",
                          to_char(ext.data_rezervare, 'dd-mm-yyyy') "DATA EFECTUARE REZERVARE",
                          count(sel.id_serviciu) "NUMAR SERVICII SELECTATE",
                          ext.pret_de_baza +
                          nvl((select sum(tarif * cantitate)
                               from selectari_servicii left join servicii using (id_serviciu)
                               where id_rezervare = ext.id_rezervare
                               group by id_rezervare), 0) "TOTAL (EUR)"
                          from clienti c
                          right join rezervari ext on (ext.id_client = c.id_client)
                          left join selectari_servicii sel on ext.id_rezervare = sel.id_rezervare
                          group by c.id_client, c.nume, c.prenume, c.nationalitate, ext.id_rezervare, ext.pret_de_baza, ext.data_rezervare
                          having ext.data_rezervare between to_date('01-01-2025', 'dd-mm-yyyy') and to_date('01-06-2025', 'dd-mm-yyyy')`;

      const result = await conn.execute(sql, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      const hHtml = `<tr>${result.metaData.map((m) => `<th>${m.name}</th>`).join('')}</tr>`;
      const rHtml = result.rows
        .map(
          (row) =>
            `<tr>${result.metaData.map((m) => `<td>${row[m.name] !== null ? row[m.name] : ''}</td>`).join('')}</tr>`,
        )
        .join('');

      mainHtml = `
        <h2 style="color:#58a6ff; margin-bottom:15px;">Afisarea pretului total al fiecarei rezervari, a numelui si a prenumelui clientului care a efectuat rezervarea,
                        a nationalitatii, a ID-ul rezervarii , a datii la care a fost efectuata rezervarea si a numarului de servicii suplimentare selectate
                        pentru rezervarile efectuate in prima jumatate a anului 2025</h2>
        <div style="overflow-x:auto;"><table><thead>${hHtml}</thead><tbody>${rHtml}</tbody></table></div>`;
    } else if (selectedTable) {
      // --- LOGICA TA DE LISTARE (PĂSTRATĂ INTACTĂ) ---
      const pkResult = await conn.execute(
        `SELECT cols.column_name FROM all_constraints cons, all_cons_columns cols
         WHERE cols.table_name = :tab AND cons.constraint_type = 'P'
           AND cons.constraint_name = cols.constraint_name AND cons.owner = (SELECT user FROM dual)`,
        { tab: selectedTable.toUpperCase() },
      );
      const pkColumns = pkResult.rows.map((row) => row[0]);

      let sqlQuery = '';
      const t = selectedTable.toUpperCase();

      switch (t) {
        case 'MODELE_AVIOANE':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, tip, capacitate_pasageri "CAPACITATE PASAGERI", capacitate_cargo "CAPACITATE CARGO (KG)", consum_mediu_kg "CONSUM MEDIU (KG/H)" FROM modele_avioane`;
          break;
        case 'AVIOANE':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, numar_de_inmatriculare "NUMAR INMATRICULARE", cod_iata "BAZA DESERVITA", tip, an_fabricatie "AN FABRICATIE", TO_CHAR(data_achizitie, 'DD-MM-YYYY') "DATA ACHIZITIE" FROM avioane`;
          break;
        case 'BAZE_AERIENE':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, cod_iata "COD IATA", nume_baza "NUME BAZA", oras, altitudine "ALTITUDINE (FT)", suprafata_totala "SUPRAFATA TOTALA (KM^2)", numar_hangare "NUMAR HANGARE" FROM baze_aeriene`;
          break;
        case 'MENTENANTE':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, TO_CHAR(data_incepere, 'DD-MM-YYYY') "DATA INCEPERE", numar_de_inmatriculare "NUMAR DE INMATRICULARE AVION", tip_verificare "TIP VERIFICARE", TO_CHAR(data_finalizare, 'DD-MM-YYYY') "DATA FINALIZARE", cost_estimat "COST ESTIMAT (EUR)" FROM mentenante`;
          break;
        case 'ZBORURI':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_zbor "ID ZBOR", id_ruta "ID RUTA", numar_de_inmatriculare "AVION ALOCAT", id_planificare "ID PLANIFICARE", poarta_imbarcare "POARTA IMBARCARE", cost_operare "COST OPERARE (EUR)" FROM zboruri`;
          break;
        case 'RUTE':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_ruta "ID RUTA", cod_iata_plecare "PLECARE", cod_iata_sosire "SOSIRE", culoar_aerian as "CULOAR_AERIAN" FROM rute`;
          break;
        case 'PLANIFICARI':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_planificare "ID PLANIFICARE", TO_CHAR(moment_decolare, 'DD-MM-YYYY HH24:MI') "DATA SI ORA PLECARII", TO_CHAR(moment_aterizare, 'DD-MM-YYYY HH24:MI') "DATA SI ORA ATERIZARII" FROM planificari`;
          break;
        case 'MEMBRII_ECHIPAJE':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_membru_echipaj "ID MEMBRU ECHIPAJ", tip_membru "TIP MEMBRU", nume, prenume, TO_CHAR(data_angajare, 'DD-MM-YYYY') "DATA ANGAJARE", salariu FROM membrii_echipaje`;
          break;
        case 'PILOTI':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_pilot "ID PILOT", ore_zbor_angajare "NUMAR DE ORE DE ZBOR LA ANGAJARE", licenta, grad FROM piloti`;
          break;
        case 'INSOTITORI_DE_ZBOR':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_insotitor_de_zbor "ID INSOTITOR DE ZBOR", nivel_limba_engleza "NIVEL LIMBA ENGLEZA", certificare FROM insotitori_de_zbor`;
          break;
        case 'CLIENTI':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_client "ID CLIENT", nume, prenume, email, TO_CHAR(data_nastere, 'DD-MM-YYYY') "DATA NASTERE", nationalitate, numar_de_telefon "NUMAR DE TELEFON" FROM clienti`;
          break;
        case 'SERVICII':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_serviciu "ID SERVICIU", denumire, tarif "TARIF (EUR)", metoda_achizitie "METODA ACHIZITIE" FROM servicii`;
          break;
        case 'REZERVARI':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_rezervare "ID REZERVARE", id_client "ID CLIENT", TO_CHAR(data_rezervare, 'DD-MM-YYYY') "DATA REZERVARE", pret_de_baza "PRET DE BAZA (EUR)" FROM rezervari`;
          break;
        case 'SELECTARI_SERVICII':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_rezervare "ID REZERVARE", id_serviciu "ID SERVICIU", cantitate FROM selectari_servicii`;
          break;
        case 'ASIGNARI_MEMBRII':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_zbor "ID_ZBOR", id_membru_echipaj "ID MEMBRU ECHIPAJ", rol_indeplinit "ROL INDEPLINIT" FROM asignari_membrii`;
          break;
        case 'BILETE':
          sqlQuery = `SELECT ROWID as RID_HIDDEN, id_rezervare "ID REZERVARE", id_zbor "ID ZBOR", cod_bilet "COD BILET" FROM bilete`;
          break;
        default:
          sqlQuery = `SELECT ROWID as RID_HIDDEN, t.* FROM "${selectedTable}" t`;
      }

      if (sortColumn)
        sqlQuery = `SELECT * FROM (${sqlQuery}) ORDER BY "${sortColumn}" ASC`;

      const data = await conn.execute(sqlQuery, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      const headers =
        data.metaData
          .filter((m) => m.name !== 'RID_HIDDEN')
          .map(
            (m) => `
                <th>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        ${m.name}
                        <a href="/dashboard?tabel=${selectedTable}&sort=${encodeURIComponent(m.name)}" style="color: #58a6ff; text-decoration:none;">▲</a>
                    </div>
                </th>`,
          )
          .join('') +
        `<th style="width: 80px; text-align:center;">Acțiuni</th>`;

      // --- COD MODIFICAT PENTRU PROTECȚIE PK ---
      const rows = data.rows.map((r) => {
        const cells = data.metaData
          .filter((m) => m.name !== 'RID_HIDDEN')
          .map((m) => {
            // 1. Definim variabilele corect de la început ca să nu mai dea ReferenceError
            const colAlias = m.name;
            const val = r[colAlias] ?? '';

            // 2. Aflăm numele "real" pentru verificare (înlocuim spațiile cu _)
            let realDbCol = colAlias.toUpperCase().replace(/ /g, '_');

            // 3. Caz special pentru AVIOANE: mapăm alias-ul la numele real din DB
            if (selectedTable.toUpperCase() === 'AVIOANE' && realDbCol === 'NUMAR_INMATRICULARE') {
              realDbCol = 'NUMAR_DE_INMATRICULARE';
            }

            // 4. Verificăm dacă este Primary Key (PK)
            const isPk = pkColumns.some(pk => pk.toUpperCase().trim() === realDbCol);

            if (isPk) {
              // Celulă PROTEJATĂ (fără iconiță)
              return `<td style="background: rgba(255,255,255,0.05); color: #8b949e; border: 1px solid #30363d; font-weight: bold;">
                            ${val} <span style="font-size: 8px; color: #f85149; margin-left: 5px;">[PK]</span>
                        </td>`;
            } else {
              // Celulă EDITABILĂ (cu iconiță)
              return `<td style="border: 1px solid #30363d;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${val}</span>
                                <a href="/edit?tabel=${selectedTable}&col=${realDbCol}&rid=${encodeURIComponent(r.RID_HIDDEN)}&alias=${encodeURIComponent(colAlias)}" class="btn-edit-small">
                                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </a>
                            </div>
                        </td>`;
            }
          }).join('');

        const deleteAction = `<td style="text-align: center; border: 1px solid #30363d;"><a href="/confirm-delete?tabel=${selectedTable}&rid=${encodeURIComponent(r.RID_HIDDEN)}" class="btn-delete-small"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></a></td>`;

        return `<tr>${cells}${deleteAction}</tr>`;
      }).join('');

      mainHtml = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h2 style="margin:0; color:#58a6ff;">${selectedTable}</h2>
                </div>
                <div style="overflow-x:auto;">
                    <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
                </div>`;
    } else if (isCascadeDemo) {
      const rez = await conn.execute(
        `SELECT id_rezervare "ID REZERVARE", id_client "ID CLIENT", TO_CHAR(data_rezervare, 'DD-MM-YYYY') "DATA REZERVARE", pret_de_baza "PRET BAZA" FROM rezervari`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      // Tabele asociative: selectăm coloanele specifice
      const bilete = await conn.execute(
        `SELECT id_zbor, id_rezervare FROM bilete ORDER BY id_rezervare`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      const servicii = await conn.execute(
        `SELECT id_rezervare, id_serviciu, cantitate FROM selectari_servicii ORDER BY id_rezervare`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      const nrBilete = bilete.rows.length;
      const nrServicii = servicii.rows.length;

      mainHtml = `
    <style>
        .cascade-wrapper { display: flex; flex-direction: column; align-items: center; width: 100%; margin-top: -25px; }
        .cascade-container { width: 98%; max-width: 1200px; }
        .cascade-container table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .cascade-container thead th { 
            position: sticky; top: 0; background: #161b22; z-index: 10; 
            box-shadow: inset 0 -1px 0 #30363d; padding: 10px; text-align: left;
            color: #8b949e; font-size: 11px;
        }
        .scroll-box { border: 1px solid #30363d; border-radius: 6px; overflow: auto; background: #0d1117; }
        .label-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
        .cascade-container td { padding: 8px 10px; border-bottom: 1px solid #21262d; font-size: 13px; color: #c9d1d9; }
    </style>

    <div class="cascade-wrapper">
        <div class="cascade-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="color:#58a6ff; margin:0; font-size: 1.3em;">Stergere Rezervari</h2>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h3 style="color:#f85149; margin:0; font-size: 1em;">1. TABEL PARINTE: REZERVARI</h3>
                </div>
                <div class="scroll-box" style="height: 220px;">
                    <table>
                        <thead>
                            <tr>
                                ${rez.metaData.map((m) => `<th>${m.name}</th>`).join('')}
                                <th style="color:#f85149; text-align:center;">ACTIUNE</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rez.rows
                              .map((row) => {
                                const idRez = row['ID REZERVARE'];
                                return `
                                <tr>
                                    ${Object.values(row)
                                      .map((val) => `<td>${val || ''}</td>`)
                                      .join('')}
                                    <td style="text-align:center;">
                                        <form action="/exec-delete" method="POST" onsubmit="return confirm('Ștergi rezervarea ${idRez}?')">
                                            <input type="hidden" name="id" value="${idRez}">
                                            <button type="submit" class="btn-delete-small" style="width:60px; height:22px; font-size:9px; cursor:pointer;">ȘTERGE</button>
                                        </form>
                                    </td>
                                </tr>`;
                              })
                              .join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <h4 style="color: #e67e22; margin:0; font-size: 0.9em;">2. BILETE (${nrBilete})</h4>
                    </div>
                    <div class="scroll-box" style="height: 280px;">
                        <table>
                            <thead><tr><th>ID ZBOR</th><th>ID REZERVARE</th></tr></thead>
                            <tbody>
                                ${bilete.rows
                                  .map(
                                    (b) => `
                                    <tr>
                                        <td>${b.ID_ZBOR || Object.values(b)[0]}</td>
                                        <td style="color:#e67e22;"><b>${b.ID_REZERVARE || Object.values(b)[1]}</b></td>
                                    </tr>`,
                                  )
                                  .join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <h4 style="color: #27ae60; margin:0; font-size: 0.9em;">3. SELECTARI SERVICII (${nrServicii})</h4>
                    </div>
                    <div class="scroll-box" style="height: 280px;">
                        <table>
                            <thead><tr><th>ID REZERVARE</th><th>ID SERVICIU</th><th>CANT</th></tr></thead>
                            <tbody>
                                ${servicii.rows
                                  .map(
                                    (s) => `
                                    <tr>
                                        <td style="color:#27ae60;"><b>${s.ID_REZERVARE || Object.values(s)[0]}</b></td>
                                        <td>${s.ID_SERVICIU || Object.values(s)[1]}</td>
                                        <td>${s.CANTITATE || Object.values(s)[2] || 0}</td>
                                    </tr>`,
                                  )
                                  .join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    } else if (view === 'servicii_flow') {
      const result = await conn.execute(`SELECT * FROM adaugare_servicii`, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      const headers =
        result.metaData.map((m) => `<th>${m.name}</th>`).join('') +
        `<th style="text-align:center; width:100px;">ACȚIUNI</th>`;

      const rows = result.rows
        .map((r) => {
          const cells = result.metaData
            .map((m) => `<td>${r[m.name] || 0}</td>`)
            .join('');

          const findKey = (obj, search) => {
            return Object.keys(obj).find((k) =>
              k.toUpperCase().includes(search.toUpperCase()),
            );
          };

          const keyRez = findKey(r, 'REZERVARE') || Object.keys(r)[0];
          const keySer =
            findKey(r, 'ID_SERVICIU') ||
            findKey(r, 'SERVICIU') ||
            Object.keys(r)[1];
          const keyCant =
            findKey(r, 'CANTITATE') || findKey(r, 'CANT') || 'CANTITATE'; // Căutăm coloana de cantitate

          let keyNume = Object.keys(r).find(
            (k) =>
              k.toUpperCase() === 'DENUMIRE' ||
              (k.toUpperCase().includes('SERVICIU') &&
                !k.toUpperCase().includes('ID')),
          );
          if (!keyNume)
            keyNume =
              findKey(r, 'DENUMIRE') || findKey(r, 'NUME') || Object.keys(r)[2];

          const idRez = encodeURIComponent(r[keyRez] || '');
          const idSer = encodeURIComponent(r[keySer] || '');
          const numeS = encodeURIComponent(r[keyNume] || 'Serviciu');
          const cant = encodeURIComponent(r[keyCant] || '1'); // Extragem cantitatea curentă

          return `
            <tr>
              ${cells}
              <td style="text-align:center; display:flex; gap:8px; justify-content:center; border:none; padding: 10px 5px;">
                <a href="/edit-serviciu-view?rez=${idRez}&ser=${idSer}&cant=${cant}" class="btn-edit-small" title="Editare">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </a>
                <a href="/confirm-delete-view?rez=${idRez}&ser=${idSer}&nume=${numeS}" class="btn-delete-small" title="Ștergere">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </a>
              </td>
            </tr>`;
        })
        .join('');

      mainHtml = `
<div style="display: flex; flex-direction: column; height: calc(100vh - 80px); gap: 10px;">
    <div style="flex-shrink: 0;">
        <h2 style="color:#58a6ff; margin: 0;">Servicii per Rezervare</h2>
        <p style="color:#8b949e; margin: 5px 0 10px 0; font-size: 0.85em;">Sursă date: VIZUALIZARE ADAUGARE_SERVICII</p>
    </div>

    <div style="flex-grow: 1; overflow-y: auto; border: 1px solid #30363d; border-radius: 6px; background: #0d1117;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="position: sticky; top: 0; background: #161b22; z-index: 10; box-shadow: 0 1px 0 #30363d;">
                <tr>${headers}</tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>

    <div style="flex-shrink: 0; background: #161b22; padding: 20px; border: 1px solid #30363d; border-radius: 8px; margin-top: 10px;">
        <h3 style="color:#238636; margin: 0 0 15px 0; font-size: 1em;">➕ Înregistrare Serviciu Nou</h3>
        <form action="/insert-serviciu" method="POST" style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 15px; align-items: flex-end;">
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="color:#8b949e; font-size:11px;">ID REZERVARE</label>
                <input type="text" name="id_rezervare" placeholder="Y7M4C9" required style="background:#0d1117; border:1px solid #30363d; color:white; padding:10px; border-radius:4px;">
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="color:#8b949e; font-size:11px;">ID SERVICIU</label>
                <input type="number" name="id_serviciu" placeholder="Cod" required style="background:#0d1117; border:1px solid #30363d; color:white; padding:10px; border-radius:4px;">
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="color:#8b949e; font-size:11px;">CANTITATE</label>
                <input type="number" name="cantitate" value="1" min="1" required style="background:#0d1117; border:1px solid #30363d; color:white; padding:10px; border-radius:4px;">
            </div>
            <button type="submit" style="background:#238636; color:white; border:none; padding:0 25px; border-radius:4px; font-weight:bold; height: 40px; cursor:pointer;">
                ÎNREGISTREAZĂ
            </button>
        </form>
    </div>
</div>`;
    } else if (view === 'statistici') {
      const tip = req.query.tip;
      let statisticaContent = '';

      if (tip) {
        const viewName =
          tip === 'ruta' ? 'COST_RUTA' : 'reparatii_avioane_2024';
        const titlu =
          tip === 'ruta'
            ? 'ANALIZA COST OPERARE PER RUTA'
            : 'SITUATIE MENTENANTA AVIOANE';
        const result = await conn.execute(`SELECT * FROM ${viewName}`);
        const headers = result.metaData
          .map((m) => `<th>${m.name}</th>`)
          .join('');
        const rows = result.rows
          .map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`)
          .join('');

        statisticaContent = `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #c9d1d9; margin: 0; font-size: 14px; letter-spacing: 1px;">${titlu}</h3>
                <a href="/dashboard?view=statistici" style="color: #58a6ff; text-decoration: none; font-size: 12px;">INAPOI LA SELECTIE</a>
            </div>
            <div style="border: 1px solid #30363d; border-radius: 6px; overflow: hidden; background: #0d1117;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #161b22;"><tr>${headers}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
      } else {
        statisticaContent = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <a href="/dashboard?view=statistici&tip=ruta" class="stat-card">
                    <div class="stat-label">FINANCIAR</div>
                    <div class="stat-title">COSTURI OPERARE RUTE</div>
                    <div class="stat-desc">Analiza detaliata a cheltuielilor per ruta in 2025.</div>
                </a>
                <a href="/dashboard?view=statistici&tip=mentenanta" class="stat-card">
                    <div class="stat-label">TEHNIC</div>
                    <div class="stat-title">MENTENANTA AVIOANE</div>
                    <div class="stat-desc">Raportul reparatiilor si costurilor tehnice per model.</div>
                </a>
            </div>`;
      }
      mainHtml = `<h2 style="color: #58a6ff; font-weight: 500; margin-bottom: 25px;">Rapoarte si Statistici</h2>${statisticaContent}`;
    }

    // --- RENDER FINAL ---
    res.send(`
    ${dashboardStyle}
    <style>
        /* Reset si Layout Principal */
        body { margin: 0; padding: 0; background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
        .sidebar { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: #0d1117; border-right: 1px solid #30363d; width: 260px; position: fixed; left: 0; top: 0; }
        .main-view { margin-left: 260px; height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: #0d1117; }
        
        .sidebar-scroll-area { flex: 1; overflow-y: auto; padding: 10px 0; }
        .sidebar-header { padding: 10px 20px; font-size: 11px; font-weight: 600; color: #8b949e; letter-spacing: 1px; text-transform: uppercase; }
        .cerere-sec { border-top: 1px solid #30363d; margin-top: 15px; padding-top: 15px; }
        
        .table-link { display: block; padding: 8px 20px; color: #c9d1d9; text-decoration: none; font-size: 13px; transition: 0.2s; border-left: 3px solid transparent; }
        .table-link:hover { background: #161b22; color: #58a6ff; }
        .table-link.active { background: #161b22; color: #58a6ff; border-left-color: #58a6ff; font-weight: 500; }

        /* Content Area */
        .content-area { 
            flex: 1; 
            padding: 25px; 
            overflow-y: auto; 
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }

        /* Tabel Design */
        .scroll-box { border: 1px solid #30363d; border-radius: 6px; overflow: auto; background: #0d1117; flex: 1; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px; color: #8b949e; border-bottom: 1px solid #30363d; font-size: 11px; text-transform: uppercase; position: sticky; top: 0; background: #161b22; z-index: 2; }
        td { padding: 12px; border-bottom: 1px solid #21262d; color: #c9d1d9; font-size: 13px; }
        tr:hover td { background: rgba(88, 166, 255, 0.05); }

        /* Carduri Statistici */
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; }
        .stat-card {
            background: #161b22;
            border: 1px solid #30363d;
            padding: 25px;
            border-radius: 8px;
            text-align: left;
            text-decoration: none;
            transition: 0.2s;
        }
        .stat-card:hover { border-color: #58a6ff; background: #1c2128; transform: translateY(-2px); }
        .stat-label { color: #58a6ff; font-size: 10px; font-weight: bold; letter-spacing: 1.2px; margin-bottom: 8px; }
        .stat-title { color: #c9d1d9; font-size: 16px; font-weight: 600; margin-bottom: 6px; }
        .stat-desc { color: #8b949e; font-size: 12px; line-height: 1.4; }

        /* Formular Fix */
        .form-container { background: #161b22; padding: 20px; border: 1px solid #30363d; border-radius: 8px; margin-top: 20px; flex-shrink: 0; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 15px; align-items: flex-end; }
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-group label { color: #8b949e; font-size: 11px; }
        .input-group input { background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; padding: 10px; border-radius: 6px; font-size: 13px; }
        .input-group input:focus { border-color: #58a6ff; outline: none; }
        
        .btn-submit { background: #238636; color: white; border: 1px solid rgba(240,246,252,0.1); padding: 0 25px; border-radius: 6px; cursor: pointer; font-weight: 600; height: 38px; }
        .btn-submit:hover { background: #2ea043; }

        .logout { margin-top: auto; padding: 15px 20px; color: #f85149; text-decoration: none; font-size: 12px; border-top: 1px solid #30363d; font-weight: 600; text-align: center; }
        .logout:hover { background: rgba(248, 81, 73, 0.1); }
    </style>

    <div class="sidebar">
        <div class="sidebar-header">Explorer</div>
        <div class="sidebar-scroll-area">
            <div class="table-list">${tableLinks}</div>
            
            <div class="sidebar-header cerere-sec">Operatiuni</div>
            <div class="table-list">
                <a href="/dashboard?view=servicii_flow" class="table-link ${view === 'servicii_flow' ? 'active' : ''}">Gestionare Servicii</a>
                <a href="/dashboard?view=statistici" class="table-link ${view === 'statistici' ? 'active' : ''}">Rapoarte si Statistici</a>
                <a href="/dashboard?view=cascade" class="table-link ${view === 'cascade' ? 'active' : ''}">Stergere rezervari</a>
            </div>

            <div class="sidebar-header cerere-sec">Interogari</div>
            <div class="table-list">${cereriLinks}</div>
        </div>
        <a href="/" class="logout">DECONECTARE</a>
    </div>

    <div class="main-view">
        <div class="tabs-bar">
            <div class="tab">${selectedTable || selectedQuery || view || 'index'}.sql</div>
        </div>
        <div class="content-area">
            ${
              mainHtml ||
              `
                <div style="text-align:center; padding-top:100px; color:#484f58;">
                    <div style="font-size: 32px; font-weight: 600; margin-bottom: 10px;">Romanian Airways SRL</div>
                    <p style="font-size: 14px;">Selectati o optiune din panoul lateral.</p>
                </div>
            `
            }
        </div>
    </div>
    `);
  } catch (err) {
    res.status(500).send(`Eroare: ${err.message}`);
  } finally {
    if (conn) await conn.close();
  }
});

app.get('/edit', (req, res) => {
  // ADĂUGĂM 'alias' AICI:
  const { tabel, col, rid, alias } = req.query;

  res.send(`
    ${dashboardStyle}
    <div style="display: grid; place-items: center; height: 100vh; width: 100vw; background: rgba(0,0,0,0.8); position: fixed; top:0; left:0; z-index:9999;">
      <div style="background: #161b22; padding: 30px; border-radius: 12px; border: 1px solid #30363d; width: 400px; text-align:center;">
        <h3 style="color:#58a6ff;">Modifica ${alias || col}</h3>
        <form action="/update" method="POST">
          <input type="hidden" name="tabel" value="${tabel}">
          <input type="hidden" name="col" value="${col}">
          <input type="hidden" name="rid" value="${rid}">
          <input type="text" name="nouaValoare" autofocus required style="width:100%; padding:10px; background:#0d1117; border:1px solid #30363d; color:white; border-radius:6px; margin-bottom:20px;">
          <div style="display:flex; gap:10px;">
            <button type="submit" style="flex:2; background:#238636; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer;">Salveaza</button>
            <a href="/dashboard?tabel=${tabel}" style="flex:1; background:#30363d; color:white; padding:10px; border-radius:6px; text-decoration:none;">Anuleaza</a>
          </div>
        </form>
      </div>
    </div>
  `);
});

app.post('/update', async (req, res) => {
  const { tabel, col, rid, nouaValoare } = req.body;
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);

    // 1. Curățăm numele tabelului
    const tableUpper = tabel.toUpperCase();

    // 2. Mapăm numele coloanei primit din formular către numele REAL din DB
    // Folosim aceeași logică de mapare ca în Dashboard pentru consistență
    let realCol = col.toUpperCase().trim().replace(/ /g, '_');

    // EXCEPȚIE SPECIFICĂ: Mapare pentru tabelul AVIOANE
    if (tableUpper === 'AVIOANE') {
      if (realCol === 'NUMAR_INMATRICULARE') realCol = 'NUMAR_DE_INMATRICULARE';
      if (realCol === 'BAZA_DESERVITA') realCol = 'COD_IATA';
    }

    // Dacă ai și alte tabele cu alias-uri, le adaugi aici:
    if (tableUpper === 'BAZE_AERIENE') {
      if (realCol === 'ALTITUDINE_(FT)') realCol = 'ALTITUDINE';
      if (realCol === 'SUPRAFATA_TOTALA_(KM^2)') realCol = 'SUPRAFATA_TOTALA';
    }

    if (tableUpper === 'MENTENANTE'){
      if (realCol === 'NUMAR_DE_INMATRICULARE_AVION') realCol = 'NUMAR_DE_INMATRICULARE';
      if (realCol === 'COST_ESTIMAT_(EUR)') realCol = 'COST_ESTIMAT';

    }

    if (tableUpper === 'MODELE_AVIOANE'){
      if (realCol === 'CAPACITATE_CARGO_(KG)') realCol = 'CAPACITATE_CARGO';
      if (realCol === 'CONSUM_MEDIU_(KG/H)') realCol = 'CONSUM_MEDIU_KG';
    }

    if (tableUpper === 'PILOTI'){
      if (realCol === 'NUMAR_DE_ORE_DE_ZBOR_LA_ANGAJARE') realCol = 'ORE_ZBOR_ANGAJARE';
    }

    if (tableUpper === 'PLANIFICARI'){
      if (realCol === 'DATA_SI_ORA_PLECARII') realCol = 'MOMENT_DECOLARE';
      if (realCol === 'DATA_SI_ORA_ATERIZARII') realCol = 'MOMENT_ATERIZARE';
    }

    if (tableUpper === 'REZERVARI'){
      if (realCol === 'PRET_DE_BAZA_(EUR)') realCol = 'PRET_DE_BAZA';
    }

    if  (tableUpper === 'RUTE'){
      if (realCol === 'PLECARE') realCol = 'COD_IATA_PLECARE';
      if (realCol === 'SOSIRE') realCol = "COD_IATA_SOSIRE";
    }

    if (tableUpper === 'SERVICII'){
      if (realCol === 'TARIF_(EUR)') realCol = 'TARIF';
    }

    if (tableUpper === 'ZBORURI'){
      if (realCol === 'AVION_ALOCAT') realCol = 'NUMAR_DE_INMATRICULARE';
      if (realCol === 'COST_OPERARE_(EUR)') realCol = 'COST_OPERARE';
    }
    // Poți adăuga aici și alte excepții dacă mai ai coloane cu nume diferite de alias

    // 3. Verificăm tipul de date în dicționarul Oracle
    const typeRes = await conn.execute(
      `SELECT data_type FROM user_tab_columns WHERE table_name = :t AND column_name = :c`,
      { t: tableUpper, c: realCol },
    );

    if (typeRes.rows.length === 0) {
      throw new Error(
        `Coloana "${realCol}" nu a fost găsită în tabelul "${tableUpper}"!`,
      );
    }

    const dataType = typeRes.rows[0][0];
    let sql = `UPDATE "${tableUpper}" SET "${realCol}" = `;
    let binds = { rid: rid };

    // 4. Construim SQL-ul în funcție de tipul de date
    if (dataType === 'DATE' || dataType.includes('TIMESTAMP')) {
      // Verificăm dacă valoarea primită conține și oră (ex: "28-01-2026 14:30")
      // Un format DD-MM-YYYY are exact 10 caractere.
      const hasTime = nouaValoare.trim().length > 10;
      const dateFormat = hasTime ? 'DD-MM-YYYY HH24:MI' : 'DD-MM-YYYY';
      sql += `TO_DATE(:val, '${dateFormat}') WHERE ROWID = :rid`;
      binds.val = nouaValoare;
    } else if (dataType === 'NUMBER') {
      sql += `:val WHERE ROWID = :rid`;
      // Conversie sigură pentru numere (cu punct sau virgulă)
      const numVal = Number(nouaValoare.replace(',', '.'));
      if (isNaN(numVal))
        throw new Error('Valoarea introdusă nu este un număr valid!');
      binds.val = numVal;
    } else {
      // Pentru VARCHAR2 și alte tipuri de text
      sql += `:val WHERE ROWID = :rid`;
      binds.val = nouaValoare;
    }

    await conn.execute(sql, binds, { autoCommit: true });

    // Succes - întoarcere la tabelul respectiv
    res.redirect(`/dashboard?tabel=${tabel}`);
  } catch (err) {
    console.error('Eroare Update:', err);
    res.status(500).send(`
        <div style="font-family:sans-serif; padding:20px;">
            <h2 style="color:red;">Eroare la actualizare</h2>
            <p>${err.message}</p>
            <a href="javascript:history.back()">Înapoi la formular</a>
        </div>
    `);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (e) {
        console.error(e);
      }
    }
  }
});

app.get('/confirm-delete', (req, res) => {
  const { tabel, rid } = req.query;
  res.send(`${dashboardStyle}
    <div style="display: grid; place-items: center; height: 100vh; width: 100vw; background: rgba(0,0,0,0.85); position: fixed; top:0; left:0; z-index:9999;">
        <div style="background: #161b22; padding: 30px; border-radius: 12px; border: 1px solid #f85149; width: 400px; text-align:center;">
            <h3 style="color:#f85149; margin-top:0;">Confirma Stergerea</h3>
            <p style="color:#c9d1d9;">Esti sigur ca vrei sa stergi aceasta inregistrare din <b>${tabel}</b>?</p>
            <p style="font-size:11px; color:#8b949e;">Aceasta actiune este ireversibila.</p>
            <form action="/execute-delete" method="POST" style="margin-top:20px; display:flex; gap:10px;">
                <input type="hidden" name="tabel" value="${tabel}">
                <input type="hidden" name="rid" value="${rid}">
                <button type="submit" style="flex:2; background:#da3633; color:white; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer;">Da, Sterge</button>
                <a href="/dashboard?tabel=${tabel}" style="flex:1; background:#30363d; color:white; text-decoration:none; border-radius:6px; display:grid; place-items:center; font-size:13px;">Anuleaza</a>
            </form>
        </div>
    </div>`);
});

app.post('/execute-delete', async (req, res) => {
  const { tabel, rid } = req.body;
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);

    // Folosim ROWID pentru a fi siguri că ștergem exact rândul selectat
    const sql = `DELETE FROM "${tabel.toUpperCase()}" WHERE ROWID = :rid`;

    await conn.execute(sql, { rid: rid }, { autoCommit: true });

    res.redirect(`/dashboard?tabel=${tabel}`);
  } catch (err) {
    res
      .status(500)
      .send(
        `<h3>Eroare la ștergere: ${err.message}</h3><a href="/dashboard?tabel=${tabel}">Înapoi</a>`,
      );
  } finally {
    if (conn) await conn.close();
  }
});

app.get('/demo-cascade', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);

    // 1. Extragere date din toate tabelele implicate
    const rez = await conn.execute(
      `SELECT * FROM rezervari ORDER BY id_rezervare`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const bilete = await conn.execute(
      `SELECT * FROM bilete ORDER BY id_rezervare`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const servicii = await conn.execute(
      `SELECT * FROM selectari_servicii ORDER BY id_rezervare`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    let html = `${style}
    <div class="container" style="max-width: 1200px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>Monitorizare Integritate Referențială (CASCADE)</h2>
            <a href="/dashboard" class="btn btn-back">Inapoi</a>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 2px solid #3498db; margin-bottom: 30px;">
            <h3>1. Tabel Principal: REZERVARI</h3>
            <p>Stergerea unei inregistrari va declansa stergerea automata in tabelele asociative BILETE si SELECTARI_SERVICII</p>
            <table border="1" style="width:100%; border-collapse: collapse; background: white;">
                <thead style="background: #3498db; color: white;">
                    <tr>
                        ${rez.metaData.map((m) => `<th>${m.name}</th>`).join('')}
                        <th>ACȚIUNE</th>
                    </tr>
                </thead>
                <tbody>
                    ${rez.rows
                      .map(
                        (row) => `
                        <tr>
                            ${Object.values(row)
                              .map((val) => `<td>${val || ''}</td>`)
                              .join('')}
                            <td>
                                <form action="/exec-delete" method="POST" onsubmit="return confirm('Ștergi rezervarea ${row.ID_REZERVARE} și toate datele asociate?')">
                                    <input type="hidden" name="id" value="${row.ID_REZERVARE}">
                                    <button type="submit" class="btn" style="background: #e74c3c; width: 100%;">ȘTERGE</button>
                                </form>
                            </td>
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
            
            <div style="background: #fff; border: 1px solid #ddd; padding: 10px;">
                <h4 style="color: #2c3e50; border-bottom: 2px solid #e67e22;">2. Tabel BILETE (${bilete.rows.length})</h4>
                <div style="max-height: 400px; overflow-y: auto;">
                    <table border="1" style="width:100%; font-size: 0.8em; border-collapse: collapse;">
                        <tr style="background: #eee;"><th>ID Bilet</th><th>ID Rez</th></tr>
                        ${bilete.rows
                          .map(
                            (b) => `
                            <tr><td>${Object.values(b)[0]}</td><td style="background: #fdf2e9;"><b>${b.ID_REZERVARE}</b></td></tr>
                        `,
                          )
                          .join('')}
                    </table>
                </div>
            </div>

            <div style="background: #fff; border: 1px solid #ddd; padding: 10px;">
                <h4 style="color: #2c3e50; border-bottom: 2px solid #27ae60;">3. SERVICII (${servicii.rows.length})</h4>
                <div style="max-height: 400px; overflow-y: auto;">
                    <table border="1" style="width:100%; font-size: 0.8em; border-collapse: collapse;">
                        <tr style="background: #eee;"><th>Serviciu</th><th>ID Rez</th></tr>
                        ${servicii.rows
                          .map(
                            (s) => `
                            <tr><td>${Object.values(s)[0]}</td><td style="background: #eafaf1;"><b>${s.ID_REZERVARE}</b></td></tr>
                        `,
                          )
                          .join('')}
                    </table>
                </div>
            </div>
        </div>
    </div>`;

    res.send(html);
  } catch (err) {
    res.status(500).send('Eroare: ' + err.message);
  } finally {
    if (conn) await conn.close();
  }
});

app.post('/exec-delete', async (req, res) => {
  let conn;
  const idRezervare = req.body.id;

  try {
    conn = await oracledb.getConnection(dbConfig);

    // Executăm ștergerea - Cascade va face restul în baza de date
    await conn.execute(
      `DELETE FROM rezervari WHERE id_rezervare = :id`,
      { id: idRezervare },
      { autoCommit: true },
    );

    // REDIRECȚIONARE CORECTĂ: te trimite înapoi în Dashboard, pe vizualizarea Cascade
    res.redirect('/dashboard?view=cascade');
  } catch (err) {
    console.error(err);
    res.status(500).send('Eroare la ștergere: ' + err.message);
  } finally {
    if (conn) await conn.close();
  }
});

app.get('/adaugare-serviciu-flow', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);

    // Executăm query-ul pe view
    const result = await conn.execute(`SELECT * FROM adaugare_servicii`);

    // 1. Generăm dinamic Header-ul tabelului folosind metaData (aliasurile din SQL)
    let tableHeaders = result.metaData
      .map((meta) => `<th>${meta.name}</th>`)
      .join('');

    // 2. Generăm rândurile tabelului
    let tableRows = result.rows
      .map((r) => `<tr>${r.map((v) => `<td>${v || 0}</td>`).join('')}</tr>`)
      .join('');

    res.send(`
      ${style}
      <div class="container">
        <h2>Servicii per Rezervare (Vizualizare: adaugare_servicii)</h2>
        <table class="table">
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <hr>
        <h3>Adauga Inregistrare Noua</h3>
        <form action="/insert-serviciu" method="POST" class="form-grid">
          <input type="text" name="id_rezervare" placeholder="ID Rezervare (String)" required>
          <input type="number" name="id_serviciu" placeholder="ID Serviciu" required>
          <input type="number" name="cantitate" placeholder="Cantitate" required>
          <button type="submit" class="btn">Inregistreaza Serviciu</button>
        </form>
        <a href="/vizualizari" class="btn btn-back">Inapoi</a>
      </div>
    `);
  } catch (err) {
    res.send(err.message);
  } finally {
    if (conn) await conn.close();
  }
});

// Ruta de procesare INSERT
app.post('/insert-serviciu', async (req, res) => {
  const { id_rezervare, id_serviciu, cantitate } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `INSERT INTO selectari_servicii (id_rezervare, id_serviciu, cantitate)
       VALUES (:id_rez, :id_ser, :cant)`,
      {
        id_rez: { val: String(id_rezervare), type: oracledb.STRING },
        id_ser: { val: Number(id_serviciu), type: oracledb.NUMBER },
        cant: { val: Number(cantitate), type: oracledb.NUMBER },
      },
      { autoCommit: true },
    );

    // Succes: Mergem înapoi la tabel
    res.redirect('/dashboard?view=servicii_flow');
  } catch (err) {
    console.error('Eroare la inserare:', err.message);

    // REZOLVARE ECRAN ALB: Trimitem un script care anunță eroarea și face redirect
    let mesajEroare = 'Eroare la salvare!';
    if (err.message.includes('ORA-00001')) {
      mesajEroare =
        'Această înregistrare există deja (ID Rezervare + ID Serviciu duplicate)!';
    }

    res.send(`
      <script>
        alert("${mesajEroare}");
        window.location.href = "/dashboard?view=servicii_flow";
      </script>
    `);
  } finally {
    if (conn) await conn.close();
  }
});

// 3a. Pagina de alegere a statisticii
app.get('/selectie-statistici', (req, res) => {
  res.send(`
    ${style}
    <div class="container">
      <h2>Alege Statistica</h2>
      <div class="menu-options">
        <a href="/afisare-statistica?tip=ruta" class="btn">Total cost operare per ruta 2025</a>
        <a href="/afisare-statistica?tip=mentenanta" class="btn">Total cost mentenante 2024 per tip avion</a>
      </div>
      <br>
      <a href="/vizualizari" class="btn btn-back">Inapoi</a>
    </div>
  `);
});

// 3b. Afisarea dinamica a vizualizarii alese
app.get('/afisare-statistica', async (req, res) => {
  const tip = req.query.tip;
  let viewName = tip === 'ruta' ? 'COST_RUTA' : 'reparatii_avioane_2024';
  let titlu =
    tip === 'ruta'
      ? 'Cost Operare per Ruta (2025)'
      : 'Cost Mentenanta per Tip Avion (2024)';

  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(`SELECT * FROM ${viewName}`);

    let headers = result.metaData.map((m) => `<th>${m.name}</th>`).join('');
    let rows = result.rows
      .map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`)
      .join('');

    res.send(`
      ${style}
      <div class="container">
        <h2>${titlu}</h2>
        <table class="table">
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <br>
        <a href="/selectie-statistici" class="btn btn-back">Inapoi la selectie</a>
      </div>
    `);
  } catch (err) {
    res.send(err.message);
  } finally {
    if (conn) await conn.close();
  }
});

app.get('/vizualizari', (req, res) => {
  res.send(`
    ${style}
    <div class="container">
      <h2>Gestionare Operatiuni</h2>
      <div class="menu-options">
        <a href="/adaugare-serviciu-flow" class="btn btn-main">1. Adaugare serviciu pentru o rezervare</a>
        <a href="/selectie-statistici" class="btn btn-main">2. Statistici</a>
      </div>
      <br>
      <a href="/dashboard" class="btn btn-back">Inapoi</a>
    </div>
  `);
});

app.get('/delete-view-servicii', async (req, res) => {
  const { rez, ser } = req.query;
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    // Ștergem din tabelul bază, nu din view
    await conn.execute(
      `DELETE FROM selectari_servicii WHERE id_rezervare = :rez AND id_serviciu = :ser`,
      { rez, ser },
      { autoCommit: true },
    );
    res.redirect('/dashboard?view=servicii_flow');
  } catch (err) {
    res.status(500).send('Eroare la ștergere: ' + err.message);
  } finally {
    if (conn) await conn.close();
  }
});

app.get('/edit-serviciu-view', (req, res) => {
  const { rez, ser, cant } = req.query; // Preluăm și cantitatea din URL

  res.send(`
    ${dashboardStyle}
    <div style="display: grid; place-items: center; height: 100vh; width: 100vw; background: rgba(0,0,0,0.8); position: fixed; top:0; left:0; z-index:9999;">
      <div style="background: #161b22; padding: 30px; border-radius: 12px; border: 1px solid #30363d; width: 450px; text-align:center;">
        <h3 style="color:#58a6ff; margin-bottom: 20px;">Modifică Înregistrare Serviciu</h3>
        
        <form action="/update-serviciu-view" method="POST" style="text-align: left;">
          <input type="hidden" name="old_rez" value="${rez}">
          <input type="hidden" name="old_ser" value="${ser}">

          <div style="margin-bottom: 15px;">
            <label style="color:#8b949e; font-size: 11px; display:block; margin-bottom:5px;">ID REZERVARE</label>
            <input type="text" name="new_rez" value="${rez}" required 
                   style="width:100%; padding:10px; background:#0d1117; border:1px solid #30363d; color:white; border-radius:6px;">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="color:#8b949e; font-size: 11px; display:block; margin-bottom:5px;">ID SERVICIU</label>
            <input type="number" name="new_ser" value="${ser}" required 
                   style="width:100%; padding:10px; background:#0d1117; border:1px solid #30363d; color:white; border-radius:6px;">
          </div>

          <div style="margin-bottom: 25px;">
            <label style="color:#8b949e; font-size: 11px; display:block; margin-bottom:5px;">CANTITATE</label>
            <input type="number" name="new_cant" value="${cant || 1}" min="1" required 
                   style="width:100%; padding:10px; background:#0d1117; border:1px solid #30363d; color:white; border-radius:6px;">
          </div>

          <div style="display:flex; gap:10px;">
            <button type="submit" style="flex:2; background:#238636; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold;">Actualizează Tot</button>
            <a href="/dashboard?view=servicii_flow" style="flex:1; background:#30363d; color:white; padding:12px; border-radius:6px; text-decoration:none; text-align:center; font-size: 13px;">Anulează</a>
          </div>
        </form>
      </div>
    </div>
  `);
});
// Procesarea UPDATE-ului pentru view (se execută în tabelul bază)
app.post('/update-serviciu-view', async (req, res) => {
  const { old_rez, old_ser, new_rez, new_ser, new_cant } = req.body;
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);

    const sql = `
      UPDATE selectari_servicii 
      SET id_rezervare = :new_rez, 
          id_serviciu = :new_ser, 
          cantitate = :new_cant
      WHERE id_rezervare = :old_rez 
        AND id_serviciu = :old_ser
    `;

    await conn.execute(
      sql,
      {
        new_rez: new_rez,
        new_ser: Number(new_ser),
        new_cant: Number(new_cant),
        old_rez: old_rez,
        old_ser: Number(old_ser),
      },
      { autoCommit: true },
    );

    res.redirect('/dashboard?view=servicii_flow');
  } catch (err) {
    res.status(500).send(`
      <div style="background:#0d1117; color:#f85149; padding:20px; font-family:sans-serif;">
        <h3>Eroare la actualizare</h3>
        <p>${err.message}</p>
        <a href="/dashboard?view=servicii_flow" style="color:#58a6ff;">Înapoi la tabel</a>
      </div>
    `);
  } finally {
    if (conn) await conn.close();
  }
});

app.get('/confirm-delete-view', (req, res) => {
  const { rez, ser, nume } = req.query;
  res.send(`${dashboardStyle}
    <div style="display: grid; place-items: center; height: 100vh; width: 100vw; background: rgba(0,0,0,0.85); position: fixed; top:0; left:0; z-index:9999;">
        <div style="background: #161b22; padding: 30px; border-radius: 12px; border: 1px solid #f85149; width: 400px; text-align:center;">
            <h3 style="color:#f85149; margin-top:0;">Confirmă Ștergerea</h3>
            <p style="color:#c9d1d9;">Elimini serviciul <b>${decodeURIComponent(nume)}</b> de pe rezervarea <b>${rez}</b>?</p>
            <p style="font-size:11px; color:#8b949e;">ID Serviciu: ${ser}</p>
            <form action="/execute-delete-view" method="POST" style="margin-top:20px; display:flex; gap:10px;">
                <input type="hidden" name="rez" value="${rez}">
                <input type="hidden" name="ser" value="${ser}">
                <button type="submit" style="flex:2; background:#da3633; color:white; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer;">Da, Șterge</button>
                <a href="/dashboard?view=servicii_flow" style="flex:1; background:#30363d; color:white; text-decoration:none; border-radius:6px; display:grid; place-items:center; font-size:13px;">Anulează</a>
            </form>
        </div>
    </div>`);
});

app.post('/execute-delete-view', async (req, res) => {
  const { rez, ser } = req.body;
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    await conn.execute(
      `DELETE FROM selectari_servicii WHERE id_rezervare = :rez AND id_serviciu = :ser`,
      { rez: rez, ser: Number(ser) },
      { autoCommit: true },
    );
    res.redirect('/dashboard?view=servicii_flow');
  } catch (err) {
    res.status(500).send('Eroare la ștergere: ' + err.message);
  } finally {
    if (conn) await conn.close();
  }
});

app.listen(3000, () => {
  console.log('Server pornit.');
  console.log('Acceseaza: http://localhost:3000');
});
