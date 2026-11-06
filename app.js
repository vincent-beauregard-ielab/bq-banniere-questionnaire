// Questionnaire bannière BQ : affichage, classement, choix, grille, brouillon local, envoi au script Google.
(function () {
  "use strict";

  const CONFIG = window.CONFIG;
  const QUESTIONS = window.QUESTIONS;
  const CLE_BROUILLON = "bq-banniere-ronde-" + CONFIG.RONDE;
  const LETTRES = "ABCDEFGH";
  const typeDe = (q) => q.type || "classement";
  // Rangs possibles : de 1 au nombre d'options (4 ou 6 selon la question).
  const rangsDe = (q) => q.options.map((_, i) => i + 1);
  const questionDe = (qid) => QUESTIONS.find((x) => x.id === qid);

  // État par question :
  //   classement : { rangs: {A:1,...}, eviter: {A:true}, ordre: ["C","A",...], commentaire }
  //   choix      : { choix: "B", eviter: {...}, ordre: [...], commentaire }
  //   grille     : { grille: {chiffres:"indispensable",...}, action: "atlas", commentaire }
  const etat = {};

  function melanger(liste) {
    const t = liste.slice();
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  }

  function etatVide(q) {
    if (typeDe(q) === "grille") return { grille: {}, action: "", commentaire: "" };
    const ids = q.options.map((o) => o.id);
    return {
      rangs: {}, choix: "", eviter: {}, commentaire: "",
      // Ordre d'affichage tiré au hasard pour chaque répondant, sauf pour une échelle (ordreFixe).
      ordre: q.ordreFixe ? ids : melanger(ids),
    };
  }

  // ---------- Brouillon local (confort seulement) ----------
  function lireBrouillon() {
    try {
      return JSON.parse(localStorage.getItem(CLE_BROUILLON) || "null");
    } catch (e) {
      return null;
    }
  }
  const brouillon = lireBrouillon();

  QUESTIONS.forEach((q) => {
    const vide = etatVide(q);
    const garde = brouillon && brouillon.etat && brouillon.etat[q.id];
    // Un brouillon d'une version précédente (autres options) est ignoré pour cette question.
    const ids = q.options ? q.options.map((o) => o.id).sort().join() : "";
    const valide = garde && (!vide.ordre || (Array.isArray(garde.ordre) && garde.ordre.slice().sort().join() === ids));
    etat[q.id] = valide ? Object.assign(vide, garde) : vide;
    if (q.ordreFixe) etat[q.id].ordre = q.options.map((o) => o.id);
  });

  // ---------- Mini-bannières en blocs gris ----------
  const bloc = (classe, texte) => `<div class="s-bloc ${classe}"><span>${texte}</span></div>`;
  const MP_TITRE = '<div class="mp-titre">Titre du message</div>';
  const MP_TEXTE = '<div class="mp-texte"><i></i><i></i><i class="court"></i></div>';
  const MP_LOGOS = '<div class="mp-logos"><i></i><i></i><i></i><i></i></div>';
  const MP_LOGO = '<div class="mp-logo">logo</div>';
  const MP_QR = '<div class="mp-qr">QR</div>';
  const MP_IMAGE = (classe) => `<div class="mp-image ${classe || ""}"><span>image</span></div>`;

  // Lignes de la question « quantité d'information » : chaque ligne fait toute la largeur,
  // avec un nombre de blocs et une épaisseur qui varient (bande, deux moitiés, trois tiers, puces).
  const LIGNE = {
    bande: () => '<div class="d-ligne d-bande"><i></i></div>',
    epaisse: () => '<div class="d-ligne d-epaisse"><i></i></div>',
    deux: () => '<div class="d-ligne d-deux"><i></i><i></i></div>',
    trois: () => '<div class="d-ligne d-trois"><i></i><i></i><i></i></div>',
    puces: (n) => `<div class="d-ligne d-puces">${"<span><b></b><i></i></span>".repeat(n)}</div>`,
  };
  // Composition par nombre d'éléments (le total des blocs donne bien 1, 3, 6 ou 10).
  const COMPOSITIONS = {
    1: [LIGNE.epaisse()],
    3: [LIGNE.bande(), LIGNE.deux()],
    6: [LIGNE.epaisse(), LIGNE.deux(), LIGNE.puces(3)],
    10: [LIGNE.bande(), LIGNE.deux(), LIGNE.trois(), LIGNE.puces(4)],
  };

  const GABARITS = {
    // Question « quantité d'information » : même forme et même image, de 1 à 10 éléments.
    densite: (v) => `
      <div class="rollup mp mp-densite" aria-hidden="true">
        ${MP_LOGO}${MP_TITRE}${MP_IMAGE("densite-image")}
        <div class="d-lignes">${COMPOSITIONS[v.blocs].join("")}</div>
        ${MP_LOGOS}
      </div>`,
    // Question « fond » : même contenu, quatre fonds.
    fond: (v) => `
      <div class="rollup mp mp-fond fond-${v.fond}" aria-hidden="true">
        ${MP_LOGO}${MP_TITRE}${MP_TEXTE}
        <div class="mp-ressort"></div>
        ${MP_QR}
        <div class="mp-ressort"></div>
        ${MP_LOGOS}
      </div>`,
    mp_bas: () => `
      <div class="rollup mp mp-bas" aria-hidden="true">
        ${MP_LOGO}${MP_TITRE}${MP_TEXTE}
        <div class="mp-ressort"></div>
        ${MP_IMAGE("bas")}
        <div class="mp-pied">${MP_QR}${MP_LOGOS}</div>
      </div>`,
    // Question « mise en page » : mêmes éléments, quatre dispositions.
    mp_pleine: () => `
      <div class="rollup mp mp-pleine" aria-hidden="true">
        ${MP_IMAGE("fond")}
        <div class="mp-dessus">${MP_LOGO}<div class="mp-ressort"></div>${MP_TITRE}${MP_TEXTE}${MP_QR}</div>
        ${MP_LOGOS}
      </div>`,
    mp_bandeau: () => `
      <div class="rollup mp mp-bandeau" aria-hidden="true">
        ${MP_LOGO}${MP_IMAGE("haut")}
        <div class="mp-bande">${MP_TITRE}${MP_TEXTE}</div>
        <div class="mp-ressort"></div>${MP_QR}
        ${MP_LOGOS}
      </div>`,
    mp_tuiles: () => `
      <div class="rollup mp mp-tuiles" aria-hidden="true">
        ${MP_LOGO}
        <div class="mp-grille">
          <div class="mp-tuile mp-large">${MP_TITRE}</div>
          ${MP_IMAGE("tuile mp-large")}
          <div class="mp-tuile">${MP_TEXTE}</div>
          <div class="mp-tuile mp-tuile-qr">${MP_QR}</div>
        </div>
        ${MP_LOGOS}
      </div>`,
    mp_typo: () => `
      <div class="rollup mp mp-typo" aria-hidden="true">
        ${MP_LOGO}
        <div class="mp-grand-titre">Titre du message</div>
        ${MP_TEXTE}
        <div class="mp-ressort"></div>
        <div class="mp-ligne">${MP_IMAGE("petite")}${MP_QR}</div>
        ${MP_LOGOS}
      </div>`,
  };

  // Directions non utilisées en ronde 1, gardées pour une ronde suivante (styles dans style.css) :
  // anciennes maquettes de style (photo, motif, carte, épuré) et directions « hors des sentiers battus ».
  // Pour en utiliser une : visuel: { type: "maquette", gabarit: "reserve_photo" }, par exemple.
  const LOGOS = '<div class="r-logos"><i></i><i></i><i></i><i></i></div>';
  const TITRE = '<div class="r-titre">Le message principal ici</div>';
  const TEXTE = '<div class="r-texte">Une ou deux lignes de texte de soutien.</div>';
  Object.assign(GABARITS, {
    reserve_photo: () => `
      <div class="rollup g-photo" aria-hidden="true">
        <div class="r-image"><img src="assets/svg/logo_horizontal_blanc.svg" alt=""></div>
        <div class="r-bande">${TITRE}${TEXTE}</div>
        <div class="r-bas"><div class="r-qr"></div></div>
        ${LOGOS}
      </div>`,
    reserve_motif: () => `
      <div class="rollup g-motif" aria-hidden="true">
        <img class="r-logo" src="assets/svg/logo_vertical_blanc.svg" alt="">
        <div class="r-bande">${TITRE}${TEXTE}</div>
        <div class="r-centre"><div class="r-qr"></div></div>
        ${LOGOS}
      </div>`,
    reserve_carte: () => `
      <div class="rollup g-carte" aria-hidden="true">
        <img class="r-logo" src="assets/svg/logo_horizontal_blanc.svg" alt="">
        ${TITRE}
        <div class="r-image"></div>
        <div class="r-pictos"></div>
        <div class="r-chiffres">
          <div><b>XX&#8239;M</b><small>observations</small></div>
          <div><b>XX</b><small>sites suivis</small></div>
        </div>
        ${LOGOS}
      </div>`,
    reserve_epure: () => `
      <div class="rollup g-epure" aria-hidden="true">
        <img class="r-logo" src="assets/svg/logo_horizontal_couleur.svg" alt="">
        ${TITRE}
        <div class="r-volets">
          <div><i style="--src:url('assets/svg/picto-01.svg')"></i>Partenariat</div>
          <div><i style="--src:url('assets/svg/picto-02.svg')"></i>Données</div>
          <div><i style="--src:url('assets/svg/picto-05.svg')"></i>Analyses</div>
          <div><i style="--src:url('assets/svg/picto-08.svg')"></i>Outils</div>
        </div>
        <div class="r-photo"></div>
        ${LOGOS}
      </div>`,
    reserve_typo: () => `
      <div class="rollup g-typo" aria-hidden="true">
        <div class="t-mots"><span>Obser&shy;ver.</span><span>Analy&shy;ser.</span><span>Parta&shy;ger.</span></div>
        <div class="t-pied"><img src="assets/svg/logo_horizontal_couleur.svg" alt=""></div>
      </div>`,
    reserve_dataart: () => `
      <div class="rollup g-dataart" aria-hidden="true">
        <div class="d-chiffre"><b>XX&#8239;M</b><small>observations d'espèces au Québec</small></div>
        <img class="d-logo" src="assets/svg/logo_horizontal_blanc.svg" alt="">
      </div>`,
    reserve_espece: () => `
      <div class="rollup g-espece" aria-hidden="true">
        <div class="e-question">Combien en reste-t-il&nbsp;?</div>
        <div class="e-sous">On le mesure. Venez voir.</div>
        <img class="e-logo" src="assets/svg/logo_horizontal_blanc.svg" alt="">
      </div>`,
    reserve_question: () => `
      <div class="rollup g-question" aria-hidden="true">
        <div class="q-question">Quelles espèces vivent près de chez vous&nbsp;?</div>
        <div class="q-qr"><div class="r-qr"></div></div>
        <div class="q-consigne">Scannez : l'Atlas de votre région</div>
        <img class="q-logo" src="assets/svg/logo_horizontal_couleur.svg" alt="">
      </div>`,
  });

  // ---------- Schémas (question sur la relation) : des blocs, sans style ----------
  const SCHEMAS = {
    miroir: () => `
      <div class="rollup sch s-clair" aria-hidden="true">
        ${bloc("s-logo", "logo")}${bloc("s-message", "message")}${bloc("s-image", "image")}${bloc("s-logos", "partenaires")}
      </div>`,
    contraste: () => `
      <div class="rollup sch s-fonce" aria-hidden="true">
        ${bloc("s-logo", "logo")}${bloc("s-message", "message")}${bloc("s-image", "image")}${bloc("s-logos", "partenaires")}
      </div>`,
    continuite: () => `
      <div class="rollup sch s-clair s-continue" aria-hidden="true">
        ${bloc("s-logo", "logo")}${bloc("s-message", "message")}${bloc("s-image s-pleine-largeur", "")}${bloc("s-logos", "partenaires")}
      </div>`,
    independante: () => `
      <div class="rollup sch s-blanc" aria-hidden="true">
        ${bloc("s-image-haut", "image")}${bloc("s-logo s-gauche", "logo")}${bloc("s-message s-gauche", "message")}
        <div class="s-tuiles">${bloc("", "")}${bloc("", "")}${bloc("", "")}${bloc("", "")}</div>
        ${bloc("s-logos", "partenaires")}
      </div>`,
  };

  function lienSur(url) {
    try {
      const u = new URL(url);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  function visuelHTML(v) {
    if (v.type === "texte") {
      return `<div class="visuel-texte"><strong>${v.titre}</strong><span>${v.texte}</span></div>`;
    }
    if (v.type === "image") {
      const source = v.source && lienSur(v.source.url)
        ? ` · <a href="${lienSur(v.source.url)}" target="_blank" rel="noopener noreferrer">${v.source.texte}</a>`
        : "";
      return `<div class="visuel-image"><img src="${v.src}" alt="${v.legende}" loading="lazy"><span class="legende">${v.legende}${source}</span></div>`;
    }
    if (v.type === "maquette") {
      return GABARITS[v.gabarit](v);
    }
    if (v.type === "schema") {
      // « pont » : une bande traverse les deux bannières à la hauteur de la forêt (Continuité).
      const pont = v.pont ? '<div class="pont-bande" aria-hidden="true"><span>même paysage</span></div>' : "";
      return `<div class="paire${v.pont ? " pont" : ""}">
        <div class="colonne"><div class="rollup v2" aria-hidden="true"></div><div class="etiquette">Actuelle</div></div>
        <div class="colonne">${SCHEMAS[v.gabarit]()}<div class="etiquette">Nouvelle</div></div>
        ${pont}
      </div>`;
    }
    return "";
  }

  // ---------- Affichage ----------
  // La lettre affichée suit la position à l'écran ; l'option garde son id stable (data-option).
  function optionHTML(q, o, lettre) {
    const nomEviter = `eviter-${q.id}-${o.id}`;
    const selection = typeDe(q) === "choix"
      ? `<label class="choix-unique"><input type="radio" name="choix-${q.id}" value="${o.id}"> ${q.libelleChoix || "Je choisis cette option"}</label>`
      : `<div class="rangs" role="group" aria-label="Rang de l'option ${lettre}, ${o.nom}">
           ${rangsDe(q).map((r) => `<button type="button" data-rang="${r}" aria-pressed="false">${r}</button>`).join("")}
         </div>
         <div class="rangs-aide"><span>préférée</span><span>moins</span></div>`;
    return `
      <div class="option" data-option="${o.id}">
        <div class="option-tete"><span class="option-lettre">${lettre}</span><h3>${o.nom}</h3></div>
        ${o.description ? `<p class="option-desc">${o.description}</p>` : ""}
        <div class="visuel">${visuelHTML(o.visuel)}</div>
        <div class="selection">
          ${selection}
          <label class="eviter"><input type="checkbox" name="${nomEviter}" data-eviter="${o.id}"> À éviter</label>
        </div>
      </div>`;
  }

  function grilleHTML(q) {
    const lignes = q.elements.map((el) => `
      <tr>
        <th scope="row">${el.nom}</th>
        ${q.niveaux.map((n) => `<td><label><input type="radio" name="grille-${q.id}-${el.id}" value="${n.id}" data-element="${el.id}"><span class="sr">${n.nom}</span></label></td>`).join("")}
      </tr>`).join("");
    const actions = q.action.choix.map((c) => `
      <label class="pastille"><input type="radio" name="action-${q.id}" value="${c.id}"> ${c.nom}</label>`).join("");
    const compte = q.maxIndispensable
      ? `<p class="grille-compte" aria-live="polite"></p>`
      : "";
    return `
      ${compte}
      <div class="grille-cadre">
        <table class="grille">
          <thead><tr><th></th>${q.niveaux.map((n) => `<th scope="col">${n.nom}</th>`).join("")}</tr></thead>
          <tbody>${lignes}</tbody>
        </table>
      </div>
      <fieldset class="action">
        <legend>${q.action.titre}</legend>
        ${actions}
      </fieldset>`;
  }

  const COMMENTAIRE = `
    <div class="commentaire">
      <label>Commentaires <span>Ce que vous aimez, ce qu'il faudrait tester ou combiner, et ce qui manque (une option à laquelle nous n'avons pas pensé). Nommez les options (par exemple « Miroir »), pas leur lettre : l'ordre change d'une personne à l'autre.</span>
        <textarea rows="3" data-champ="commentaire" placeholder="Facultatif"></textarea>
      </label>
    </div>`;

  function afficher() {
    const zone = document.getElementById("questions");
    QUESTIONS.forEach((q, i) => {
      const section = document.createElement("section");
      section.className = "bloc";
      section.id = "q-" + q.id;
      let corps;
      if (typeDe(q) === "grille") {
        corps = grilleHTML(q);
      } else {
        const parId = Object.fromEntries(q.options.map((o) => [o.id, o]));
        corps = `<div class="options n${q.options.length}">${etat[q.id].ordre.map((id, pos) => optionHTML(q, parId[id], LETTRES[pos])).join("")}</div>`;
        if (typeDe(q) === "classement") {
          corps += `<p class="rappel" aria-live="polite"></p>`;
          // Avec plus de 4 options, le rappel est aussi affiché en haut (utile sur téléphone).
          if (q.options.length > 4) corps = `<p class="rappel rappel-haut"></p>` + corps;
        }
      }
      section.innerHTML = `
        <h2><span class="num">${i + 1}</span>${q.titre}</h2>
        <p class="consigne">${q.consigne}</p>
        ${corps}
        ${COMMENTAIRE}`;
      zone.appendChild(section);
      brancher(q, section);
    });

    document.querySelectorAll(".visuel-image img, .intro-v2 img").forEach((img) => {
      img.addEventListener("click", () => loupe(img.src, img.alt));
    });
    afficherExternes();
  }

  function brancher(q, section) {
    const s = etat[q.id];
    section.querySelectorAll(".rangs button").forEach((b) => {
      const opt = b.closest(".option").dataset.option;
      b.addEventListener("click", () => classer(q.id, opt, Number(b.dataset.rang)));
    });
    section.querySelectorAll('input[type="radio"][name^="choix-"]').forEach((r) => {
      r.addEventListener("change", () => { s.choix = r.value; rafraichir(q.id); sauver(); });
    });
    section.querySelectorAll("input[data-eviter]").forEach((c) => {
      c.addEventListener("change", () => {
        if (c.checked) s.eviter[c.dataset.eviter] = true;
        else delete s.eviter[c.dataset.eviter];
        rafraichir(q.id);
        sauver();
      });
    });
    section.querySelectorAll("input[data-element]").forEach((r) => {
      r.addEventListener("change", () => {
        const el = r.dataset.element;
        const max = q.maxIndispensable;
        if (max && r.value === "indispensable") {
          const deja = Object.entries(s.grille).filter(([k, v]) => k !== el && v === "indispensable").length;
          if (deja >= max) {
            // Refus : on remet le choix précédent et on explique.
            r.checked = false;
            rafraichir(q.id, `Vous avez déjà ${max} indispensables. Passez-en un à « Bienvenu » pour en choisir un autre.`);
            return;
          }
        }
        s.grille[el] = r.value;
        rafraichir(q.id);
        sauver();
      });
    });
    section.querySelectorAll('input[name^="action-"]').forEach((r) => {
      r.addEventListener("change", () => { s.action = r.value; rafraichir(q.id); sauver(); });
    });
    const t = section.querySelector('[data-champ="commentaire"]');
    t.addEventListener("input", () => { s.commentaire = t.value; sauver(); });
  }

  // Exemples externes choisis par l'équipe (liens seulement), affichés dans la dernière section.
  function afficherExternes() {
    const liste = (CONFIG.EXEMPLES_EXTERNES || []).map((x) => ({ titre: x.titre, url: lienSur(x.url) })).filter((x) => x.url);
    const zone = document.getElementById("externes");
    if (!liste.length || !zone) return;
    zone.textContent = "Quelques exemples déjà repérés (s'ouvrent dans un nouvel onglet) :";
    const ul = document.createElement("ul");
    liste.forEach((x) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = x.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = (x.titre || x.url) + " ↗";
      li.appendChild(a);
      ul.appendChild(li);
    });
    zone.appendChild(ul);
    zone.hidden = false;
  }

  function loupe(src, alt) {
    const d = document.createElement("div");
    d.className = "loupe";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Image agrandie");
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    d.appendChild(img);
    const fermer = () => {
      d.remove();
      document.removeEventListener("keydown", echap);
    };
    const echap = (e) => {
      if (e.key === "Escape") fermer();
    };
    d.addEventListener("click", fermer);
    document.addEventListener("keydown", echap);
    document.body.appendChild(d);
  }

  // ---------- Classement ----------
  function classer(qid, opt, rang) {
    const rangs = etat[qid].rangs;
    const ancien = rangs[opt] || null;
    if (ancien === rang) {
      delete rangs[opt];
    } else {
      const autre = Object.keys(rangs).find((k) => rangs[k] === rang);
      if (autre) {
        if (ancien) rangs[autre] = ancien;
        else delete rangs[autre];
      }
      rangs[opt] = rang;
      // La dernière option se classe toute seule.
      const q = questionDe(qid);
      const libres = q.options.map((o) => o.id).filter((k) => !rangs[k]);
      if (libres.length === 1) {
        const pris = Object.values(rangs);
        rangs[libres[0]] = rangsDe(q).find((r) => !pris.includes(r));
      }
    }
    rafraichir(qid);
    sauver();
  }

  function rafraichir(qid, avertissement) {
    const q = QUESTIONS.find((x) => x.id === qid);
    const s = etat[qid];
    const section = document.getElementById("q-" + qid);
    if (typeDe(q) === "grille") {
      Object.entries(s.grille).forEach(([el, niv]) => {
        const r = section.querySelector(`input[data-element="${el}"][value="${niv}"]`);
        if (r) r.checked = true;
      });
      const compte = section.querySelector(".grille-compte");
      if (compte) {
        const n = Object.values(s.grille).filter((v) => v === "indispensable").length;
        compte.textContent = avertissement || `Indispensables : ${n} sur ${q.maxIndispensable} au plus.`;
        compte.classList.toggle("alerte", !!avertissement);
      }
      if (s.action) {
        const r = section.querySelector(`input[name="action-${qid}"][value="${s.action}"]`);
        if (r) r.checked = true;
      }
    } else {
      section.querySelectorAll(".option").forEach((carte) => {
        const id = carte.dataset.option;
        const r = s.rangs[id] || "";
        carte.dataset.rang = typeDe(q) === "choix" ? (s.choix === id ? 1 : "") : r;
        carte.querySelectorAll(".rangs button").forEach((b) => {
          b.setAttribute("aria-pressed", String(Number(b.dataset.rang) === r));
        });
        const radio = carte.querySelector('input[type="radio"]');
        if (radio) radio.checked = s.choix === id;
        const ev = carte.querySelector("input[data-eviter]");
        ev.checked = !!s.eviter[id];
        carte.classList.toggle("a-eviter", !!s.eviter[id]);
      });
      const rappels = section.querySelectorAll(".rappel");
      if (rappels.length) {
        const nomDe = Object.fromEntries(q.options.map((o) => [o.id, o.nom]));
        const classees = Object.keys(s.rangs).filter((k) => nomDe[k]).sort((a, b) => s.rangs[a] - s.rangs[b]);
        const n = q.options.length;
        const texte = classees.length
          ? "Votre ordre : " + classees.map((k) => nomDe[k]).join(" › ") + (classees.length < n ? " (à compléter)" : "")
          : `Classez les ${n} options : cliquez un rang sous chaque option.`;
        rappels.forEach((p) => { p.textContent = texte; });
      }
    }
    if (complet(qid)) section.classList.remove("manque");
  }

  function complet(qid) {
    const q = QUESTIONS.find((x) => x.id === qid);
    const s = etat[qid];
    if (typeDe(q) === "grille") return q.elements.every((el) => s.grille[el.id]) && !!s.action;
    if (typeDe(q) === "choix") return !!s.choix;
    return q.options.every((o) => s.rangs[o.id]);
  }

  const form = document.getElementById("formulaire");

  function sauver() {
    try {
      localStorage.setItem(CLE_BROUILLON, JSON.stringify({
        etat,
        nom: form.nom.value,
        kiosque: (form.querySelector('input[name="kiosque"]:checked') || {}).value || "",
        liens: form.liens.value,
        libre: form.libre.value,
      }));
    } catch (e) {
      /* stockage indisponible : on continue sans brouillon */
    }
  }

  function restaurer() {
    QUESTIONS.forEach((q) => {
      const section = document.getElementById("q-" + q.id);
      section.querySelector('[data-champ="commentaire"]').value = etat[q.id].commentaire || "";
      rafraichir(q.id);
    });
    if (!brouillon) return;
    form.nom.value = brouillon.nom || "";
    form.liens.value = brouillon.liens || "";
    form.libre.value = brouillon.libre || "";
    if (brouillon.kiosque) {
      const r = form.querySelector(`input[name="kiosque"][value="${brouillon.kiosque}"]`);
      if (r) r.checked = true;
    }
  }

  // ---------- Envoi ----------
  function reponses() {
    const r = {
      ronde: CONFIG.RONDE,
      envoye_le: new Date().toISOString(),
      nom: form.nom.value.trim(),
      kiosque: (form.querySelector('input[name="kiosque"]:checked') || {}).value || "",
    };
    QUESTIONS.forEach((q) => {
      const s = etat[q.id];
      if (typeDe(q) === "grille") {
        q.elements.forEach((el) => { r[`${q.id}_${el.id}`] = s.grille[el.id] || ""; });
        r[`${q.id}_action`] = s.action || "";
      } else {
        if (typeDe(q) === "choix") r[`${q.id}_choix`] = s.choix || "";
        q.options.forEach((o) => {
          if (typeDe(q) === "classement") r[`${q.id}_${o.id}`] = s.rangs[o.id] || "";
          r[`${q.id}_${o.id}_eviter`] = s.eviter[o.id] ? "oui" : "";
        });
        r[`${q.id}_ordre_affiche`] = s.ordre.join(" ");
      }
      r[`${q.id}_commentaire`] = (s.commentaire || "").trim();
    });
    r.liens = form.liens.value.trim();
    r.libre = form.libre.value.trim();
    return r;
  }

  function message(texte, classe) {
    const p = document.getElementById("etat");
    p.className = classe || "";
    p.textContent = texte;
    return p;
  }

  function copieDeSecours(donnees) {
    const p = document.getElementById("etat");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(donnees, null, 2)], { type: "application/json" }));
    a.download = `banniere_ronde${CONFIG.RONDE}_${donnees.nom.replace(/\W+/g, "_") || "reponses"}.json`;
    a.textContent = "télécharger une copie de vos réponses";
    p.append(" Vous pouvez aussi ", a, ".");
  }

  function valider() {
    const manquantes = [];
    form.nom.classList.toggle("manque", !form.nom.value.trim());
    if (!form.nom.value.trim()) manquantes.push(form.nom);
    QUESTIONS.forEach((q) => {
      const section = document.getElementById("q-" + q.id);
      const ok = complet(q.id);
      section.classList.toggle("manque", !ok);
      if (!ok) manquantes.push(section);
    });
    return manquantes;
  }

  async function envoyer(e) {
    e.preventDefault();
    const manquantes = valider();
    if (manquantes.length) {
      message("Il manque votre nom ou une réponse (encadrée en brun).", "erreur");
      manquantes[0].scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const donnees = reponses();
    const bouton = document.getElementById("bouton-envoi");

    if (!CONFIG.ENDPOINT) {
      console.log("Mode test, réponses :", donnees);
      message("Mode test : aucune adresse d'envoi n'est configurée, rien n'a été envoyé.", "erreur");
      copieDeSecours(donnees);
      return;
    }

    bouton.disabled = true;
    message("Envoi en cours…");
    let rep;
    try {
      rep = await fetch(CONFIG.ENDPOINT, { method: "POST", body: JSON.stringify(donnees) });
    } catch (err) {
      // La requête n'est pas partie (réseau) ou la réponse de Google n'est pas lisible.
      // On ne renvoie pas : un second envoi créerait un doublon.
      message("Impossible de confirmer l'envoi. Vos réponses sont peut-être bien arrivées ; en cas de doute, renvoyez dans quelques minutes.", "erreur");
      copieDeSecours(donnees);
      bouton.disabled = false;
      return;
    }
    try {
      const json = await rep.json();
      if (!json.ok) throw new Error(json.erreur || "refus");
      message("Merci ! Vos réponses sont enregistrées. Si vous renvoyez le questionnaire, c'est votre dernier envoi qui comptera.", "ok");
    } catch (err) {
      message("Google a refusé l'envoi. Réessayez, ou gardez une copie de vos réponses.", "erreur");
      copieDeSecours(donnees);
    } finally {
      bouton.disabled = false;
    }
  }

  afficher();
  restaurer();
  sauver(); // garde l'ordre tiré au hasard dès la première visite
  form.addEventListener("input", (e) => {
    if (!e.target.closest(".bloc[id^='q-']")) sauver();
  });
  form.addEventListener("change", (e) => {
    if (!e.target.closest(".bloc[id^='q-']")) sauver();
  });
  form.addEventListener("submit", envoyer);
})();
