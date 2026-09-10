/*
 * Content model for the influence operations section (pp. 41 to 80) of
 * Anthropic, "Detecting and countering misuse of AI: September 2026".
 *
 * Text is condensed and paraphrased from the report. Every item carries the
 * page it comes from ("p") so readers can verify it against the source.
 * Short phrases in curly quotes are the threat actors' own words as quoted
 * in the report.
 */
window.IO_DATA = {
  meta: {
    title: "Influence operations",
    report: "Detecting and countering misuse of AI: September 2026",
    publisher: "Anthropic Threat Intelligence",
    published: "September 10, 2026",
    period: "December 2025 to August 2026",
    pages: [41, 80],
    url: "https://www-cdn.anthropic.com/e50be2e51e7695dc4b1366a37a245a597377d3b5/Anthropic-Detecting-and-countering-091026.pdf",
    localPdf: "../report/Anthropic-Detecting-and-countering-091026.pdf",
  },

  framing: {
    definition: {
      p: 41,
      text:
        "Efforts to manipulate the information environment, including political, civic and public discourse, in order to deceive, distort or covertly shape what people perceive, believe or do, usually while hiding who is behind the activity or how it is coordinated.",
    },
    scope: {
      p: 41,
      text:
        "Nine disrupted cases. They originated in Russia, Iran, Turkey, the Gulf, South Asia, Africa and Europe and targeted audiences on six continents. Operators ranged from governments, state propaganda institutions and state media to private firms selling influence, domestic political operators and an opposition movement in exile.",
    },
    elections: {
      p: 41,
      text:
        "Several campaigns were timed to national votes: Russian state media produced fabricated claims about Moldova’s president before the September 2025 election, and a pro-government operator in Kenya prepared fake grassroots posts ahead of the 2027 general election.",
    },
    investigation: [
      {
        t: "Visibility during the build",
        d: "Platforms usually see an operation once content is circulating. On Claude, planning, targeting and drafting can be visible while the operation is still being assembled, which often allows disruption before launch.",
        p: 42,
      },
      {
        t: "Verification after release",
        d: "Once content leaves the platform, findings are checked against open-source research, cross-platform industry data and public reporting.",
        p: 42,
      },
      {
        t: "Ban, attribute, harden",
        d: "Accounts are banned, activity is attributed to the organization behind it, and new tactics are fed back into detection systems.",
        p: 42,
      },
    ],
  },

  /* Brookings Breakout Scale (Nimmo, 2020). Descriptions summarize the
     original framework; the report itself describes only Category One. */
  breakout: [
    { n: 1, t: "One platform, one community", d: "Content stays inside a single community on a single platform." },
    { n: 2, t: "Limited spread", d: "Content spreads across several communities on one platform, or across several platforms within one community." },
    { n: 3, t: "Multiple platforms and communities", d: "Content is present on several platforms and reaches several communities." },
    { n: 4, t: "Cross-medium breakout", d: "Content breaks out of social media and is carried by mainstream media or other channels such as broadcast." },
    { n: 5, t: "Celebrity amplification", d: "Content is amplified by high-profile figures such as celebrities or political leaders." },
    { n: 6, t: "Policy response or call for violence", d: "Content triggers a policy response or other concrete action, or carries a call for violence." },
  ],

  groups: [
    {
      id: "state",
      label: "State and state-aligned",
      short: "State",
      desc: "Operations run by, or on behalf of, governments, state propaganda institutions and state media.",
    },
    {
      id: "commercial",
      label: "Influence for hire",
      short: "Commercial",
      desc: "Private firms selling influence as a service, giving the paying client plausible deniability.",
    },
    {
      id: "domestic",
      label: "Domestic and opposition operators",
      short: "Domestic / opposition",
      desc: "Politically motivated operators working for or against a party at home, or campaigning from exile.",
    },
  ],

  trends: [
    {
      id: "t-service",
      t: "Influence sold as a service",
      d: "Commercial actors produce content for whoever pays, giving the real commissioner plausible deniability and putting the capability within reach of clients who cannot or will not build it. In two cases a working advertising or marketing firm ran the operation alongside ordinary commercial work.",
      p: 42,
      cases: ["GTG-54002", "GTG-84005", "GTG-54004"],
    },
    {
      id: "t-newsdesk",
      t: "AI as a newsdesk",
      d: "Claude was slotted into human-edited pipelines that were already running, acting as sub-editor or content creator and letting low-resourced actors operate far beyond their own capacity.",
      p: 42,
      cases: ["GTG-24015", "GTG-04001", "GTG-54002", "GTG-54006"],
    },
    {
      id: "t-apparatus",
      t: "Building the apparatus, not only the content",
      d: "Actors had the model draft doctrine manuals, opposition dossiers, ministerial portfolios, persona systems, target databases, loyalty clauses in employment contracts and staff scoring rubrics: work that would otherwise need a staffed program office.",
      p: 42,
      cases: ["GTG-34001", "GTG-04001", "GTG-84005", "GTG-84002"],
    },
    {
      id: "t-tooling",
      t: "Complex tool use",
      d: "Doctrine files reused almost verbatim across hundreds of sessions, banned-word lists inside agents, shared files of approved sources and evasion rules, and custom software calling Claude in fixed batches. Operations increasingly live in persistent memory files rather than individual prompts; one actor was building a course to teach the workflow.",
      p: 43,
      cases: ["GTG-84002", "GTG-84006", "GTG-54006", "GTG-84005"],
    },
    {
      id: "t-laundering",
      t: "Laundering attribution, sourcing and certainty",
      d: "State or commissioned narratives were engineered to look independent: state attribution stripped from republished material, claims passed through chains of outlets to look independently confirmed. In one case tied to a Russian state media operation, the actor told the model to drop its own ‘unverified’ caveats and present everything as confirmed.",
      p: 43,
      cases: ["GTG-24015", "GTG-84005", "GTG-34001", "GTG-84002"],
    },
    {
      id: "t-opsec",
      t: "Increased operational security",
      d: "Actors asked for text that sounds organic and lacks the marks of automation, built account warm-up and evasion logic, removed metadata and codenames, and reached Claude through VPNs, foreign phone numbers, rotated accounts and IP-masking services.",
      p: 43,
      cases: ["GTG-04001", "GTG-34001", "GTG-54006", "GTG-84005"],
    },
    {
      id: "t-personas",
      t: "Fake personas and impersonation",
      d: "AI-generated profile photos, invented reporter biographies and fabricated spokespeople, alongside impersonation of real people and institutions, including a state spokesperson and a human rights organization, and forged government documents.",
      p: 43,
      cases: ["GTG-54002", "GTG-84006", "GTG-34001", "GTG-84002", "GTG-04001"],
    },
    {
      id: "t-targeting",
      t: "Targeting people and accountability mechanisms",
      d: "A cloned activist account held live conversations with contacts inside Iran, arrest-history profiles were built on other Iranians, testimony was ghost-written for a live UN Human Rights Council session, and counter-dossiers were compiled on UN Special Rapporteurs.",
      p: 43,
      cases: ["GTG-84006", "GTG-84002", "GTG-04001", "GTG-84005"],
    },
    {
      id: "t-reach",
      t: "Most operations fail to reach a real audience",
      d: "Because detection happens at the production stage, several operations were stopped before building an audience, and most content drew little authentic engagement. The widest authentic reach came where state media did the distributing: FM radio, satellite and shortwave radio, and global television.",
      p: 43,
      cases: ["GTG-24015", "GTG-04001", "GTG-84006", "GTG-54002", "GTG-54004"],
    },
  ],

  cases: [
    /* ------------------------------------------------------------------ */
    {
      id: "GTG-04001",
      group: "state",
      short: "CAR radio pipeline",
      title: "Russian information manipulation operation in the Central African Republic",
      origin: "Russia (run from Bangui)",
      iso: "RU",
      target: "Central African Republic",
      region: "Africa",
      pages: [44, 47],
      breakout: { n: 4, why: "Broadcast daily on Radio Lengo Songo (98.9 FM), amplified through Telegram and carried by local outlets.", p: 45 },
      attribution: "Russian state-directed covert operation. The actor is assessed as the local media coordinator for Politology, the Africa Corps/Wagner influence branch assessed to have come under Russian Foreign Intelligence Service (SVR) control in late 2023.",
      summary:
        "A Russian-speaking actor in Bangui used one Claude account as the production backbone of a state-aligned operation aimed at the Central African Republic. Content ran daily through Radio Lengo Songo, a station the All Eyes On Wagner project reports Wagner created and funded in 2017, and was routed toward the national broadcaster by trading airtime for places on SputnikPro, Rossiya Segodnya’s training program for foreign journalists.",
      metrics: [
        { v: "98.9 FM", l: "daily broadcast channel" },
        { v: "8", l: "organizational nodes mapped" },
        { v: "1", l: "account removed" },
      ],
      network: {
        title: "Organizational nodes",
        cols: ["Entity", "Role in the operation"],
        rows: [
          ["Radio Lengo Songo / SARL Media International (98.9 FM)", "Primary hub with a pro-Russian editorial line; its HR infrastructure encodes political compliance."],
          ["Russian House / Rossotrudnichestvo, Bangui", "State cultural node and coordination point (Dmitri Sytyi)."],
          ["Sputnik Afrique / Rossiya Segodnya", "State media content supplier; partnership and barter of training for airtime."],
          ["RT, TASS", "International amplification and coordination of minister interviews."],
          ["Africa Corps / Wagner", "Security principal promoted by the operation; insider operational data accessed."],
          ["Telegram: СОМБ («Туристы в Африке»), «Залечь на дне в Банги»", "Military promotion channel and a pro-Russian local-voice channel, both style-cloned."],
          ["Radio Centrafrique", "National broadcaster targeted as the downstream laundering endpoint."],
          ["Ndjoni Sango, Pravda RCA", "Aligned local outlets used as sanctioned sources."],
        ],
        p: 46,
      },
      use: [
        { t: "Daily newsroom output", d: "The actor supplied topics and talking points; Claude turned them into briefings, scripts, graphics and posts with pro-Russia, anti-France messaging embedded. Some were prepared for the Presidency’s spokesperson and the Russian House director.", p: 45 },
        { t: "Removing AI tells", d: "The actor pushed the model to drop typical formatting habits so the news feeds would not read as machine-written.", p: 44 },
        { t: "Staff management and loyalty", d: "Contracts requiring loyalty to the CAR President and “Russia and its contingent”, job descriptions, scoring rubrics and a three-strike dismissal process. Staff articles were scored and Claude was asked who to keep and who to fire.", p: 45 },
        { t: "Political control tasks", d: "Recurring tracking of CAR opposition figures, talking points for Russian House spokespeople, and forged Gendarmerie and Ministry of Defense documents built from original design files.", p: 45 },
        { t: "Voice cloning of channels", d: "Pro-Russian Telegram channels were exported for stylistic voice analysis, cloning and distribution.", p: 46 },
        { t: "Planning done offline", d: "Reused templates and standing instructions show most of the planning happened before any prompt reached Claude.", p: 45 },
      ],
      findings: [
        { t: "Foreign-run, built to look local", d: "Contracts, scripts and posts presented the output as the work of a Central African radio station while a Russian-speaking actor directed it.", p: 45 },
        { t: "Narrative mix", d: "Most sampled activity was pro-CAR government, pro-Wagner, anti-France and anti-opposition.", p: 44 },
        { t: "Path to the national broadcaster", d: "Content was channelled through the Wagner-funded station and onward to Radio Centrafrique, so official Russian material reached listeners as ordinary national programming.", p: 44 },
      ],
      safeguards: [
        { t: "Refusal: naming people as militants", d: "Claude refused the most aggressive request, naming real individuals as militants to draw security action against them. The actor switched to anonymous-source framing.", p: 45, kind: "refusal" },
        { t: "Evasion: relabeling political scoring", d: "When Claude flagged the political weighting in staff scoring, the actor renamed the criteria in neutral terms and kept scoring.", p: 45, kind: "evasion" },
      ],
      figures: [1],
      detection: {
        found: { t: "Tip from investigators", d: "A tip from INPACT / All Eyes on Wagner started the internal review; their reporting also independently confirmed who was involved.", p: 47 },
        action: { t: "Account and organization removed", d: "The account and the organization behind it were removed, and automated detections were built on its behavioral signatures.", p: 47 },
      },
    },

    /* ------------------------------------------------------------------ */
    {
      id: "GTG-54002",
      group: "commercial",
      short: "Six-continent fake news network",
      title: "Commercial influence-as-a-service operation spanning six continents",
      origin: "France (LKM Company)",
      iso: "FR",
      target: "Global; focus on the United States, Brazil, France and the DRC",
      region: "Global",
      pages: [47, 53],
      breakout: { n: 2, why: "Distributed across the network’s own websites and matching social accounts, with no evidence of breakout.", p: 48 },
      attribution: "Traced to LKM Company, a France-based digital advertising agency. Signals point to one or more customers with a stake in the DRC-Rwanda conflict; no evidence of government direction.",
      summary:
        "One account used Claude to mass-produce and rewrite political news for roughly 70 fabricated news sites, each paired with an X account and backed by more than 250 inauthentic commenting accounts. The sites posed as independent local newsrooms, but the network changed political sides depending on who was paying, the hallmark of influence for hire.",
      metrics: [
        { v: "~70", l: "fabricated news sites" },
        { v: "8,913+", l: "articles in ~20 languages" },
        { v: "250+", l: "inauthentic commenting accounts" },
        { v: "318", l: "articles on the DRC" },
      ],
      network: {
        title: "Sample fabricated outlets",
        cols: ["Outlet", "Domain (defanged)", "X account"],
        rows: [
          ["Naija Pulse", "naijapulse[.]org", "@Naijapulse_"],
          ["Axum Voices", "axumvoices[.]org", "@AxumVoices"],
          ["Jambo Journal", "jambojournal[.]org", "@journaljambo"],
          ["Zion Pulse", "zion-pulse[.]com", "@zionpulse"],
          ["Al Watan Al Akbar", "alwatanalakbar[.]com", "@saudinews966"],
          ["Echo Berlin", "echoberlin[.]info", "@berlin_echo"],
          ["The British Daily", "british-daily[.]com", "@britishdaily_"],
          ["Russian Way", "russianway[.]info", "@RussianWayMedia"],
          ["Pak Sarzameen", "pakssarzameen[.]org", "@PSarzameeninfo"],
          ["Voice of the Rejuvenation", "voiceoftherejuvenation[.]com", "@fuxingmedia"],
          ["El Pulso Popular", "elpulsopopular[.]com", "@elpulsopopular"],
          ["Fifty States", "fiftystates[.]news", "@Fiftystatesnews"],
          ["Civic Pulse", "civicpulse[.]info", "@Civicpulsemedia"],
          ["Commonwealth Post", "commonwealth-post[.]com", "@cmwthpost"],
        ],
        p: 52,
      },
      use: [
        { t: "Original and rewritten articles", d: "Claude wrote original articles for the fake outlets and rewrote real journalism into politically slanted versions tailored to each national audience.", p: 48 },
        { t: "Standardized content pipeline", d: "Every prompt demanded a fixed JSON structure, formatted HTML, exact character limits and three to four internal links, so articles could be generated and published automatically and lift search rankings.", p: 48 },
        { t: "Three manipulation tactics", d: "The same story rewritten in opposite ideological directions, political angles added to neutral stories, and stories laundered across borders stripped of their context.", p: 49 },
        { t: "Invented bylines", d: "Articles were signed with names of journalists who do not exist, giving each site the look of a staffed local newsroom.", p: 49 },
      ],
      findings: [
        { t: "Contested democracies targeted", d: "Focus on the United States, Brazil, France and the Democratic Republic of Congo; the spread of targets shows no single political agenda.", p: 48 },
        { t: "Heavy DRC focus", d: "318 articles, mostly backing the DRC government on mineral deals and tensions with Rwanda. Early on, most fake followers were tied to the DRC and the DRC page was the network’s most shared account.", p: 50 },
        { t: "Coordination caught in minutes", d: "On September 11, 2025, the sites published near-identical DRC-Rwanda articles within three minutes of each other, each re-toned for a regional audience.", p: 49 },
        { t: "Infrastructure in one burst", d: "Domains were registered from France within a ten-week window in mid-2025 and hosted behind a single deployment, linking about 70 seemingly independent sites to one operator account. Most amplifier accounts were created in June and July 2025.", p: 48 },
      ],
      safeguards: [],
      figures: [2, 3, 4, 5],
      detection: {
        found: { t: "Regional investigations", d: "Identified through ongoing investigations into influence operations in the region, and disrupted before it could build an authentic audience.", p: 52 },
        action: { t: "Banned and indicators shared", d: "The account and associated organization were banned, new detections target the behavioral signatures, and the shared deployment identifier plus a sample of the 70 outlets were published for industry partners.", p: 52 },
      },
    },

    /* ------------------------------------------------------------------ */
    {
      id: "GTG-84005",
      group: "commercial",
      short: "Malaysia election platform",
      title: "Commercial election-manipulation platform targeting Malaysia",
      origin: "Turkey (BBS Bilisim Teknolojileri, Istanbul)",
      iso: "TR",
      target: "Malaysia",
      region: "Asia",
      pages: [53, 58],
      breakout: { n: 2, why: "Assets distributed across multiple platforms, without evidence of breakout into authentic communities.", p: 54 },
      attribution: "Clear links to BBS Bilisim Teknolojileri, an Istanbul-based technology company that sold access to the platform as paid influence as a service.",
      summary:
        "Presented as a defensive cyber intelligence and counter-disinformation tool, this platform was sold as a “military-grade, AI-driven, real-time political operations ecosystem”. Built with Claude, it profiled Malaysian voters constituency by constituency, ran about a thousand fake X accounts and a synthetic outlet called Malaysia Pulse, and produced fabricated dossiers against an opposition politician and civil society organizations.",
      metrics: [
        { v: "~1,000", l: "fake X accounts" },
        { v: "222", l: "constituencies profiled" },
        { v: "1M", l: "artificial views requested for one account" },
      ],
      network: {
        title: "Operation clusters",
        cols: ["Cluster", "What Claude was used for", "Most serious element"],
        rows: [
          ["Voter-targeting system", "Constituency profiles built on real census and voter data", "Micro-targeting on race, religion and royalty faultlines"],
          ["Fake-account network", "Roughly 1,000 accounts with warm-up and evasion logic", "Near-identical posting and artificial engagement on a head of government"],
          ["Synthetic news outlet", "AI rewriting pipeline and fabricated bylines", "Laundering Russian and Chinese state media as independent reporting"],
          ["Fabricated dossiers", "Fake intelligence reports given false authority", "Manufacturing false allegations against named people"],
          ["Encrypted messenger", "Operational security communications", "Purpose-built operational security for the operation"],
        ],
        p: 55,
      },
      use: [
        { t: "Dashboards built with Claude Code", d: "Custom dashboards to manage, run and track the fake-account networks, logging likes and views per target. Self-reported figures for one senior official’s account ran into the millions and cannot be verified.", p: 54 },
        { t: "Constituency targeting", d: "A targeting system built on real census and electoral data covering every parliamentary constituency.", p: 55 },
        { t: "Account warm-up and evasion", d: "Each account had warm-up logic to look real before deployment, including regular cookie and IP renewal to evade platform detection.", p: 54 },
        { t: "Rewrite and launder pipeline", d: "Legitimate Malaysian reporting was scraped, rewritten several times and republished under fake bylines. Articles from TV BRICS, Xinhua, Sputnik/RIA and CGTN were republished with state attribution removed.", p: 55 },
        { t: "Dossier iteration", d: "Claude was used to iterate the fabricated intelligence dossiers.", p: 55 },
      ],
      findings: [
        { t: "Race, religion and royalty", d: "Real census and electoral data and millions of voter records were used to target the most sensitive faultlines in all 222 parliamentary constituencies.", p: 54 },
        { t: "Views on demand", d: "A dashboard parameter set how many artificial views each target should receive; one request sought a million artificial views for the sitting Prime Minister’s account.", p: 54 },
        { t: "Allegations with no basis", d: "The model’s own research found no corroboration for allegations generated against named individuals.", p: 54 },
        { t: "Pitch to the regulator", d: "The actor pursued a contract with Malaysia’s national communications regulator. There is no evidence it succeeded.", p: 55 },
      ],
      safeguards: [
        { t: "Refusal: defamation dossier", d: "Claude refused or partially refused at several points, including after identifying a fabricated dossier as political defamation, and balked at language that explicitly evoked a psychological operation.", p: 57, kind: "refusal" },
        { t: "Evasion: sanitized wording", d: "After refusals, the actor negotiated sanitized wording to keep building toward the same capability.", p: 55, kind: "evasion" },
      ],
      figures: [6, 7, 8],
      detection: {
        found: { t: "Internal detections", d: "Found through internal detections; recovered indicators were used to map the full footprint.", p: 57 },
        action: { t: "Disrupted and indicators published", d: "Indicators include actor domains, six Hetzner IP addresses, a code repository and example sockpuppet accounts.", p: 57 },
      },
      indicators: {
        cols: ["Indicator", "Type", "Note"],
        rows: [
          ["malaysiapulse[.]com; bbsteknoloji[.]com", "Domains", "News front and company"],
          ["23.88.118[.]216; 91.99.117[.]166; 157.180.93[.]7; 167.235.157[.]100; 46.62.214[.]3; 46.225.91[.]180", "IPs (Hetzner)", "Panel, news site, renderer and supporting services"],
          ["github[.]com/bbsbilisimteknolojileri-cell", "Code", "Organization repository and developer handle"],
          ["@armsam1209, @kioskou, @Chikmore, @avihoue, @goldsteve1, @adriansantodo, @bmmyangels, @telkisoszoba, @SHIHAN1947, @garyponce, @hugolaurent, @exceiivier", "Sockpuppets", "Twelve accounts sharing one creation timestamp (May 17, 2026)"],
          ["@malaysiapulseof", "Channel", "YouTube channel of the synthetic outlet"],
        ],
        p: 57,
      },
    },

    /* ------------------------------------------------------------------ */
    {
      id: "GTG-24015",
      group: "state",
      short: "Russian state-media desks",
      title: "Russian state-media editorial pipelines built on Claude",
      origin: "Russia",
      iso: "RU",
      target: "Moldova, Latin America, Africa and global English audiences",
      region: "Global",
      pages: [58, 62],
      breakout: { n: null, why: "No category assigned in the report. Content reached audiences through state media’s own channels; matched outputs ranged from a Telegram post with about 2,000 views to aired broadcast copy.", p: 58 },
      attribution: "Assessed with high confidence that output was shared with, published and broadcast by Russian state-owned and state-funded media.",
      summary:
        "Four accounts used Claude as an editorial and production desk for Russian state media: Sputnik Moldova and RIA Novosti, Sputnik en Español, Sputnik Africa and RT’s English newsroom. Unlike covert networks that struggle for reach, this output travelled through established outlets, and a chain of outlets made Russian-origin claims look independently reported.",
      metrics: [
        { v: "4", l: "accounts, four pipelines" },
        { v: "5", l: "state outlets reached" },
        { v: "2.09K", l: "views on one matched post" },
      ],
      network: {
        title: "Distribution channels",
        cols: ["Channel", "Audience", "Source material", "Output"],
        rows: [
          ["Sputnik Moldova / RIA Novosti", "Russian-speaking Moldova", "Romanian and Moldovan news, polls, opposition social posts", "Russian-language articles on Sputnik Moldova Telegram and RIA Novosti, amplified cross-platform"],
          ["Sputnik en Español", "Latin America (Spanish)", "Russian milblogger Telegram (Rybar, Colonel Cassad and others)", "Localized Spanish articles plus @ATodaPotencia posts"],
          ["Sputnik Africa", "African publics (English)", "Russian and French wires (RIA Novosti, TASS, Sputnik Afrique)", "X and news posts under a 40-rule house style guide"],
          ["RT English newsroom", "RT global English broadcast", "Russian wires, SVR and Defence Ministry claims", "Character-exact on-air tickers, chyrons and voice-overs"],
        ],
        p: 59,
      },
      use: [
        { t: "Sub-editor inside live pipelines", d: "Claude sat inside running, professionally edited pipelines, taking a single staffer’s output well beyond what they could produce alone.", p: 59 },
        { t: "Moldova desk", d: "Romanian and Moldovan news, polling data and opposition posts turned into Russian-language articles.", p: 59 },
        { t: "Latin America desk", d: "Content pulled from Telegram channels turned into Latin American Spanish articles.", p: 59 },
        { t: "Broadcast copy", d: "Tickers, screen captions, voice-over scripts and short headlines built from Russian newswires, SVR and Defence Ministry inputs.", p: 59 },
      ],
      findings: [
        { t: "Manufactured verification loops", d: "A former Sputnik Moldova editor-in-chief produced articles that were echoed across Russian and Moldovan outlets so they appeared independently confirmed.", p: 59 },
        { t: "Election-eve defamation", d: "The same actor amplified fabricated, defamatory claims about Moldova’s president Maia Sandu ahead of the September 28, 2025 parliamentary election.", p: 59 },
        { t: "Fake-independent Telegram", d: "A contractor with links to Russia fed output to a supposedly independent Telegram channel that reframes Kremlin-aligned narratives as local commentary, under the editorial watch of a Sputnik Mundo presenter and producer.", p: 59 },
        { t: "On air", d: "In at least one confirmed instance, material built with Claude for live broadcast made it onto Russian airwaves.", p: 59 },
        { t: "Exact match in the wild", d: "A Sputnik Africa post on X matched Claude-generated text exactly.", p: 61 },
      ],
      safeguards: [
        { t: "Evasion: concealed identities", d: "The individual actors attempted to conceal their identities; attribution still reached high confidence.", p: 58, kind: "evasion" },
      ],
      figures: [9, 10, 11],
      detection: {
        found: { t: "Internal detections", d: "Identified through internal detections.", p: 62 },
        action: { t: "Four accounts banned", d: "Accounts in all four operations were banned and indicators shared with industry and research partners.", p: 62 },
      },
      indicators: {
        cols: ["Category", "Indicator", "Note"],
        rows: [
          ["State media outlets", "Sputnik Moldova; RIA Novosti; Sputnik en Español; Sputnik Africa (@sputnik_africa); RT English (ANO TV-Novosti)", ""],
          ["Deceptive amplification", "@ATodaPotencia (Telegram)", "Presents Kremlin-aligned content as organic Latin American analysis"],
          ["Moldovan amplification", "eadaily[.]com (EU-sanctioned); point[.]md; vz[.]ru; mos[.]news; ru[.]euronews[.]com", "Domains"],
          ["Source laundering", "Rybar (@rybar_america); Colonel Cassad (@boris_rozhin); @theaterVD; @china3army; @kalashnikovnews", "Russian military propaganda Telegram channels"],
        ],
        p: 62,
      },
    },

    /* ------------------------------------------------------------------ */
    {
      id: "GTG-34001",
      group: "state",
      short: "Iranian soft-war program",
      title: "Iranian state-aligned operations: the ICCO, the Islamic Propaganda Office and the Bina Observatory",
      origin: "Iran",
      iso: "IR",
      target: "Domestic Iranian and international audiences",
      region: "Middle East",
      pages: [62, 67],
      breakout: { n: 3, why: "Multiple platforms, with content observed on IRGC-aligned channels on Eitaa and elsewhere.", p: 63 },
      attribution: "Each account was run within or for a named Iranian state propaganda institution. Actors disclosed locations, institutions and roles in conversation; branded document footers and open sources confirmed the links.",
      summary:
        "Three accounts tied to Iranian state propaganda institutions used Claude to prepare what they called a “soft war” or “cognitive warfare” program: campaign plans, doctrine manuals, persona systems, target databases and ministerial documents. Content was engineered so state narratives read as independent voices; the ICCO actor described their role as “not to be the narrator, but the director”.",
      metrics: [
        { v: "3", l: "state institutions" },
        { v: "100+", l: "channels in paid campaigns" },
        { v: "20", l: "languages planned" },
      ],
      network: {
        title: "Institutions",
        cols: ["Institution", "What Claude produced", "Distribution"],
        rows: [
          ["ICCO / Ministry of Culture and Islamic Guidance", "A ministerial influence portfolio and a Supreme Leader funeral and succession plan", "Cultural attaché network, foreign bylines, social platforms"],
          ["Islamic Propaganda Office of Khorasan Razavi", "“Manjanegh” content-factory doctrine, persona-tailored content and a paid campaign aligned with IRGC narratives", "Eitaa, Bale, Rubika plus X, Instagram, Telegram"],
          ["Islamic Propaganda Organization / Bina Cultural Observatory", "Repackaged IRGC spokesperson communiqués, a serialized war-related campaign and think-tank laundering", "Bina Telegram and Instagram; domestic audiences"],
        ],
        p: 65,
      },
      use: [
        { t: "Doctrine and ideology", d: "Operating manuals, coded project portfolios, persona systems, early-warning protocols and amplification timing schemes.", p: 64 },
        { t: "Bulletins into content", d: "Official intelligence bulletins turned into tailored content in Farsi, Arabic, Urdu, Malay, Spanish and English, with plans for 20 languages.", p: 64 },
        { t: "Attribution laundering", d: "Posts framed as the work of foreign writers or independent outlets, and hashtag campaigns made to look citizen-started.", p: 64 },
        { t: "Distribution", d: "Eitaa, Bale and Rubika at home, plus X, Instagram, Telegram, TikTok, YouTube and the ICCO cultural attaché network.", p: 64 },
      ],
      findings: [
        { t: "Explanatory jihad", d: "All three operations tied their work to the state doctrine of “Jihad al-Tabyin”, under which propaganda is a religious and strategic duty.", p: 63 },
        { t: "Ministerial deliverables", d: "ICCO-branded documents set out a nine-part international influence portfolio and complete plans for the Supreme Leader’s funeral.", p: 63 },
        { t: "Manjanegh (Catapult)", d: "A multi-province content factory using dozens of activists to repackage security services’ reporting under unattributed personas, amplified through paid campaigns on more than 100 channels, including IRGC-tied ones.", p: 64 },
        { t: "Borrowed authority", d: "A Bina official generated messaging in the voice of an IRGC spokesperson and, during the 2026 US-Israel-Iran war, attributed false claims to CSIS, Brookings and RAND.", p: 64 },
        { t: "Minorities and critics targeted", d: "Aggressive counter-narratives against the Bahá’í, and target databases naming international officials and Iranian opposition figures.", p: 64 },
      ],
      safeguards: [
        { t: "Evasion: laundered access", d: "Claude is blocked in Iran, so accounts were registered through VPNs and foreign phone numbers.", p: 63, kind: "evasion" },
        { t: "Self-disclosure", d: "Despite that, actors repeatedly named their locations, institutions and roles in conversation, which, with branded footers, tied each operation to its institution.", p: 63, kind: "note" },
      ],
      figures: [12, 13],
      detection: {
        found: { t: "Internal investigations", d: "Identified through internal investigations.", p: 66 },
        action: { t: "Three accounts banned", d: "Accounts for all three operations were banned and indicators shared with industry and research partners.", p: 66 },
      },
      indicators: {
        cols: ["Category", "Indicator", "Note"],
        rows: [
          ["Attributed institutions", "ICCO and its International Quran and Propagation Center; Islamic Propaganda Office of Khorasan Razavi and the Shahid Hasheminejad Cultural Technology House (Mashhad); Islamic Propaganda Organization and its Bina Cultural Observatory", "Institutions"],
          ["ICCO portfolio", "Project codes A-01 through B-04; ICCO and IQPC document footer; #IranStands hashtag", "Codes, footer, hashtag"],
          ["Mashhad content factory", "Manjanegh (Catapult), Mashe (Trigger), Chashni (Primer); private Eitaa channel “Monjaneq”; paid amplification incl. @hamyane_sepah and @moghavematnews_iran", "Codenames, channels"],
          ["Bina", "IRGC spokesperson impersonation; Bina Monitoring Center Telegram and Instagram channels", "Channels, impersonation"],
        ],
        p: 66,
      },
    },

    /* ------------------------------------------------------------------ */
    {
      id: "GTG-54006",
      group: "domestic",
      short: "Bangladesh fake-news factory",
      title: "Automated pro-Awami League fake news operation targeting rural Bangladesh",
      origin: "Bangladesh (Gaibandha District)",
      iso: "BD",
      target: "Rural Awami League supporters in Bangladesh",
      region: "Asia",
      pages: [67, 70],
      breakout: { n: 3, why: "Videos matching the output appeared on multiple Bangladesh-focused channels across three platforms.", p: 68 },
      attribution: "A single domestic actor. Narratives favored the Awami League, out of power since the July 2024 uprising, but no proof the party directed or funded it.",
      summary:
        "One actor in Gaibandha District rotated through 29 Claude accounts and ran a script, fake_news_3.py, that generated fabricated Bengali news in fixed batches. The output fed Facebook Live, YouTube and TikTok streams aimed at rural, low-literacy Awami League supporters. Internally the actor wrote that “no one knows the news is fake”.",
      metrics: [
        { v: "29", l: "rotated Claude accounts" },
        { v: "1,500+", l: "fabricated headlines" },
        { v: "300", l: "false narratives" },
        { v: "1,500", l: "image prompts" },
      ],
      network: {
        title: "Narrative themes",
        cols: ["Theme", "Technique", "Target"],
        rows: [
          ["Religious extremism framing", "Opposition cast as planning Taliban-style Sharia rule and infiltrating security forces", "Jamaat-e-Islami, BNP, NCP"],
          ["Violence and plots", "Fabricated assassination plots and hit squads", "Interim government, student protest leaders"],
          ["Foreign-agent smears", "Student leaders labelled as foreign intelligence agents", "July protest movement"],
          ["Corruption and conspiracy", "Fabricated corruption and secret cross-party alliance claims", "Opposition parties"],
        ],
        p: 69,
      },
      use: [
        { t: "Batch generation by script", d: "fake_news_3.py called Claude’s API for fixed batches of 15 headlines, 3 detailed fabricated stories and 15 image-generation prompts.", p: 67 },
        { t: "Image prompts sent elsewhere", d: "Claude does not generate images, so the prompts were probably used with other AI models to create visuals.", p: 67 },
        { t: "Semi-autonomous pipeline", d: "Output moved through fixed cloud-storage folders, was converted to audio and video, and a second script queued YouTube uploads months ahead.", p: 69 },
        { t: "Tuned for low literacy", d: "Topics were emotionally charged and written for rural audiences with lower literacy.", p: 68 },
      ],
      findings: [
        { t: "Written to deceive", d: "The actor described the output as fake news that should be “hot and aggressive” and simple enough “so even village people understand”.", p: 68 },
        { t: "One-sided targeting", d: "Uniformly pro-Awami League, attacking the BNP, Jamaat-e-Islami, the National Citizens Committee, the interim government and student leaders as foreign agents or would-be Taliban-style rulers.", p: 68 },
        { t: "Scheduled a month ahead", d: "A separate script bulk-posted videos to YouTube through its API on a schedule set a month in advance via a third-party continuous integration service.", p: 68 },
        { t: "Geopolitical overlap", d: "Some narratives aligned with pro-Indian interests, with no evidence of state direction or funding.", p: 68 },
      ],
      safeguards: [
        { t: "Evasion: 29 rotated accounts", d: "The actor cycled through 29 accounts over roughly sixteen months to evade limits and detection.", p: 70, kind: "evasion" },
        { t: "Evasion: masked IP", d: "Uploads were routed through a third-party CI service to hide the actor’s IP address.", p: 70, kind: "evasion" },
      ],
      figures: [14],
      detection: {
        found: { t: "Internal investigations", d: "Found as part of internal investigations.", p: 69 },
        action: { t: "Banned, detections built", d: "Accounts were banned and behavioral detections built in anticipation of new accounts; indicators went to distribution platforms and partners. A cloud-storage identifier and the uploader script were held for partner sharing.", p: 70 },
      },
    },

    /* ------------------------------------------------------------------ */
    {
      id: "GTG-84006",
      group: "domestic",
      short: "MEK shared-agent network",
      title: "MEK/NCRI-aligned operation using a shared AI agent to impersonate real people and recruit inside Iran",
      origin: "Iranian opposition in exile (MEK/NCRI)",
      iso: "EX",
      target: "Iranians inside the country and in the diaspora",
      region: "Middle East",
      pages: [70, 75],
      breakout: { n: 2, why: "Multiple platforms, distributed through the network’s own NCRI media properties and amplifier accounts.", p: 71 },
      attribution: "Linked to the People’s Mojahedin Organization of Iran (PMOI/MEK) and its political front, the NCRI. At least four individuals work for official NCRI media outlets; central tasking is likely but unverified.",
      summary:
        "A distributed operation ran on a shared Claude-based agent platform called “Viktor”. One workspace cloned a real activist’s Telegram account from about 8,400 of his posts and then held live political conversations with his contacts, who, to Anthropic’s knowledge, did not know an AI-assisted account was talking to them. The network also profiled people inside Iran by arrest history.",
      metrics: [
        { v: "~8,400", l: "posts used to clone an activist" },
        { v: "500+", l: "channels scraped for profiles" },
        { v: "51,944", l: "messages mined for dossiers" },
        { v: "~708K", l: "followers on the origination node" },
      ],
      network: {
        title: "Operation clusters",
        cols: ["Cluster", "What Claude was used for", "Most serious element"],
        rows: [
          ["Shared agent platform (“Viktor”)", "Persistent-memory agents running scheduled production across actors", "Shared doctrine and evasion rules acting as a coordination layer"],
          ["Live impersonation", "Cloning a real person’s voice from private messages and chatting as them", "Impersonating an activist to contacts inside Iran without their knowledge"],
          ["Surveillance and profiling", "A ten-stage funnel and psychographic dossiers on named people in Iran", "Arrest-history profiling of people facing prison or execution"],
          ["Coordinated inauthentic behavior", "Multi-account Instagram pipelines with synchronized, segmented posting", "Hidden MEK affiliation behind “independent” branding"],
          ["Synthetic media", "Avatars with Persian audio as spokespeople", "Undisclosed synthetic “ordinary Iranians” and historical-figure deepfakes"],
          ["Media laundering", "Rewriting MEK media as independent reporting", "Watermark stripping and disguising organizational content as ordinary voices"],
        ],
        p: 72,
      },
      use: [
        { t: "Shared agent with memory", d: "Each workspace kept long-term memory files of banned words, approved sources, account rules and detection-avoidance methods, letting the agent keep producing without a human directing each session.", p: 72 },
        { t: "Doctrine as base data", d: "One actor loaded MEK founding doctrine into memory as “strategic base data” for others to reuse.", p: 72 },
        { t: "Committee-run workflow", d: "A dedicated approval committee and review chain from content correctors to managers, with repeated references to “per our contract” and to MEK leadership.", p: 72 },
        { t: "Slogan substitution", d: "The organic 2022 slogan “Woman, Life, Freedom” was swapped for the MEK variant “Woman, Resistance, Freedom”.", p: 72 },
      ],
      findings: [
        { t: "Profiles from 500+ channels", d: "Targets inside Iran were grouped by city, age, occupation, political alignment and arrest history.", p: 71 },
        { t: "Psychographic dossiers", d: "About 51,944 archived messages were analyzed to build dossiers on dozens of people; impersonation accounts pushed a fabricated breaking-news headline to 30+ contacts at once.", p: 71 },
        { t: "Synthetic ordinary Iranians", d: "Animated AI avatars with Persian audio promoted Maryam Rajavi’s ten-point plan without disclosure that they were generated.", p: 71 },
        { t: "Hidden affiliation", d: "Coordinated Instagram networks adjusted content by audience; early posts avoided naming the Mojahedin to look like neutral news.", p: 71 },
        { t: "Rivals targeted", d: "Messaging attacked the Iranian government, monarchists and the Pahlavi camp, including a fabricated video about a Pahlavi family member and “Neither Shah Nor Sheikh” framing.", p: 71 },
      ],
      safeguards: [
        { t: "Evasion rules in memory", d: "Detection-avoidance rules lived in shared memory files (SKILL.md, LEARNINGS.md), with a zero-width non-joiner plus dot or space trick as a cross-actor fingerprint.", p: 75, kind: "evasion" },
        { t: "Engagement unconfirmed", d: "How much authentic engagement the amplification accounts drew cannot be independently confirmed.", p: 74, kind: "note" },
      ],
      figures: [15, 16],
      detection: {
        found: { t: "Internal investigations", d: "Found as part of internal investigations; the actors shared no account infrastructure and showed no visible coordination.", p: 74 },
        action: { t: "Accounts banned", d: "Accounts were banned and indicators published for partners.", p: 74 },
      },
      indicators: {
        cols: ["Indicator", "Type", "Note"],
        rows: [
          ["mojahedin[.]org; ncr-iran[.]org; maryam-rajavi[.]com; iranntv[.]com; iranfreedom[.]org; hambastegimeli[.]com; wncri[.]org", "Domains", "Mandatory MEK/NCRI source set, hard-coded across actors"],
          ["@simaintv / @iranintv", "Instagram", "Origination node (~708K)"],
          ["@javanane_shargt", "Instagram", "Diaspora audience (~299K)"],
          ["@tehranchekhabar19", "Instagram", "“Independent news”, student targeting (~173K)"],
          ["@faryade_mamnoo", "Instagram", "Opposition content (~89.5K)"],
          ["@khabar_fouri_mardom; @iranpayam_tehran5", "Instagram", "Coordinated multi-page network"],
          ["@fwr.ir / @fwr_ir; t[.]me/FWR_ir", "Instagram / Telegram", "Sockpuppet funnel and surveillance endpoint"],
          ["@anti_silent", "Telegram", "Student surveillance funnel"],
          ["@jomhouri_democratic", "Instagram / Telegram", "Ten-point-plan promotion"],
          ["ZWNJ + dot/space evasion; mandatory slogan; #OurChoiceMaryamRajavi; SKILL.md / LEARNINGS.md", "Fingerprints", "Cross-actor signatures"],
        ],
        p: 74,
      },
    },

    /* ------------------------------------------------------------------ */
    {
      id: "GTG-54004",
      group: "domestic",
      short: "Kenya astroturfing",
      title: "Domestic coordinated inauthentic behavior campaign in Kenya",
      origin: "Kenya",
      iso: "KE",
      target: "Kenyan public ahead of the 2027 general election",
      region: "Africa",
      pages: [75, 77],
      breakout: { n: 1, why: "Confined to the network of fake accounts and local influencers on a single platform; no real audience reached.", p: 76 },
      attribution: "Real-world identity unknown. A local political astroturfing effort, plausibly aligned with the ruling coalition; no evidence of government involvement.",
      summary:
        "A single actor generated Kenyan political posts in batches of exactly 50, instructing Claude to make them read as spontaneous grassroots commentary rather than a campaign. Posts praised Energy Cabinet Secretary Opiyo Wandayi for stopping a Kenya Power tariff hike and claimed the United Opposition was falling apart before the 2027 election. The identical workflow also sold retail brands.",
      metrics: [
        { v: "50", l: "posts per generated batch" },
        { v: "2", l: "campaign hashtags" },
        { v: "1 in 5", l: "retail posts carrying links" },
      ],
      network: {
        title: "Message lines",
        cols: ["Line", "Content", "Target"],
        rows: [
          ["Tariff relief", "Praise for halting the Kenya Power electricity tariff hike, tagged #PowerReliefKE and #PoweringTheNewKenya", "Energy CS Opiyo Wandayi"],
          ["Opposition collapse", "Stories that the United Opposition coalition was breaking apart before 2027", "Rigathi Gachagua, former president Uhuru Kenyatta"],
          ["Retail marketing", "The same template under the “SHANKI” / “Elkins Marketer” persona, with a promotional broadcast repackaged as organic tweets", "Kenyan retail brands"],
        ],
        p: 75,
      },
      use: [
        { t: "Talking points to posts", d: "The actor supplied topic, talking points and hashtags; Claude produced 50 themed, character-counted posts for cross-platform publishing.", p: 76 },
        { t: "Copy-all widget", d: "In several sessions the posts were packaged as an interactive copy-all widget ready to deploy.", p: 77 },
        { t: "Humanizing drafts", d: "Claude mostly humanized and refined pre-drafted tweets; its value to the actor was volume and apparent authenticity.", p: 76 },
      ],
      findings: [
        { t: "One electoral playbook", d: "The same playbook boosted the incumbent administration and undermined the opposition, consistent with a single coordinated electoral communications effort.", p: 76 },
        { t: "Politics and retail, same template", d: "The template was reused verbatim for retail brands, with links inserted on every fifth post, fitting a common Kenyan pattern of agencies paying local influencers.", p: 76 },
        { t: "Messages set in advance", d: "Core ideological messages were decided before Claude was used.", p: 76 },
      ],
      safeguards: [],
      figures: [17],
      detection: {
        found: { t: "Tip from OpenAI", d: "A tip from OpenAI about recidivist activity on its platform led to an internal investigation of suspected coordinated inauthentic behavior in Kenya.", p: 77 },
        action: { t: "Account and organization removed", d: "The account and organization were removed and detections built around the behavioral signature.", p: 77 },
      },
    },

    /* ------------------------------------------------------------------ */
    {
      id: "GTG-84002",
      group: "state",
      short: "UAE “Deadshot” operation",
      title: "UAE-directed operation targeting the Muslim Brotherhood, the Sudan conflict and UN accountability mechanisms",
      origin: "United Arab Emirates",
      iso: "AE",
      target: "Muslim Brotherhood narratives, the UN Human Rights Council, MEPs and journalists",
      region: "Middle East / Europe",
      pages: [78, 80],
      breakout: { n: 3, why: "Ran across several social media platforms; a higher category would need evidence of broad public attention or policy impact.", p: 79 },
      attribution: "Linked with high confidence to UAE government officials. The doctrine file named senior UAE officials as intended recipients, and the actor funded the amplifying network.",
      summary:
        "A single actor ran an AI persona named “Deadshot” on a private platform. A master doctrine file in its setup repeated the same mission across hundreds of sessions: “a coordinated transatlantic and regional operation to dismantle the Muslim Brotherhood globally.” Five synchronized lines of activity ran in parallel, from influencer accounts to ghost-written UN testimony.",
      metrics: [
        { v: "~300", l: "inauthentic influencer accounts" },
        { v: "18", l: "MEPs and journalists profiled" },
        { v: "5", l: "parallel lines of activity" },
      ],
      network: {
        title: "Lines of activity",
        cols: ["Line", "What it did"],
        rows: [
          ["Influencer network", "About 300 inauthentic influencer accounts, centrally funded and coordinated."],
          ["Front NGO", "Copied a real Swiss organization’s identity and published state-authored human rights reports under it."],
          ["UN testimony", "Ghost-wrote testimony for two people at the 62nd session of the UN Human Rights Council, written so neither speech mentioned the UAE."],
          ["Target files", "Researched and profiled 18 Members of the European Parliament and prominent journalists."],
          ["Counter-accountability dossiers", "Dossiers on UN Special Rapporteurs who had criticized the UAE’s conduct in Sudan."],
        ],
        p: 78,
      },
      use: [
        { t: "Master doctrine file", d: "Embedded in the system setup, it instructed Claude to pursue the same mission across hundreds of sessions.", p: 78 },
        { t: "From doctrine to deliverables", d: "Real-world topics and pre-made doctrine were turned into official-looking intelligence briefs, cloned identity reports, ghost-written testimony and targeting lists, several for delivery to senior UAE officials.", p: 79 },
        { t: "Synchronized streams", d: "Narrative generation, technical obfuscation and target selection were coordinated across all five lines.", p: 78 },
      ],
      findings: [
        { t: "“Independence” as cover", d: "Internal reporting called the network’s “independence” its “greatest strategic asset”, an admission it was hiding state direction.", p: 79 },
        { t: "Borrowed identity at the UN", d: "The actor borrowed the identity of a real Sudanese human rights organization and ghost-wrote testimony for two named individuals, so material serving a party to the Sudan conflict would reach the UN as independent local witness accounts.", p: 79 },
        { t: "Coordinated hashtag push", d: "On June 4, 2026, X accounts posted near-identical graphics under #SudanIslamists linking the Sudanese Muslim Brotherhood to regional instability.", p: 80 },
        { t: "Delivery unconfirmed", d: "Whether the testimonies or dossiers reached their intended audiences cannot be confirmed.", p: 78 },
      ],
      safeguards: [],
      figures: [18],
      detection: {
        found: { t: "Internal investigations", d: "Found as part of internal investigations.", p: 80 },
        action: { t: "Banned and shared", d: "Accounts were banned, detections built around the behavioral signature, and indicators shared with industry partners.", p: 80 },
      },
    },
  ],

  figures: [
    { n: 1, p: 46, c: "GTG-04001", t: "Telegram channels exported for voice cloning", cap: "Pro-Russian Telegram channels linked to the operation, exported for stylistic voice analysis, cloning and distribution.", alt: "Two Telegram posts in Russian: a meeting at the Russian embassy in the CAR, and a post on Wagner instructors receiving CAR military awards." },
    { n: 2, p: 49, c: "GTG-54002", t: "AI-generated commenter profiles", cap: "Inauthentic commenting accounts with AI-generated profile photos, from the 250+ accounts created in June and July 2025.", alt: "Three X profiles with synthetic faces, all joined July 2025, with very few followers." },
    { n: 3, p: 50, c: "GTG-54002", t: "Commenters amplifying DRC content", cap: "Inauthentic commenting accounts amplifying DRC-focused content in coordinated clusters.", alt: "Four near-identical X posts about Rwanda’s cycling championships with the same image, each followed by a scripted reply." },
    { n: 4, p: 51, c: "GTG-54002", t: "Coordinated reply clusters", cap: "Coordinated clusters of commenting accounts amplifying DRC-focused content.", alt: "Two X threads about M23 taxing schools in eastern DRC, with replies highlighted in red boxes." },
    { n: 5, p: 52, c: "GTG-54002", t: "One of ~70 fabricated outlets", cap: "A fabricated news website from the roughly 70-outlet cluster, hosted on the operation’s shared infrastructure.", alt: "A dark-themed news site listing politics stories about Cyprus and Ghana under one byline." },
    { n: 6, p: 56, c: "GTG-84005", t: "Sockpuppets resharing platform content", cap: "Inauthentic commenting accounts reposting and sharing content from the platform.", alt: "Three X accounts with a few posts each reposting the same Anwar Ibrahim video with near-identical captions." },
    { n: 7, p: 56, c: "GTG-84005", t: "“Malaysia Pulse” synthetic outlet", cap: "The fabricated outlet “Malaysia Pulse”; its domain was registered on May 10, 2026.", alt: "A polished Malaysian news homepage with a lead story on Johor and Negri Sembilan elections." },
    { n: 8, p: 57, c: "GTG-84005", t: "Inauthentic YouTube channel", cap: "YouTube channel linked to the operation; its first and only video appeared a few weeks later (archived at hXXps[://]archive[.]ph/GZCoq).", alt: "A YouTube channel page named Malaysia Pulse with nine subscribers and one video." },
    { n: 9, p: 60, c: "GTG-24015", t: "Claude-drafted post on Sputnik Moldova 2.0", cap: "A post created with Claude as published, with 2.09K views; “Sputnik Moldova 2.0” belongs to a network of channels tied to Sputnik News.", alt: "A Russian-language Telegram post about a Romanian poll on Ceausescu, with 2.09K views." },
    { n: 10, p: 61, c: "GTG-24015", t: "Variant headline in RIA Novosti", cap: "Headlines with slight variations appeared in RIA Novosti and were republished by other pro-Kremlin outlets (archived at hXXps[://]archive[.]ph/Q1zW0).", alt: "A RIA Novosti article page with the same Ceausescu poll story and a Romanian flag photo." },
    { n: 11, p: 61, c: "GTG-24015", t: "Exact match on Sputnik Africa", cap: "A post on Sputnik Africa’s X account matching Claude-generated text exactly.", alt: "A Sputnik Africa article with highlighted text identical to the generated copy." },
    { n: 12, p: 65, c: "GTG-34001", t: "IRGC-aligned Eitaa channels", cap: "IRGC-aligned channels on Eitaa, a domestic Iranian messaging platform, disseminating the operation’s content to Persian-speaking audiences.", alt: "Search results for Eitaa channels named Supporters of the Revolutionary Guards." },
    { n: 13, p: 66, c: "GTG-34001", t: "Directed attack on Threads", cap: "A Threads account carrying one of the directed attacks, here targeting the news outlet Nawapress.", alt: "A Threads reply thread under a Nawapress post featuring an Iranian foreign ministry spokesperson." },
    { n: 14, p: 69, c: "GTG-54006", t: "Video staging folder", cap: "A Google Drive folder used to store and stage the operation’s videos before distribution.", alt: "A Google Drive grid of eleven numbered mp4 files with Bengali news-style thumbnails." },
    { n: 15, p: 73, c: "GTG-84006", t: "The “Viktor” network map", cap: "One distributed network bound by a shared Claude-based agent platform, spanning live impersonation, surveillance inside Iran, coordinated inauthentic behavior, synthetic spokespeople and media laundering.", alt: "A node-link diagram: source domains and the Viktor shared agent feed media nodes and covert actors that reach diaspora audiences and people inside Iran." },
    { n: 16, p: 74, c: "GTG-84006", t: "Instagram posts from the network", cap: "Example Instagram posts from a network account, illustrating coordinated inauthentic behavior, synthetic media and media laundering.", alt: "An Instagram video post branded as independent Iran and world news, with a long English caption about sanctions." },
    { n: 17, p: 77, c: "GTG-54004", t: "Coordinated praise for CS Wandayi", cap: "Inauthentic accounts amplifying content about Cabinet Secretary Opiyo Wandayi in coordinated clusters.", alt: "Four X posts from June 4 praising the withdrawn tariff proposal with the same hashtags and news cards." },
    { n: 18, p: 80, c: "GTG-84002", t: "#SudanIslamists campaign", cap: "A coordinated X campaign on June 4, 2026 under #SudanIslamists, posting near-identical graphics linking the Sudanese Muslim Brotherhood to regional instability.", alt: "Six X posts with identical breaking-news graphics and Sudan territorial control maps." },
  ],

  references: [
    {
      label: "Anthropic Threat Intelligence (2026). Detecting and countering misuse of AI: September 2026. Influence operations, pp. 41 to 80.",
      url: "https://www-cdn.anthropic.com/e50be2e51e7695dc4b1366a37a245a597377d3b5/Anthropic-Detecting-and-countering-091026.pdf",
    },
    {
      label: "Nimmo, B. (2020). The Breakout Scale: Measuring the impact of influence operations. Brookings Institution.",
      url: "https://www.brookings.edu/articles/the-breakout-scale-measuring-the-impact-of-influence-operations/",
    },
  ],
};
