export default function TomatoBackground() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 1200 195"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* ── Flesh gradients (light source top-left) ── */}
        <radialGradient id="bwFlesh" cx="38%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#e84848"/>
          <stop offset="45%"  stopColor="#b82828"/>
          <stop offset="78%"  stopColor="#8a1818"/>
          <stop offset="100%" stopColor="#5a0c0c"/>
        </radialGradient>
        <radialGradient id="cpFlesh" cx="38%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#b03c7a"/>
          <stop offset="42%"  stopColor="#882858"/>
          <stop offset="76%"  stopColor="#601838"/>
          <stop offset="100%" stopColor="#360c1e"/>
        </radialGradient>
        <radialGradient id="ooFlesh" cx="38%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#f07848"/>
          <stop offset="45%"  stopColor="#c85028"/>
          <stop offset="78%"  stopColor="#963818"/>
          <stop offset="100%" stopColor="#5e1c08"/>
        </radialGradient>
        <radialGradient id="gzFlesh" cx="38%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#b8d840"/>
          <stop offset="44%"  stopColor="#78aa20"/>
          <stop offset="78%"  stopColor="#507810"/>
          <stop offset="100%" stopColor="#2e4808"/>
        </radialGradient>
        <radialGradient id="bkFlesh" cx="38%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#7a3250"/>
          <stop offset="38%"  stopColor="#561e34"/>
          <stop offset="72%"  stopColor="#361018"/>
          <stop offset="100%" stopColor="#160608"/>
        </radialGradient>
        <radialGradient id="ypFlesh" cx="38%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#f0d448"/>
          <stop offset="44%"  stopColor="#c8a820"/>
          <stop offset="78%"  stopColor="#8e7610"/>
          <stop offset="100%" stopColor="#564806"/>
        </radialGradient>
        <radialGradient id="mlFlesh" cx="38%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#e87898"/>
          <stop offset="44%"  stopColor="#c05070"/>
          <stop offset="78%"  stopColor="#8e3450"/>
          <stop offset="100%" stopColor="#581828"/>
        </radialGradient>
      </defs>

      {/* ═══════════════════════════════════════════════════
          1.  BRANDYWINE RED  —  4 locules  (left)
          cx=85  cy=110  rx=70  ry=67
      ═══════════════════════════════════════════════════ */}
      <g opacity="0.87">
        {/* drop shadow */}
        <ellipse cx="89"  cy="115" rx="71" ry="68" fill="#1c0404" opacity="0.45"/>
        {/* flesh */}
        <ellipse cx="85"  cy="110" rx="70" ry="67" fill="url(#bwFlesh)"/>
        {/* pericarp rim */}
        <ellipse cx="85"  cy="110" rx="70" ry="67" fill="none" stroke="#721414" strokeWidth="12" opacity="0.55"/>
        {/* locule gel (4 sectors, inner r≈51) */}
        <path d="M85,110 L85,59 A51,48 0 0,1 136,110 Z" fill="rgba(175,30,30,0.28)"/>
        <path d="M85,110 L136,110 A51,48 0 0,1 85,158 Z" fill="rgba(160,26,26,0.28)"/>
        <path d="M85,110 L85,158 A51,48 0 0,1 34,110 Z"  fill="rgba(168,28,28,0.28)"/>
        <path d="M85,110 L34,110 A51,48 0 0,1 85,59 Z"   fill="rgba(163,27,27,0.28)"/>
        {/* septa */}
        <line x1="85"  y1="64"  x2="85"  y2="99"  stroke="#5a1010" strokeWidth="2.6" opacity="0.78"/>
        <line x1="85"  y1="121" x2="85"  y2="154" stroke="#5a1010" strokeWidth="2.6" opacity="0.78"/>
        <line x1="38"  y1="110" x2="74"  y2="110" stroke="#5a1010" strokeWidth="2.6" opacity="0.78"/>
        <line x1="96"  y1="110" x2="132" y2="110" stroke="#5a1010" strokeWidth="2.6" opacity="0.78"/>
        {/* columella */}
        <circle cx="85" cy="110" r="14" fill="#701818" opacity="0.9"/>
        <circle cx="85" cy="110" r="7.5" fill="#481010" opacity="0.96"/>
        {/* seeds — cream ellipses, 2 per locule */}
        <ellipse cx="77"  cy="74"  rx="4"   ry="6.5" fill="#f2e2a2" opacity="0.92" transform="rotate(-7,77,74)"/>
        <ellipse cx="94"  cy="71"  rx="4"   ry="6.5" fill="#eada98" opacity="0.90" transform="rotate(9,94,71)"/>
        <ellipse cx="121" cy="102" rx="6.5" ry="4"   fill="#f2e2a2" opacity="0.92" transform="rotate(82,121,102)"/>
        <ellipse cx="124" cy="118" rx="6.5" ry="4"   fill="#eada98" opacity="0.90" transform="rotate(78,124,118)"/>
        <ellipse cx="94"  cy="147" rx="4"   ry="6.5" fill="#f2e2a2" opacity="0.92" transform="rotate(8,94,147)"/>
        <ellipse cx="77"  cy="150" rx="4"   ry="6.5" fill="#eada98" opacity="0.90" transform="rotate(-8,77,150)"/>
        <ellipse cx="50"  cy="118" rx="6.5" ry="4"   fill="#f2e2a2" opacity="0.92" transform="rotate(80,50,118)"/>
        <ellipse cx="48"  cy="102" rx="6.5" ry="4"   fill="#eada98" opacity="0.90" transform="rotate(84,48,102)"/>
        {/* stem scar */}
        <ellipse cx="85"  cy="44"  rx="9"   ry="5.5" fill="#480e0e" opacity="0.55"/>
        <ellipse cx="85"  cy="44"  rx="5"   ry="3"   fill="#2e0808" opacity="0.6"/>
        {/* specular highlight */}
        <ellipse cx="61"  cy="82"  rx="21"  ry="13"  fill="white" opacity="0.08" transform="rotate(-28,61,82)"/>
      </g>

      {/* ═══════════════════════════════════════════════════
          2.  CHEROKEE PURPLE  —  4 locules  (left-center)
          cx=248  cy=80  rx=58  ry=55
      ═══════════════════════════════════════════════════ */}
      <g opacity="0.83">
        <ellipse cx="252" cy="85"  rx="60" ry="57" fill="#0e0408" opacity="0.42"/>
        <ellipse cx="248" cy="80"  rx="58" ry="55" fill="url(#cpFlesh)"/>
        <ellipse cx="248" cy="80"  rx="58" ry="55" fill="none" stroke="#5e1030" strokeWidth="11" opacity="0.56"/>
        <path d="M248,80 L248,33 A43,41 0 0,1 291,80 Z"  fill="rgba(125,28,58,0.27)"/>
        <path d="M248,80 L291,80 A43,41 0 0,1 248,121 Z" fill="rgba(115,24,52,0.27)"/>
        <path d="M248,80 L248,121 A43,41 0 0,1 205,80 Z" fill="rgba(120,26,55,0.27)"/>
        <path d="M248,80 L205,80 A43,41 0 0,1 248,33 Z"  fill="rgba(118,25,54,0.27)"/>
        <line x1="248" y1="38"  x2="248" y2="70"  stroke="#480e28" strokeWidth="2.3" opacity="0.78"/>
        <line x1="248" y1="90"  x2="248" y2="118" stroke="#480e28" strokeWidth="2.3" opacity="0.78"/>
        <line x1="209" y1="80"  x2="238" y2="80"  stroke="#480e28" strokeWidth="2.3" opacity="0.78"/>
        <line x1="258" y1="80"  x2="287" y2="80"  stroke="#480e28" strokeWidth="2.3" opacity="0.78"/>
        <circle cx="248" cy="80"  r="12"  fill="#5a1430" opacity="0.9"/>
        <circle cx="248" cy="80"  r="6.5" fill="#380820" opacity="0.95"/>
        <ellipse cx="240" cy="48"  rx="3.5" ry="5.8" fill="#e8d890" opacity="0.88" transform="rotate(-5,240,48)"/>
        <ellipse cx="257" cy="45"  rx="3.5" ry="5.8" fill="#e0d088" opacity="0.88" transform="rotate(7,257,45)"/>
        <ellipse cx="278" cy="73"  rx="5.8" ry="3.5" fill="#e8d890" opacity="0.88" transform="rotate(80,278,73)"/>
        <ellipse cx="280" cy="88"  rx="5.8" ry="3.5" fill="#e0d088" opacity="0.88" transform="rotate(77,280,88)"/>
        <ellipse cx="257" cy="113" rx="3.5" ry="5.8" fill="#e8d890" opacity="0.88" transform="rotate(6,257,113)"/>
        <ellipse cx="240" cy="116" rx="3.5" ry="5.8" fill="#e0d088" opacity="0.88" transform="rotate(-7,240,116)"/>
        <ellipse cx="218" cy="88"  rx="5.8" ry="3.5" fill="#e8d890" opacity="0.88" transform="rotate(79,218,88)"/>
        <ellipse cx="216" cy="73"  rx="5.8" ry="3.5" fill="#e0d088" opacity="0.88" transform="rotate(83,216,73)"/>
        <ellipse cx="248" cy="26"  rx="7.5" ry="4.5" fill="#360c1c" opacity="0.5"/>
        <ellipse cx="248" cy="26"  rx="4"   ry="2.5" fill="#200810" opacity="0.55"/>
        <ellipse cx="227" cy="56"  rx="18"  ry="11"  fill="white" opacity="0.07" transform="rotate(-27,227,56)"/>
      </g>

      {/* ═══════════════════════════════════════════════════
          3.  ORANGE OXHEART  —  5 locules  (center-left)
          cx=425  cy=120  rx=57  ry=54
      ═══════════════════════════════════════════════════ */}
      <g opacity="0.85">
        <ellipse cx="428" cy="125" rx="59" ry="56" fill="#1e0806" opacity="0.38"/>
        <ellipse cx="425" cy="120" rx="57" ry="54" fill="url(#ooFlesh)"/>
        <ellipse cx="425" cy="120" rx="57" ry="54" fill="none" stroke="#7e1e0e" strokeWidth="11" opacity="0.52"/>
        {/* 5 sectors at 72° */}
        <path d="M425,120 L425,66 A43,41 0 0,1 466,83 Z"   fill="rgba(192,72,28,0.26)"/>
        <path d="M425,120 L466,83 A43,41 0 0,1 464,132 Z"  fill="rgba(182,67,26,0.26)"/>
        <path d="M425,120 L464,132 A43,41 0 0,1 432,161 Z" fill="rgba(187,69,27,0.26)"/>
        <path d="M425,120 L432,161 A43,41 0 0,1 386,132 Z" fill="rgba(178,64,25,0.26)"/>
        <path d="M425,120 L386,132 A43,41 0 0,1 425,66 Z"  fill="rgba(184,67,26,0.26)"/>
        <line x1="425" y1="79"  x2="425" y2="110" stroke="#6e1808" strokeWidth="2.1" opacity="0.73"/>
        <line x1="457" y1="90"  x2="436" y2="113" stroke="#6e1808" strokeWidth="2.1" opacity="0.73"/>
        <line x1="458" y1="134" x2="437" y2="123" stroke="#6e1808" strokeWidth="2.1" opacity="0.73"/>
        <line x1="433" y1="155" x2="427" y2="132" stroke="#6e1808" strokeWidth="2.1" opacity="0.73"/>
        <line x1="392" y1="134" x2="413" y2="123" stroke="#6e1808" strokeWidth="2.1" opacity="0.73"/>
        <circle cx="425" cy="120" r="12"  fill="#8c2810" opacity="0.88"/>
        <circle cx="425" cy="120" r="6.5" fill="#5c1808" opacity="0.93"/>
        <ellipse cx="425" cy="79"  rx="3.5" ry="6"   fill="#f0e092" opacity="0.90"/>
        <ellipse cx="456" cy="96"  rx="3.5" ry="6"   fill="#ead88a" opacity="0.88" transform="rotate(56,456,96)"/>
        <ellipse cx="452" cy="140" rx="3.5" ry="6"   fill="#f0e092" opacity="0.90" transform="rotate(112,452,140)"/>
        <ellipse cx="417" cy="157" rx="3.5" ry="6"   fill="#ead88a" opacity="0.88" transform="rotate(170,417,157)"/>
        <ellipse cx="390" cy="122" rx="6"   ry="3.5" fill="#f0e092" opacity="0.90" transform="rotate(230,390,122)"/>
        <ellipse cx="425" cy="66"  rx="7"   ry="4.5" fill="#481008" opacity="0.5"/>
        <ellipse cx="425" cy="66"  rx="3.5" ry="2.5" fill="#2c0a04" opacity="0.55"/>
        <ellipse cx="404" cy="93"  rx="17"  ry="11"  fill="white" opacity="0.07" transform="rotate(-30,404,93)"/>
      </g>

      {/* ═══════════════════════════════════════════════════
          4.  GREEN ZEBRA  —  5 locules  (center)
          cx=598  cy=60  rx=50  ry=47
      ═══════════════════════════════════════════════════ */}
      <g opacity="0.83">
        <ellipse cx="601" cy="65"  rx="52" ry="49" fill="#080e04" opacity="0.36"/>
        <ellipse cx="598" cy="60"  rx="50" ry="47" fill="url(#gzFlesh)"/>
        <ellipse cx="598" cy="60"  rx="50" ry="47" fill="none" stroke="#387018" strokeWidth="10" opacity="0.54"/>
        {/* zebra stripe veins on skin */}
        <path d="M598,14 Q614,37 598,60 Q582,37 598,14"      fill="none" stroke="#3a7818" strokeWidth="3.5" opacity="0.38"/>
        <path d="M640,35  Q620,47 598,60 Q600,38 640,35"     fill="none" stroke="#3a7818" strokeWidth="3"   opacity="0.35"/>
        <path d="M636,93  Q616,74 598,60 Q618,70 636,93"     fill="none" stroke="#3a7818" strokeWidth="3"   opacity="0.35"/>
        <path d="M560,35  Q578,47 598,60 Q596,38 560,35"     fill="none" stroke="#3a7818" strokeWidth="3"   opacity="0.35"/>
        <path d="M562,93  Q580,74 598,60 Q578,70 562,93"     fill="none" stroke="#3a7818" strokeWidth="3"   opacity="0.35"/>
        {/* 5 sectors */}
        <path d="M598,60 L598,14 A37,34 0 0,1 633,71 Z"  fill="rgba(105,165,32,0.24)"/>
        <path d="M598,60 L633,71 A37,34 0 0,1 620,98 Z"  fill="rgba(95,152,29,0.24)"/>
        <path d="M598,60 L620,98 A37,34 0 0,1 576,98 Z"  fill="rgba(100,158,30,0.24)"/>
        <path d="M598,60 L576,98 A37,34 0 0,1 563,71 Z"  fill="rgba(92,148,28,0.24)"/>
        <path d="M598,60 L563,71 A37,34 0 0,1 598,14 Z"  fill="rgba(98,155,30,0.24)"/>
        <line x1="598" y1="23"  x2="598" y2="51"  stroke="#2e5010" strokeWidth="1.9" opacity="0.72"/>
        <line x1="624" y1="70"  x2="607" y2="62"  stroke="#2e5010" strokeWidth="1.9" opacity="0.72"/>
        <line x1="614" y1="93"  x2="603" y2="72"  stroke="#2e5010" strokeWidth="1.9" opacity="0.72"/>
        <line x1="582" y1="93"  x2="593" y2="72"  stroke="#2e5010" strokeWidth="1.9" opacity="0.72"/>
        <line x1="572" y1="70"  x2="589" y2="62"  stroke="#2e5010" strokeWidth="1.9" opacity="0.72"/>
        <circle cx="598" cy="60"  r="10"  fill="#487020" opacity="0.88"/>
        <circle cx="598" cy="60"  r="5.5" fill="#2c4810" opacity="0.93"/>
        <ellipse cx="598" cy="27"  rx="3"   ry="5.2" fill="#e8ee9a" opacity="0.88"/>
        <ellipse cx="622" cy="70"  rx="5.2" ry="3"   fill="#e8ee9a" opacity="0.88" transform="rotate(71,622,70)"/>
        <ellipse cx="612" cy="94"  rx="3"   ry="5.2" fill="#e8ee9a" opacity="0.88" transform="rotate(142,612,94)"/>
        <ellipse cx="584" cy="94"  rx="3"   ry="5.2" fill="#e8ee9a" opacity="0.88" transform="rotate(215,584,94)"/>
        <ellipse cx="574" cy="70"  rx="5.2" ry="3"   fill="#e8ee9a" opacity="0.88" transform="rotate(287,574,70)"/>
        <ellipse cx="598" cy="14"  rx="6.5" ry="4"   fill="#244010" opacity="0.5"/>
        <ellipse cx="598" cy="14"  rx="3.5" ry="2.2" fill="#162808" opacity="0.55"/>
        <ellipse cx="578" cy="37"  rx="14"  ry="9"   fill="white" opacity="0.09" transform="rotate(-26,578,37)"/>
      </g>

      {/* ═══════════════════════════════════════════════════
          5.  BLACK KRIM  —  4 locules  (center-right)
          cx=735  cy=112  rx=55  ry=52
      ═══════════════════════════════════════════════════ */}
      <g opacity="0.81">
        <ellipse cx="739" cy="117" rx="57" ry="54" fill="#060104" opacity="0.44"/>
        <ellipse cx="735" cy="112" rx="55" ry="52" fill="url(#bkFlesh)"/>
        <ellipse cx="735" cy="112" rx="55" ry="52" fill="none" stroke="#2a0c12" strokeWidth="11" opacity="0.62"/>
        <path d="M735,112 L735,60 A41,39 0 0,1 776,112 Z"  fill="rgba(82,22,38,0.3)"/>
        <path d="M735,112 L776,112 A41,39 0 0,1 735,151 Z" fill="rgba(74,18,34,0.3)"/>
        <path d="M735,112 L735,151 A41,39 0 0,1 694,112 Z" fill="rgba(78,20,36,0.3)"/>
        <path d="M735,112 L694,112 A41,39 0 0,1 735,60 Z"  fill="rgba(71,18,33,0.3)"/>
        <line x1="735" y1="64"  x2="735" y2="102" stroke="#1e0810" strokeWidth="2.4" opacity="0.82"/>
        <line x1="735" y1="122" x2="735" y2="148" stroke="#1e0810" strokeWidth="2.4" opacity="0.82"/>
        <line x1="697" y1="112" x2="724" y2="112" stroke="#1e0810" strokeWidth="2.4" opacity="0.82"/>
        <line x1="746" y1="112" x2="773" y2="112" stroke="#1e0810" strokeWidth="2.4" opacity="0.82"/>
        <circle cx="735" cy="112" r="13"  fill="#380e1c" opacity="0.92"/>
        <circle cx="735" cy="112" r="7"   fill="#1c0608" opacity="0.97"/>
        <ellipse cx="726" cy="75"  rx="3.5" ry="6"   fill="#d8c888" opacity="0.86" transform="rotate(-6,726,75)"/>
        <ellipse cx="744" cy="72"  rx="3.5" ry="6"   fill="#d0c080" opacity="0.86" transform="rotate(7,744,72)"/>
        <ellipse cx="764" cy="104" rx="6"   ry="3.5" fill="#d8c888" opacity="0.86" transform="rotate(82,764,104)"/>
        <ellipse cx="766" cy="121" rx="6"   ry="3.5" fill="#d0c080" opacity="0.86" transform="rotate(78,766,121)"/>
        <ellipse cx="744" cy="148" rx="3.5" ry="6"   fill="#d8c888" opacity="0.86" transform="rotate(6,744,148)"/>
        <ellipse cx="726" cy="150" rx="3.5" ry="6"   fill="#d0c080" opacity="0.86" transform="rotate(-7,726,150)"/>
        <ellipse cx="707" cy="121" rx="6"   ry="3.5" fill="#d8c888" opacity="0.86" transform="rotate(80,707,121)"/>
        <ellipse cx="705" cy="104" rx="6"   ry="3.5" fill="#d0c080" opacity="0.86" transform="rotate(84,705,104)"/>
        <ellipse cx="735" cy="58"  rx="8"   ry="5"   fill="#160608" opacity="0.52"/>
        <ellipse cx="735" cy="58"  rx="4.5" ry="2.8" fill="#0c0204" opacity="0.58"/>
        <ellipse cx="714" cy="86"  rx="16"  ry="10"  fill="white" opacity="0.06" transform="rotate(-26,714,86)"/>
      </g>

      {/* ═══════════════════════════════════════════════════
          6.  YELLOW PEAR  —  3 locules  (right-center)
          cx=888  cy=76  rx=45  ry=42
      ═══════════════════════════════════════════════════ */}
      <g opacity="0.84">
        <ellipse cx="891" cy="80"  rx="47" ry="44" fill="#1e1006" opacity="0.32"/>
        <ellipse cx="888" cy="76"  rx="45" ry="42" fill="url(#ypFlesh)"/>
        <ellipse cx="888" cy="76"  rx="45" ry="42" fill="none" stroke="#886010" strokeWidth="9.5" opacity="0.52"/>
        {/* 3 sectors at 120° */}
        <path d="M888,76 L888,34 A34,32 0 0,1 917,92 Z"  fill="rgba(202,162,22,0.25)"/>
        <path d="M888,76 L917,92 A34,32 0 0,1 859,92 Z"  fill="rgba(190,152,19,0.25)"/>
        <path d="M888,76 L859,92 A34,32 0 0,1 888,34 Z"  fill="rgba(196,157,20,0.25)"/>
        <line x1="888" y1="44"  x2="888" y2="67"  stroke="#6a5010" strokeWidth="2.1" opacity="0.72"/>
        <line x1="908" y1="87"  x2="897" y2="73"  stroke="#6a5010" strokeWidth="2.1" opacity="0.72"/>
        <line x1="868" y1="87"  x2="879" y2="73"  stroke="#6a5010" strokeWidth="2.1" opacity="0.72"/>
        <circle cx="888" cy="76"  r="11"  fill="#9a7c14" opacity="0.86"/>
        <circle cx="888" cy="76"  r="6"   fill="#685008" opacity="0.92"/>
        <ellipse cx="888" cy="46"  rx="3.2" ry="5.5" fill="#eaec92" opacity="0.90"/>
        <ellipse cx="910" cy="90"  rx="5.5" ry="3.2" fill="#eaec92" opacity="0.90" transform="rotate(116,910,90)"/>
        <ellipse cx="866" cy="90"  rx="5.5" ry="3.2" fill="#eaec92" opacity="0.90" transform="rotate(245,866,90)"/>
        <ellipse cx="888" cy="34"  rx="7"   ry="4.5" fill="#4e4008" opacity="0.48"/>
        <ellipse cx="888" cy="34"  rx="3.8" ry="2.5" fill="#302808" opacity="0.54"/>
        <ellipse cx="869" cy="53"  rx="13"  ry="8.5" fill="white" opacity="0.10" transform="rotate(-27,869,53)"/>
      </g>

      {/* ═══════════════════════════════════════════════════
          7.  MORTGAGE LIFTER PINK  —  6 locules  (right)
          cx=1085  cy=108  rx=63  ry=60
      ═══════════════════════════════════════════════════ */}
      <g opacity="0.84">
        <ellipse cx="1089" cy="113" rx="65" ry="62" fill="#140608" opacity="0.38"/>
        <ellipse cx="1085" cy="108" rx="63" ry="60" fill="url(#mlFlesh)"/>
        <ellipse cx="1085" cy="108" rx="63" ry="60" fill="none" stroke="#761e3c" strokeWidth="12" opacity="0.52"/>
        {/* 6 sectors at 60° */}
        <path d="M1085,108 L1085,48 A47,44 0 0,1 1126,77 Z"   fill="rgba(192,72,100,0.24)"/>
        <path d="M1085,108 L1126,77 A47,44 0 0,1 1126,133 Z"  fill="rgba(182,67,94,0.24)"/>
        <path d="M1085,108 L1126,133 A47,44 0 0,1 1085,162 Z" fill="rgba(188,69,97,0.24)"/>
        <path d="M1085,108 L1085,162 A47,44 0 0,1 1044,133 Z" fill="rgba(178,64,92,0.24)"/>
        <path d="M1085,108 L1044,133 A47,44 0 0,1 1044,77 Z"  fill="rgba(185,67,95,0.24)"/>
        <path d="M1085,108 L1044,77 A47,44 0 0,1 1085,48 Z"   fill="rgba(180,65,93,0.24)"/>
        <line x1="1085" y1="64"  x2="1085" y2="98"  stroke="#5c1428" strokeWidth="2.1" opacity="0.74"/>
        <line x1="1117" y1="82"  x2="1098" y2="106" stroke="#5c1428" strokeWidth="2.1" opacity="0.74"/>
        <line x1="1117" y1="128" x2="1098" y2="112" stroke="#5c1428" strokeWidth="2.1" opacity="0.74"/>
        <line x1="1085" y1="154" x2="1085" y2="120" stroke="#5c1428" strokeWidth="2.1" opacity="0.74"/>
        <line x1="1053" y1="128" x2="1072" y2="112" stroke="#5c1428" strokeWidth="2.1" opacity="0.74"/>
        <line x1="1053" y1="82"  x2="1072" y2="106" stroke="#5c1428" strokeWidth="2.1" opacity="0.74"/>
        <circle cx="1085" cy="108" r="13"  fill="#7a1e38" opacity="0.88"/>
        <circle cx="1085" cy="108" r="7"   fill="#4e1020" opacity="0.94"/>
        {/* 12 seeds, 2 per locule */}
        <ellipse cx="1076" cy="69"  rx="3.5" ry="6"   fill="#f2dea2" opacity="0.90" transform="rotate(-4,1076,69)"/>
        <ellipse cx="1094" cy="66"  rx="3.5" ry="6"   fill="#ead69a" opacity="0.88" transform="rotate(6,1094,66)"/>
        <ellipse cx="1116" cy="85"  rx="6"   ry="3.5" fill="#f2dea2" opacity="0.90" transform="rotate(57,1116,85)"/>
        <ellipse cx="1120" cy="102" rx="6"   ry="3.5" fill="#ead69a" opacity="0.88" transform="rotate(62,1120,102)"/>
        <ellipse cx="1112" cy="135" rx="6"   ry="3.5" fill="#f2dea2" opacity="0.90" transform="rotate(118,1112,135)"/>
        <ellipse cx="1100" cy="146" rx="3.5" ry="6"   fill="#ead69a" opacity="0.88" transform="rotate(126,1100,146)"/>
        <ellipse cx="1076" cy="151" rx="3.5" ry="6"   fill="#f2dea2" opacity="0.90" transform="rotate(177,1076,151)"/>
        <ellipse cx="1059" cy="147" rx="3.5" ry="6"   fill="#ead69a" opacity="0.88" transform="rotate(185,1059,147)"/>
        <ellipse cx="1050" cy="132" rx="6"   ry="3.5" fill="#f2dea2" opacity="0.90" transform="rotate(238,1050,132)"/>
        <ellipse cx="1046" cy="113" rx="6"   ry="3.5" fill="#ead69a" opacity="0.88" transform="rotate(245,1046,113)"/>
        <ellipse cx="1054" cy="85"  rx="6"   ry="3.5" fill="#f2dea2" opacity="0.90" transform="rotate(298,1054,85)"/>
        <ellipse cx="1068" cy="71"  rx="3.5" ry="6"   fill="#ead69a" opacity="0.88" transform="rotate(307,1068,71)"/>
        <ellipse cx="1085" cy="48"  rx="9"   ry="5.5" fill="#480e20" opacity="0.50"/>
        <ellipse cx="1085" cy="48"  rx="5"   ry="3"   fill="#2e0812" opacity="0.56"/>
        <ellipse cx="1061" cy="80"  rx="19"  ry="12"  fill="white" opacity="0.07" transform="rotate(-28,1061,80)"/>
      </g>
    </svg>
  );
}
