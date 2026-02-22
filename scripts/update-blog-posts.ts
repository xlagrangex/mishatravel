/**
 * Update blog posts with Unsplash cover images and cleaned HTML content
 * Usage: npx tsx scripts/update-blog-posts.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================
// IMAGE HELPER
// ============================================================
async function uploadUnsplashImage(unsplashUrl: string, slug: string): Promise<string> {
  const fullUrl = `${unsplashUrl}?w=1600&h=900&fit=crop&q=80`;
  console.log(`  Downloading ${slug}...`);
  const resp = await fetch(fullUrl);
  if (!resp.ok) throw new Error(`Failed to download image: ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  const contentType = resp.headers.get("content-type") || "image/jpeg";
  const path = `covers/${slug}.jpg`;

  const { error } = await supabase.storage
    .from("blog")
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from("blog").getPublicUrl(path);
  console.log(`  Uploaded: ${data.publicUrl}`);
  return data.publicUrl;
}

// ============================================================
// BLOG POST DATA
// ============================================================
interface BlogUpdate {
  slug: string;
  unsplashUrl: string;
  excerpt: string;
  content: string;
}

const updates: BlogUpdate[] = [
  {
    slug: "uzbekistan-dorato",
    unsplashUrl: "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59",
    excerpt: "Un viaggio nell'Uzbekistan dorato, tra le cupole di maiolica di Samarcanda, il deserto del Kyzylkum e le antiche rotte della Via della Seta. Scopri una terra di storia millenaria, artigianato e ospitalita senza pari.",
    content: `<p><em>"La canicola di mezzogiorno ha ceduto il passo al fresco notturno. Stridono le cicale, gorgoglia l'acqua nei canali, si sente il profumo dei fiori. Su tutta questa bellezza, si stende il manto nero del firmamento trapuntato di stelle. Asia centrale fiabesca, magica."</em></p>

<h2>Una terra tra deserti dorati e cupole di maiolica</h2>

<p>Monti color lilla, deserti gialli, verdi oasi fiorenti, impetuosi torrenti di montagna: ineffabilmente bella e la natura dell'Uzbekistan. Generosa e la sua terra irrigata dall'acqua portata sui campi dai canali scavati dal suo popolo laborioso. Cotone e bozzoli di seta, uva dolce e pesche, meloni fragranti e melograni porporei.</p>

<p>Il suo clima e continentale, ricco di giornate di sole, con inverni brevi, primavere precoci, un'estate calda e arida, ed un autunno mite. Millenni fa l'uomo si stanzio in questo angolo del globo terrestre, e in tempi preistorici qui nacque l'agricoltura su terre irrigue, base della vita di questi luoghi siccitosi.</p>

<h2>Samarcanda: la perla della Via della Seta</h2>

<p>La storia di questa terra e complessa, ricca di lotte e di passioni. Qui, a partire dal primo millennio Avanti Cristo, sorsero stati antichi: il regno di Battriana, tra Uzbekistan e Afghanistan, e il popolo dei Sogdiani, che fondarono <strong>Samarcanda</strong>.</p>

<p>La sua bellezza fu esaltata da Alessandro Magno: sinonimo di meraviglia e leggenda, Samarcanda ha forgiato la sua fama come uno dei piu antichi centri urbani del mondo. Fondata oltre 2.500 anni fa, fu la fulgida capitale dell'impero di <strong>Tamerlano</strong>, il condottiero che nel XIV secolo la trasformo in cuore intellettuale, artistico e commerciale dell'Asia Centrale.</p>

<p>Leggenda vuole che Marco Polo resto talmente incantato dai colori e dai tesori di Samarcanda da definirla <em>"la citta piu splendida di tutte le citta"</em>.</p>

<h2>La Grande Via della Seta</h2>

<p>Qui passo la <strong>Grande Via della Seta</strong>: carovaniere commerciali che portavano merci dalla Cina all'Asia del nord. Infiniti conquistatori passarono su queste terre, spazzando via tutto sul loro cammino: dai soldati di Alessandro Magno alle orde di Gengis Khan. Diverse etnie contribuirono alla creazione della cultura originale locale: Kushani e Tocari, Arabi e Persiani, Turchi e Mongoli.</p>

<h2>Arte, cultura e tradizioni</h2>

<p>La cultura del popolo uzbeco e originale e custodisce con cura le tradizioni nazionali. Regal\u00f2 al mondo geniali studiosi, illuministi, poeti: Avicenna e Ulug Beg, Navoi e Biruni. L'architettura, la scienza e la letteratura uzbeche hanno profonde radici storiche.</p>

<p>Fiore all'occhiello e l'artigianato: cesellatura, tessitura di tappeti, incisione su legno, ricamo d'oro e la fabbricazione di stoviglie. Il vestito nazionale uzbeco e la <strong>Tiubeteika</strong>, ricamata d'oro e sete variopinte.</p>

<h3>Un'esperienza che parla al cuore</h3>

<p>Un viaggio in Uzbekistan non e solo una scoperta di citta maestose e architetture senza tempo: e un'immersione profonda in un patrimonio umano vivo, fatto di tradizioni, ospitalita genuina e saperi antichi. Alla sera, seduti attorno al fuoco per una cena tipica, tra suoni di strumenti tradizionali e racconti tramandati da generazioni, un cielo stellato limpido fara da cornice ad un'esperienza indimenticabile.</p>`,
  },
  {
    slug: "cappadocia-tra-rocce-mozzafiato-e-viaggi-nel-tempo",
    unsplashUrl: "https://images.unsplash.com/photo-1669111957528-6d4e78328692",
    excerpt: "La Cappadocia, terra dei cavalli belli: un viaggio tra formazioni rocciose surreali, citta sotterranee millenarie, chiese rupestri e voli in mongolfiera all'alba. Un luogo unico al mondo nel cuore della Turchia.",
    content: `<p>Situata nella regione centrale della Turchia, la <strong>Cappadocia</strong> e un luogo magico e misterioso che attrae visitatori da tutto il mondo. L'origine del nome si pensa derivi dal termine persiano <em>"Katpatuka"</em>, che significa <strong>"terra dei cavalli belli"</strong>.</p>

<h2>Un paesaggio scolpito dal tempo</h2>

<p>Caratterizzata da formazioni rocciose uniche al mondo, testimonianze dell'attivita vulcanica che si e verificata in questa zona circa 60 milioni di anni fa, la Cappadocia e famosa per le sue <strong>Ciminiere di Fata</strong>: alti pilastri di roccia a forma di cono, erosi nel tempo dal vento e dall'acqua, che raggiungono anche 30 metri di altezza.</p>

<p>Il territorio ospita numerose valli e canyon, tra cui le famose <em>Valli Rossa e Rosa</em>, formati dall'erosione dell'acqua mentre fiumi e torrenti tagliavano la morbida roccia vulcanica.</p>

<h2>Millenni di storia tra le rocce</h2>

<p>La Cappadocia fu centro dell'impero ittita e successivamente dei regni frigio, assiro e persiano. Conquistata dai Greci sotto Alessandro Magno, divenne poi importante provincia romana (17 a.C.) e bizantina. Fu saccheggiata dagli Arabi tra il VII e il X secolo, conquistata dai <strong>Turchi selgiuchidi</strong> nel 1175 e infine assorbita dagli Ottomani dalla seconda meta del XV secolo.</p>

<p>Durante il periodo bizantino, la regione divenne un importante centro religioso, con la costruzione di numerose chiese rupestri decorate con affreschi e mosaici.</p>

<h2>Citta sotterranee: il mondo nascosto</h2>

<p>La Cappadocia e famosa per le sue <strong>citta sotterranee</strong>, scavate nel tenero tufo dagli antichi Ittiti e successivamente utilizzate dai primi cristiani come rifugio. La piu impressionante e <strong>Derinkuyu</strong>, che si immerge attraverso grandi pozzi di circa 45 metri nelle formazioni ignimbritiche sotto il piano della citta.</p>

<p>Come un iceberg di pietra, la parte sotterranea e da sei a dieci volte piu profonda dell'altezza degli edifici in superficie dell'antica Malakopea, oggi conosciuta come <em>"Pozzo profondo"</em>.</p>

<h2>Goreme e la Via della Seta</h2>

<p>Perdersi tra le chiese rupestri, camminando tra gli spazi aperti e gli stretti cunicoli, e una delle cose piu belle da fare nella <strong>Valle di Goreme</strong>, museo a cielo aperto. Oppure ammirare il paesaggio dall'alto con un emozionante volo in mongolfiera all'alba.</p>

<p>La Cappadocia faceva parte della <strong>Via della Seta</strong>, l'antica rete di rotte commerciali che collegava l'Oriente e l'Occidente, e le sue citta fiorirono come importanti centri commerciali.</p>

<h3>Un viaggio nel cuore della storia</h3>

<p>Un viaggio in Cappadocia e un percorso dove intrecciarsi e perdersi nella storia di antichi popoli, di storie millenarie. Puoi assorbirle solo calpestando questa terra, respirando gli odori e ascoltando gli echi che hanno attraversato i secoli fino ad arrivare a noi, viaggiatori assetati di bellezza.</p>`,
  },
  {
    slug: "petra-una-luce-tra-kanyon-color-rosa",
    unsplashUrl: "https://images.unsplash.com/photo-1551171129-8ce1ebb911b3",
    excerpt: "Petra, la citta scavata nella roccia rosa della Giordania: una delle sette meraviglie del mondo e Patrimonio UNESCO. Dai Nabatei ai Romani, un viaggio tra storia, mito e la magia del Siq al tramonto.",
    content: `<p><strong>Petra</strong>, la citta scavata nella roccia, un luogo magico e sublime nel bel mezzo del deserto della Giordania. Una delle <strong>sette meraviglie del mondo</strong> e Patrimonio UNESCO dal 6 dicembre 1985.</p>

<h2>Le origini: dagli Edomiti ai Nabatei</h2>

<p>Citata nei manoscritti di Qumran con il nome semitico di <em>Reqem</em> (La Variopinta), la citta fu fondata dagli <strong>Edomiti</strong>, che si insediarono nella regione tra l'VIII e il VII secolo a.C. Nella Bibbia si racconta che ostacolarono il passaggio di Mose e degli Israeliti durante l'Esodo.</p>

<p>In seguito divenne capitale del <strong>Regno dei Nabatei</strong>, stanziatisi nella regione intorno al VI secolo a.C., trasformandola in un florido centro commerciale in contatto con le popolazioni vicine. Attraverso le varie conquiste di Assiri, Persiani e Macedoni, la citta perse gradualmente la sua importanza commerciale, specialmente quando la nuova capitale del Regno Nabateo divenne Palmira.</p>

<h2>Dall'Impero Romano all'oblio</h2>

<p>Dopo la caduta dell'Impero Romano d'Occidente, Petra rimase nell'orbita dell'Impero d'Oriente e fu poi travolta dalla <strong>Conquista Islamica</strong> tra il V e il VI secolo. A seguito di varie catastrofi naturali, la citta comincio ad essere abbandonata a partire dal VII secolo, fino a ridursi a semplici cunicoli che i beduini usavano come rifugio.</p>

<h2>Un paesaggio unico al mondo</h2>

<p>L'area monumentale di Petra e inserita nel margine sinistro della <strong>Rift Valley</strong>, nella Giordania centro-meridionale. Sull'intera valle vi e una presenza ininterrotta di tracce umane a partire dal X-VIII millennio a.C.: primi insediamenti preistorici, periodo edomita, le monumentali tombe nabatee, fino al periodo romano (conquista nel 106 d.C. sotto l'imperatore Traiano), bizantino e medievale.</p>

<p>La parte piu conosciuta e rappresentata da una serie di <strong>tombe e templi</strong> risalenti ad epoca nabatea, le cui strutture architettoniche sono state realizzate scolpendo direttamente le pareti rocciose di arenaria: facilmente modellabili in antico, ma soggette a continua erosione nel corso dei secoli.</p>

<h3>La magia del Siq</h3>

<p><em>"C'e una magia nella luce che filtra dall'alto tra le rocce del Siq, che nessuna immagine e nessun racconto potra mai spiegare."</em></p>

<p>Petra e un luogo che testimonia le memorie della Terra e l'anima segreta della pietra. Le rocce color rosa hanno permesso a questa citta di diventare una delle piu grandi citta carovaniere del Vicino Oriente antico \u2014 un'esperienza che va vissuta in prima persona.</p>`,
  },
  {
    slug: "antica-troia-tra-mito-ed-archeologia",
    unsplashUrl: "https://images.unsplash.com/photo-1592356483175-5ed72a5e1443",
    excerpt: "Tra mito e archeologia, Troia e molto piu di una leggenda. Dalla scoperta di Schliemann al Tesoro di Priamo, dalla guerra raccontata da Omero al sito UNESCO: un viaggio affascinante nel cuore della storia.",
    content: `<p><em>"Cantami, o Musa, del Pelide Achille l'ira funesta, che infiniti lutti addusse agli Achei\u2026"</em><br>
<strong>Omero, Iliade</strong></p>

<p>Immaginiamo una citta inespugnabile, che svetta imponente con le sue forti mura sopra una collina. All'orizzonte, sul mare cristallino, centinaia di navi dilagano tra le strie della candida spuma. E sulla spiaggia, tende, fuochi, guerrieri di bronzo che brandiscono armi invincibili. <strong>Siamo a Troia</strong>, teatro della madre di tutte le guerre.</p>

<h2>La scoperta di Schliemann</h2>

<p>Il sito archeologico di Troia fu scoperto nel 1868 da <strong>Heinrich Schliemann</strong>, uno dei padri dell'archeologia, guidato dal suo intuito e con l'Iliade di Omero in mano. Nella collina di <strong>Hisarlik</strong> ("il luogo della fortezza"), nell'attuale Turchia nord-occidentale, individuo le tracce sovrapposte di dieci citta costruite una sull'altra.</p>

<p>Gli strati piu antichi \u2014 oggi chiamati Troia I e II \u2014 rivelano i segni di una civilta che gia tremila anni prima di Cristo padroneggiava tecniche, simboli e architetture complesse.</p>

<h2>Il Tesoro di Priamo</h2>

<p>Uno dei ritrovamenti piu celebri di Schliemann fu il cosiddetto <strong>"Tesoro di Priamo"</strong>, una collezione di gioielli e oggetti d'oro rinvenuti nel livello di Troia II. Questi reperti, che Schliemann attribui erroneamente al leggendario re Priamo, divennero simbolo del ricco patrimonio di Troia e suscitarono l'interesse del mondo intero.</p>

<h2>La guerra di Troia: mito e storia</h2>

<p>Una delle leggende piu celebri e quella del rapimento di <strong>Elena</strong> da parte di Paride, principe di Troia. Secondo la mitologia, Paride scelse Elena come la piu bella tra le dee, offrendole la mela d'oro. Questo atto scateno l'ira degli dei e provoco la guerra che avrebbe distrutto Troia.</p>

<p>All'origine della guerra vi fu il rapimento della bellissima Elena, moglie di <strong>Menelao</strong>, re di Sparta e fratello di Agamennone, sovrano di Micene. Fu quest'ultimo a guidare la spedizione degli Achei contro Troia.</p>

<p>La guerra duro ben <strong>dieci anni</strong>, e molti eroi vi trovarono la morte: i piu famosi il troiano Ettore e l'acheo Achille.</p>

<h2>Il Cavallo di Troia</h2>

<p>Infine <strong>Ulisse</strong> fece costruire un grande cavallo di legno, nascondendo al suo interno un gruppo di soldati. I Troiani, pensando fosse un dono agli dei, lo portarono in citta. Di notte gli Achei uscirono dal cavallo e aprirono le porte ai compagni: Troia fu incendiata e i suoi abitanti uccisi o ridotti in schiavitu.</p>

<h3>Oltre il mito</h3>

<p>Troia non e solo leggenda, bens\u00ec crocevia per popoli, culture e religioni: una citta da sempre situata in posizione strategica a cavallo tra l'<strong>Anatolia</strong> e il mondo mediterraneo. Grazie alla sua importanza strategica, ha svolto da sempre un ruolo vitale di collegamento tra Oriente e Occidente. Troia e una domanda che si traduce in un viaggio affascinante nel cuore della storia.</p>`,
  },
  {
    slug: "in-viaggio-tra-le-polis-dellantica-grecia",
    unsplashUrl: "https://images.unsplash.com/photo-1770352218371-490bda6f9f47",
    excerpt: "Un viaggio nell'antica Grecia, tra le polis che hanno dato vita alla democrazia, alla filosofia e alla civilta occidentale. Da Atene a Sparta, dall'Acropoli all'agora: le citta-stato che hanno cambiato il mondo.",
    content: `<p>In Grecia intorno all'VIII secolo a.C. nascono molti piccoli stati autonomi chiamati <strong>poleis</strong>. La polis e una citta-stato: nasce quando alcuni villaggi si uniscono per difendersi dai nemici, migliorare l'economia e amministrare la giustizia.</p>

<h2>Cos'era una Polis?</h2>

<p>Ogni polis aveva un suo territorio delimitato, proprie leggi e un particolare stile di vita. Tutte le poleis avevano pero in comune la lingua e la religione. Quasi tutte erano piccole, perche il territorio greco e montuoso e con ristrette pianure.</p>

<p>Ogni citta-stato aveva due parti fondamentali: l'<strong>Acropoli</strong>, la citta alta sulla collina dove si trovavano il governo, i templi religiosi e spesso i guerrieri; e l'<strong>Agora</strong>, la citta bassa con la piazza del mercato dove si riuniva l'assemblea popolare per discutere i problemi della citta.</p>

<h2>Oltre mille citta-stato</h2>

<p>Si calcola che ci fossero oltre 1.000 poleis nel mondo greco. Le piu importanti furono <strong>Atene, Sparta, Corinto, Tebe, Siracusa, Rodi, Argo</strong> ed <strong>Eretria</strong>.</p>

<p>La piu estesa fu Sparta che, con i suoi circa 8.500 km di territorio, costituiva un'eccezione rispetto alla maggior parte delle poleis di assai piu modesta grandezza. Altre poleis come Atene, Rodi e Siracusa possedevano importanti flotte navali, che permettevano loro di controllare ampi tratti di mare e territori insulari nell'Egeo.</p>

<h2>Atene: la regina delle Polis</h2>

<p><strong>Atene</strong> nasce come piccolo centro rurale, controllato da signori locali e abitato principalmente da contadini. Le forme di governo iniziali erano la tirannide e l'oligarchia.</p>

<p>Con lo sviluppo territoriale della citta si formarono nuove classi sociali \u2014 artigiani e commercianti \u2014 che producendo ricchezza rivendicarono una maggiore partecipazione alla vita politica. Dal confronto tra i diversi gruppi sociali prese avvio un processo di riforme di stampo democratico.</p>

<h2>La nascita della Democrazia</h2>

<p>Con il termine <strong>"democrazia"</strong> ci si riferisce a una forma di governo in cui il potere e nelle mani del popolo. Nell'antica Grecia il concetto di <em>demos</em> si riferiva esclusivamente alla popolazione che godeva di diritti civili e politici: erano escluse le donne, gli stranieri e gli schiavi.</p>

<p>La democrazia ateniese inauguro anche una politica imperiale, con l'intenzione di affermare il predominio della polis sugli altri stati della Grecia. Ammirati dai posteri per intelligenza e cultura, gli Ateniesi furono anche odiati dalle altre realta statuali greche costrette a subirne i soprusi.</p>

<h3>Un'eredita che vive ancora oggi</h3>

<p>Le poleis greche non furono solo citta: furono <strong>laboratori di civilta</strong>. La democrazia, la filosofia, il teatro, l'architettura: tutto nacque tra le colonne dell'Acropoli e le piazze dell'Agora. Un viaggio in Grecia e un viaggio alle radici stesse della nostra cultura.</p>`,
  },
];

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("=== Updating blog posts with Unsplash covers and cleaned content ===\n");

  for (const update of updates) {
    console.log(`\nProcessing: ${update.slug}`);

    // 1. Upload Unsplash image
    const coverUrl = await uploadUnsplashImage(update.unsplashUrl, update.slug);

    // 2. Update blog post
    const { error } = await supabase
      .from("blog_posts")
      .update({
        cover_image_url: coverUrl,
        excerpt: update.excerpt,
        content: update.content,
      })
      .eq("slug", update.slug);

    if (error) {
      console.error(`  ERROR updating ${update.slug}: ${error.message}`);
    } else {
      console.log(`  Updated successfully!`);
    }
  }

  console.log("\n=== All blog posts updated! ===");
}

main().catch(console.error);
