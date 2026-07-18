import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Pool de connexions partagé (réutilisé entre les requêtes)
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const JOURS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

type Body = {
  civilite?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  sujets?: {
    demande_visite?: boolean;
    etre_rappele?: boolean;
    plus_de_photos?: boolean;
  };
  message?: string;
  dispos?: { jour?: string; heure?: number; minute?: number }[];
};

/** Valide le corps de la requête. Retourne la liste des erreurs (vide si OK). */
function valider(body: Body): string[] {
  const erreurs: string[] = [];

  if (body.civilite !== "mme" && body.civilite !== "m")
    erreurs.push("La civilité est requise.");

  if (!body.nom?.trim()) erreurs.push("Le nom est requis.");
  if (!body.prenom?.trim()) erreurs.push("Le prénom est requis.");

  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    erreurs.push("L'adresse mail est invalide.");

  // Téléphone français : 10 chiffres, ou +33 suivi de 9 chiffres
  const tel = (body.telephone ?? "").replace(/[\s.-]/g, "");
  if (!/^(0\d{9}|\+33\d{9})$/.test(tel))
    erreurs.push("Le numéro de téléphone est invalide.");

  for (const d of body.dispos ?? []) {
    const heureOk = Number.isInteger(d.heure) && d.heure! >= 0 && d.heure! <= 23;
    const minuteOk =
      Number.isInteger(d.minute) && d.minute! >= 0 && d.minute! <= 59;
    if (!JOURS.includes((d.jour ?? "").toLowerCase()) || !heureOk || !minuteOk) {
      erreurs.push("Une disponibilité est invalide.");
      break;
    }
  }

  return erreurs;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erreurs: ["Requête invalide."] }, { status: 400 });
  }

  const erreurs = valider(body);
  if (erreurs.length > 0) {
    return NextResponse.json({ erreurs }, { status: 400 });
  }

  const connexion = await pool.getConnection();
  try {
    // Transaction : le contact et ses disponibilités sont insérés
    // ensemble, ou pas du tout.
    await connexion.beginTransaction();

    const [resultat] = await connexion.execute<mysql.ResultSetHeader>(
      `INSERT INTO contact
        (civilite, nom, prenom, email, telephone,
         demande_visite, etre_rappele, plus_de_photos, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.civilite as "mme" | "m",
        body.nom!.trim(),
        body.prenom!.trim(),
        body.email!.trim(),
        body.telephone!.trim(),
        body.sujets?.demande_visite ?? false,
        body.sujets?.etre_rappele ?? false,
        body.sujets?.plus_de_photos ?? false,
        body.message?.trim() || null,
      ]
    );

    const contactId = resultat.insertId;

    for (const d of body.dispos ?? []) {
      await connexion.execute(
        `INSERT INTO disponibilite (contact_id, jour, heure, minute)
         VALUES (?, ?, ?, ?)`,
        [contactId, d.jour!.toLowerCase(), d.heure!, d.minute!]
      );
    }

    await connexion.commit();
    return NextResponse.json({ id: contactId }, { status: 201 });
  } catch (erreur) {
    await connexion.rollback();
    console.error("Erreur lors de l'enregistrement du contact :", erreur);
    return NextResponse.json(
      { erreurs: ["Une erreur est survenue, veuillez réessayer."] },
      { status: 500 }
    );
  } finally {
    connexion.release();
  }
}