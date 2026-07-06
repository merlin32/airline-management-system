# Managementul unei companii de zboruri low-cost

Acest proiect reprezintă o aplicație completă pentru gestionarea eficientă a operațiunilor dintr-o companie aeriană de tip low-cost. Proiectul a fost dezvoltat ca **proiect de facultate** în cadrul Universității din București, Facultatea de Matematică și Informatică, specializarea Calculatoare și Tehnologia Informației, pentru disciplina **Baze de Date**.

## Descrierea Proiectului
Obiectivul principal al lucrării este organizarea și administrarea structurii de date specifice unei companii aeriene. Sistemul permite evidența detaliată a flotei de aeronave, rutelor de zbor, programărilor, personalului de zbor (piloți și însoțitori), precum și a clienților, rezervărilor efectuate și a serviciilor suplimentare achiziționate de aceștia.

### Componente Principale și Reguli de Modelare:
- **Flotă și Mentenanță:** Gestionarea avioanelor (înmatriculate cu prefixul `YR-`) și istoricul intervențiilor tehnice ale acestora.
- **Infrastructură:** Alocarea avioanelor către baze aeriene specifice (identificate prin coduri unice IATA din 3 litere).
- **Zboruri și Rute:** Definirea traseelor aeriene (plecare/sosire distincte) și planificarea temporală exactă a zborurilor (durată minimă de 20 de minute).
- **Echipaj:** Asignarea personalului (Piloți cu grade/ore de zbor și Însoțitori de zbor cu certificări specifice) pe zboruri, cu roluri bine definite.
- **Clienți și Rezervări:** Administrarea pasagerilor, emiterea de bilete unice și atașarea serviciilor opționale (bagaj suplimentar, închirieri mașini, prioritate etc.).

---

## Tehnologii Utilizate

### Backend & Bază de Date:
- **Oracle Database 19c:** Sistemul de gestiune a bazelor de date relaționale.
- **Node.js & JavaScript:** Mediul de execuție pentru server și logica de backend.
- **oracledb:** Driverul oficial Oracle pentru Node.js care permite interogarea bazei de date în timp real.
- **DataGrip / Oracle SQL Developer:** Instrumente utilizate pentru proiectarea schemei conceptuale și scrierea scripturilor SQL.

### Frontend:**
- **HTML5 & CSS3:** Dezvoltarea unei interfețe grafice responsive, moderne (temă întunecată / Dark Mode).

---

## Interfața Grafică și Funcționalități
Aplicația pune la dispoziție un dashboard interactiv prin intermediul căruia utilizatorul poate efectua:
1. **Autentificare securizată:** Fereastră de login conectată direct la instanța locală a bazei de date Oracle.
2. **Vizualizare și Sortare (Read):** Listarea tabelelor din sistem cu posibilitatea ordonării dinamice după coloane.
3. **Operații LMD (Create, Update, Delete):** Editarea celulelor direct din interfață și ștergerea înregistrărilor.
4. **Integritate Cascade:** Implementarea constrângerilor de tip `ON DELETE CASCADE` (de exemplu, ștergerea unei rezervări elimină automat biletele și serviciile asociate).
5. **Rapoarte, Statistici și Interogări Complexe:** Extragerea automată a datelor din multiple tabele corelate, utilizarea funcțiilor de grup, a clauzei `HAVING` și utilizarea vizualizărilor compuse și complexe (ex: analiza costurilor per rută, istoricul reparațiilor pe anul precedent).

---

## Ghid de Instalare și Inițializare

Urmați pașii de mai jos pentru a configura și rula proiectul pe mediul local:

### 1. Configurarea Bazei de Date
Asigurați-vă că aveți instalat **Oracle Database 19c**. Deschideți instrumentul preferat (DataGrip sau Oracle SQL Developer) și executați scripturile din documentație în următoarea ordine:
1. Scriptul de crearea a tabelelor (`10.1. Crearea tabelelor`).
2. Scriptul de populare a datelor (`10.2. Inserarea datelor în tabele`).

### 2. Inițializarea proiectului Node.js
Deschideți terminalul în directorul rădăcină al proiectului și inițializați managerul de pachete pentru a genera fișierul `package.json`:
```bash
npm init -y
```

### 3. Instalarea dependențelor necesare
Instalați driverul oficial Oracle și framework-ul web Express rulând o singură comandă în terminal:
```bash
npm install oracledb express
```

### 4. Pornirea Aplicației
Asigurați-vă că fișierul principal al serverului (ex: app.js sau index.js) conține credențialele corecte de conectare (user, password, connectString spre instanța locală, de exemplu localhost:1521/orcl). Lansați serverul rulând:
```bash
node app.js
```