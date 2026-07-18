"use client";

import { useState } from "react";

const JOURS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
const HEURES = Array.from({ length: 13 }, (_, i) => i + 7); // 7h → 19h
const MINUTES = [0, 15, 30, 45];

type Dispo = { jour: string; heure: number; minute: number };

const formatDispo = (d: Dispo) =>
  `${d.jour} à ${d.heure}h${String(d.minute).padStart(2, "0")}`;

export default function ContactForm() {
  // Coordonnées
  const [civilite, setCivilite] = useState<"mme" | "m" | "">("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  // Message
  const [sujets, setSujets] = useState({
    demande_visite: false,
    etre_rappele: false,
    plus_de_photos: false,
  });
  const [message, setMessage] = useState("");

  // Disponibilités
  const [jour, setJour] = useState(JOURS[0]);
  const [heure, setHeure] = useState(HEURES[0]);
  const [minute, setMinute] = useState(MINUTES[0]);
  const [dispos, setDispos] = useState<Dispo[]>([]);

  const toggleSujet = (key: keyof typeof sujets) =>
    setSujets((s) => ({ ...s, [key]: !s[key] }));

  const ajouterDispo = () => {
    const nouvelle = { jour, heure, minute };
    // évite les doublons exacts
    if (dispos.some((d) => formatDispo(d) === formatDispo(nouvelle))) return;
    setDispos((d) => [...d, nouvelle]);
  };

  const retirerDispo = (index: number) =>
    setDispos((d) => d.filter((_, i) => i !== index));

  // Envoi du formulaire
  const [statut, setStatut] = useState<"idle" | "envoi" | "succes" | "erreur">(
    "idle"
  );
  const [erreurs, setErreurs] = useState<string[]>([]);

  const reinitialiser = () => {
    setCivilite("");
    setNom("");
    setPrenom("");
    setEmail("");
    setTelephone("");
    setSujets({ demande_visite: false, etre_rappele: false, plus_de_photos: false });
    setMessage("");
    setDispos([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatut("envoi");
    setErreurs([]);

    try {
      const reponse = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civilite,
          nom,
          prenom,
          email,
          telephone,
          sujets,
          message,
          dispos,
        }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreurs(donnees.erreurs ?? ["Une erreur est survenue, veuillez réessayer."]);
        setStatut("erreur");
        return;
      }

      setStatut("succes");
      reinitialiser();
    } catch {
      setErreurs(["Impossible de contacter le serveur, veuillez réessayer."]);
      setStatut("erreur");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-[url('/salon.png')] bg-cover bg-center p-8 sm:p-10 shadow-xl"
    >
      {/* léger voile pour la lisibilité du texte blanc */}
      <div className="absolute inset-0 bg-black/10" aria-hidden />

      <div className="relative">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
          Contactez l&apos;agence
        </h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* ── Colonne gauche ───────────────────────────── */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Vos coordonnées
            </h2>

            {/* Civilité */}
            <div className="mt-4 flex items-center gap-8">
              {(
                [
                  { value: "mme", label: "Mme" },
                  { value: "m", label: "M" },
                ] as const
              ).map((c) => (
                <label
                  key={c.value}
                  className="flex cursor-pointer items-center gap-2 text-white"
                >
                  <input
                    type="radio"
                    name="civilite"
                    value={c.value}
                    checked={civilite === c.value}
                    onChange={() => setCivilite(c.value)}
                    className="h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-white checked:border-[5px] checked:border-white checked:bg-transparent"
                  />
                  {c.label}
                </label>
              ))}
            </div>

            {/* Champs */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="input-pill rounded-full bg-white px-5 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                type="text"
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="rounded-full bg-white px-5 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                type="email"
                placeholder="Adresse mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-2 rounded-full bg-white px-5 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="col-span-2 rounded-full bg-white px-5 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Disponibilités */}
            <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-white">
              Disponibilités pour une visite
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={jour}
                onChange={(e) => setJour(e.target.value)}
                className="select-pill w-32 cursor-pointer rounded-full bg-white px-5 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-400"
              >
                {JOURS.map((j) => (
                  <option key={j}>{j}</option>
                ))}
              </select>
              <select
                value={heure}
                onChange={(e) => setHeure(Number(e.target.value))}
                className="select-pill w-24 cursor-pointer rounded-full bg-white px-5 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-400"
              >
                {HEURES.map((h) => (
                  <option key={h} value={h}>{`${h}h`}</option>
                ))}
              </select>
              <select
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="select-pill w-24 cursor-pointer rounded-full bg-white px-5 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-400"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>{`${m}m`}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={ajouterDispo}
                className="cursor-pointer rounded-full bg-indigo-800 px-4 py-1.5 text-xs font-bold uppercase leading-tight text-white transition hover:bg-indigo-700"
              >
                Ajouter
                <br />
                dispo
              </button>
            </div>

            {/* Chips */}
            {dispos.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {dispos.map((d, i) => (
                  <li
                    key={formatDispo(d)}
                    className="flex w-fit items-center gap-3 rounded-full bg-gray-800/70 px-4 py-1.5 text-xs text-white"
                  >
                    {formatDispo(d)}
                    <button
                      type="button"
                      onClick={() => retirerDispo(i)}
                      aria-label={`Retirer ${formatDispo(d)}`}
                      className="cursor-pointer text-white/70 transition hover:text-white"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Colonne droite ───────────────────────────── */}
          <div className="flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Votre message
            </h2>

            {/* Sujets */}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              {(
                [
                  { key: "demande_visite", label: "Demande de visite" },
                  { key: "etre_rappele", label: "Être rappelé.e" },
                  { key: "plus_de_photos", label: "Plus de photos" },
                ] as const
              ).map((s) => (
                <label
                  key={s.key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-white"
                >
                  <input
                    type="checkbox"
                    checked={sujets[s.key]}
                    onChange={() => toggleSujet(s.key)}
                    className="h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-white checked:border-[5px] checked:border-white"
                  />
                  {s.label}
                </label>
              ))}
            </div>

            <textarea
              placeholder="Votre message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-4 w-full resize-none rounded-3xl bg-white px-5 py-4 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-400"
            />

            {statut === "succes" && (
              <p className="mt-4 rounded-2xl bg-green-600/90 px-5 py-3 text-sm text-white">
                Votre message a bien été envoyé, nous vous recontacterons rapidement.
              </p>
            )}

            {statut === "erreur" && erreurs.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 rounded-2xl bg-red-600/90 px-5 py-3 pl-8 text-sm text-white">
                {erreurs.map((erreur) => (
                  <li key={erreur}>{erreur}</li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              disabled={statut === "envoi"}
              className="mt-auto ml-auto cursor-pointer rounded-full bg-amber-400 px-14 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statut === "envoi" ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}