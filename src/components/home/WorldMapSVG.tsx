"use client";

/**
 * Simplified flat world map SVG with 5 macro-area regions + "I nostri fiumi" badge.
 * Each <g> region has a data-region matching destination macro_area values.
 */
export default function WorldMapSVG({
  activeRegion,
  onHover,
  onClick,
}: {
  activeRegion: string | null;
  onHover: (region: string | null) => void;
  onClick: (region: string) => void;
}) {
  const regionStyle = (region: string) => ({
    fill: activeRegion === region ? "rgba(196, 30, 47, 0.2)" : "rgba(255, 255, 255, 0.08)",
    stroke: activeRegion === region ? "#C41E2F" : "rgba(255, 255, 255, 0.3)",
    strokeWidth: activeRegion === region ? 2 : 1,
    cursor: "pointer" as const,
    transition: "all 0.3s ease",
  });

  return (
    <svg viewBox="0 0 1000 500" className="w-full h-auto max-w-4xl mx-auto">
      {/* Europe */}
      <g
        data-region="Europa"
        onMouseEnter={() => onHover("Europa")}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick("Europa")}
      >
        <path
          d="M440,80 L480,60 L530,70 L560,90 L570,120 L550,160 L520,180 L500,200 L470,210 L440,200 L420,170 L410,140 L420,100 Z"
          style={regionStyle("Europa")}
        />
        <text x="480" y="145" fill="white" fontSize="12" fontWeight="600" textAnchor="middle" pointerEvents="none" opacity="0.9">
          Europa
        </text>
      </g>

      {/* Russia / Asia Centrale */}
      <g
        data-region="Russia"
        onMouseEnter={() => onHover("Russia")}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick("Russia")}
      >
        <path
          d="M560,50 L650,30 L750,40 L830,60 L850,100 L840,140 L800,160 L720,150 L650,140 L580,130 L570,100 L565,70 Z"
          style={regionStyle("Russia")}
        />
        <text x="710" y="100" fill="white" fontSize="12" fontWeight="600" textAnchor="middle" pointerEvents="none" opacity="0.9">
          Russia
        </text>
      </g>

      {/* Asia */}
      <g
        data-region="Asia"
        onMouseEnter={() => onHover("Asia")}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick("Asia")}
      >
        <path
          d="M650,150 L720,160 L800,170 L850,200 L870,250 L860,300 L820,330 L760,340 L700,320 L660,280 L640,240 L630,200 L640,170 Z"
          style={regionStyle("Asia")}
        />
        <text x="750" y="250" fill="white" fontSize="12" fontWeight="600" textAnchor="middle" pointerEvents="none" opacity="0.9">
          Asia
        </text>
      </g>

      {/* Africa / Medio Oriente */}
      <g
        data-region="Africa"
        onMouseEnter={() => onHover("Africa")}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick("Africa")}
      >
        <path
          d="M420,210 L470,215 L520,230 L550,260 L560,310 L540,370 L510,410 L470,430 L430,420 L400,380 L390,330 L380,280 L390,240 L410,220 Z"
          style={regionStyle("Africa")}
        />
        <text x="470" y="320" fill="white" fontSize="12" fontWeight="600" textAnchor="middle" pointerEvents="none" opacity="0.9">
          Africa
        </text>
      </g>

      {/* America Latina */}
      <g
        data-region="America Latina"
        onMouseEnter={() => onHover("America Latina")}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick("America Latina")}
      >
        <path
          d="M180,200 L230,180 L280,200 L310,250 L320,310 L300,370 L270,420 L230,450 L190,440 L160,400 L140,340 L130,280 L140,230 L160,210 Z"
          style={regionStyle("America Latina")}
        />
        <text x="230" y="320" fill="white" fontSize="11" fontWeight="600" textAnchor="middle" pointerEvents="none" opacity="0.9">
          America
        </text>
        <text x="230" y="336" fill="white" fontSize="11" fontWeight="600" textAnchor="middle" pointerEvents="none" opacity="0.9">
          Latina
        </text>
      </g>

      {/* Nord America */}
      <g
        data-region="Nord America"
        onMouseEnter={() => onHover("Nord America")}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick("Nord America")}
      >
        <path
          d="M100,40 L200,30 L300,50 L350,90 L340,140 L300,170 L240,180 L180,170 L120,150 L80,110 L70,70 Z"
          style={regionStyle("Nord America")}
        />
        <text x="210" y="110" fill="white" fontSize="11" fontWeight="600" textAnchor="middle" pointerEvents="none" opacity="0.9">
          Nord America
        </text>
      </g>
    </svg>
  );
}
