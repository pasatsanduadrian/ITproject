# Calculator Estimare Costuri IT

Aplicatie web statica (HTML, CSS si JavaScript) pentru estimarea costurilor de proiect in domeniul IT (software si hardware). Include o interfata simpla, componenta de grafic cu Chart.js si un mic script de deploy cu ngrok.

## Caracteristici principale

- **Estimari Software si Hardware** – dezvoltatori pe roluri, servicii extra, licente si componente configurabile
- **Buffer de risc si marja comerciala** – ajustabile prin slider
- **Grafic donut** – afiseaza ponderea costurilor
- **Butoane de actiune** – Reseteaza, Salveaza (simulat) si Incarca (simulat)
- **Tema light/dark** – se adapteaza automat dupa preferinte

## Structura proiectului

```
ITproject/
├── index.html      # Interfata principala
├── style.css       # Fisierul de stiluri
├── app.js          # Logica aplicatiei (CostCalculator)
└── deploy.py       # Script Python pentru deploy cu ngrok
```

## Rulare locala

1. Instaleaza dependintele daca vrei sa folosesti `deploy.py`:
   ```bash
   pip install -r requirements.txt
   ```
2. Copiaza fisierul `.env.example` in `.env` si completeaza valorile propriilor tokenuri.
3. Lanseaza aplicatia folosind scriptul de deploy:
   ```bash
   python deploy.py
   ```
   Ngrok va afisa un link public stabil pe care il poti folosi pentru a accesa aplicatia.

Pentru test rapid, poti rula si serverul Python in mod simplu:
```bash
python -m http.server 8000
```
si apoi deschizi `http://localhost:8000` in browser.

## Exemple vizuale

*(Poti adauga aici capturi de ecran cu interfata aplicatiei.)*

## Contributii

Propunerile de imbunatatire si issue-urile sunt binevenite. Trimite un PR sau deschide un tichet nou in repo.

---

Acest README ofera un rezumat clar, instructiuni de utilizare si un ghid de deployment care sa ajute orice utilizator sa porneasca aplicatia rapid.

