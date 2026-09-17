import { Product } from '../types/product';

export const PRODUCTS: Product[] = [
  {
    id: 'rlx-01-onyx',
    name: 'MONOLITH 01 // ONYX',
    series: 'SERIES 01 ARCHITECTURAL',
    sku: 'RLX-SPEC-091',
    price: 85,
    tagline: 'Structured 6-panel in high-density cotton-poly heavy twill with tonal matte embroidery.',
    description: 'The definitive architectural silhouette. Engineered with reinforced buckram for permanent crown posture, bonded micro-seam tape, and a precision-machined matte black buckle clasp. Designed for absolute structural integrity in any weather condition.',
    category: 'STRUCTURED',
    profile: '6-PANEL HIGH',
    material: 'HEAVY TWILL',
    badge: 'NEW DROP',
    featured: true,
    newArrival: true,
    stockCount: 42,
    colors: [
      { name: 'Onyx Black', hex: '#0A0A0A' },
      { name: 'Obsidian Matte', hex: '#18181B' },
    ],
    sizes: ['S/M (54-57CM)', 'L/XL (58-61CM)', 'ADJUSTABLE'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: {
      material: '340 GSM High-Density Cotton / Poly Micro-Twill',
      weightGsm: '340 GSM',
      waterproofRating: 'DWR Finish (Level 3 Spray Test)',
      closureSystem: 'Matte Zinc-Alloy Custom Snap Slider with Debossed Serial',
      ventilation: '6 Laser-Cut Micro Perforations (0.8mm)',
      brimStructure: 'Rigid High-Memory EVA Core (Curved 15°)',
      origin: 'Engineered in Tokyo / Assembled in Portugal'
    }
  },
  {
    id: 'rlx-02-apex-storm',
    name: 'APEX STORM // GORE-TEX 3L',
    series: 'SERIES 02 ALPINE DIVISION',
    sku: 'RLX-SPEC-104',
    price: 110,
    tagline: 'Ultralight waterproof-breathable membrane runner cap with aerodynamic contouring.',
    description: 'Developed for high-velocity alpine navigation and wet-weather urban transit. Built with authentic GORE-TEX 3-layer laminated textile, 100% seam-sealed tape, and reflective technical typography along the rear crown cinch cord.',
    category: 'TECHNICAL',
    profile: 'UNSTRUCTURED RUNNER',
    material: 'GORE-TEX 3L',
    badge: 'GORE-TEX',
    featured: true,
    newArrival: true,
    stockCount: 18,
    colors: [
      { name: 'Cement Slate', hex: '#71717A' },
      { name: 'Obsidian Black', hex: '#0A0A0A' },
    ],
    sizes: ['ONE SIZE (ADJUSTABLE 54-62CM)'],
    images: [
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: {
      material: 'GORE-TEX 3-Layer Pro Laminate with Micro-Grid Backer',
      weightGsm: '125 GSM (Total Weight: 52g)',
      waterproofRating: '28,000mm Hydrostatic Head / RET < 6 Breathability',
      closureSystem: 'Hypalon Quick-Pull Cinch with 2mm Reflective Shock-Cord',
      ventilation: 'Dual Ultrasonic Bonded Lateral Mesh Ports',
      brimStructure: 'Foldable Semi-Rigid Memory Visor (Packable)',
      origin: 'Precision Bonded in Munich'
    }
  },
  {
    id: 'rlx-03-bone-archetype',
    name: 'ARCHETYPE 03 // BONE',
    series: 'SERIES 01 ARCHITECTURAL',
    sku: 'RLX-SPEC-072',
    price: 80,
    tagline: 'Off-white chalk piqué 6-panel with stark contrast interior taped seams.',
    description: 'An uncompromising exploration of raw mineral neutrals. Unbleached chalk piqué weave treated with an organic water-repellent wash. Features contrasting pitch-black interior seam piping and a debossed architectural branding emblem.',
    category: 'STRUCTURED',
    profile: '6-PANEL HIGH',
    material: 'HEAVY TWILL',
    badge: 'LIMITED',
    featured: true,
    newArrival: true,
    stockCount: 12,
    colors: [
      { name: 'Bone Off-White', hex: '#E4E4E7' },
      { name: 'Pale Stone', hex: '#D4D4D8' }
    ],
    sizes: ['S/M (54-57CM)', 'L/XL (58-61CM)'],
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: {
      material: '100% Ring-Spun Unbleached Heavy Cotton Piqué',
      weightGsm: '320 GSM',
      waterproofRating: 'Nanotech Stain & Liquid Barrier',
      closureSystem: 'Tonal Leather Strap with Matte Silver Hardware',
      ventilation: 'Embroidered Dual Eyelets',
      brimStructure: 'Semi-Flat Pre-Curved Polymer Core',
      origin: 'Crafted in Guimarães, Portugal'
    }
  },
  {
    id: 'rlx-04-cipher-camp',
    name: 'CIPHER 04 // CORDURA® 5-PANEL',
    series: 'SERIES 03 TACTICAL RECON',
    sku: 'RLX-SPEC-118',
    price: 95,
    tagline: 'Abrasion-resistant 500D ballistic Cordura camp cap with webbing tension system.',
    description: 'Built to withstand severe abrasion and rugged field exposure. Utilizes genuine Invista Cordura® 500D nylon weave paired with military-grade Mil-Spec nylon webbing and a quick-release magnetic Fidlock buckle.',
    category: 'CAMP_CAP',
    profile: '5-PANEL LOW',
    material: 'CORDURA® 500D',
    badge: 'LIMITED',
    featured: true,
    newArrival: false,
    stockCount: 24,
    colors: [
      { name: 'Obsidian Pitch', hex: '#0A0A0A' },
      { name: 'Charcoal Stealth', hex: '#27272A' }
    ],
    sizes: ['ONE SIZE (ADJUSTABLE 53-61CM)'],
    images: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: {
      material: 'Invista Cordura® 500D Ballistic Nylon',
      weightGsm: '280 GSM',
      waterproofRating: 'Polyurethane Back Coating + Teflon DWR Face',
      closureSystem: 'German Fidlock® V-Buckle with Mil-Spec Webbing',
      ventilation: 'Black Metal Mesh Screen Side Vents',
      brimStructure: 'Flat Flexible Visor Core',
      origin: 'Fabric woven in USA / Assembled in Japan'
    }
  },
  {
    id: 'rlx-05-stealth-aero',
    name: 'AERORUNNER 05 // RIPSTOP',
    series: 'SERIES 02 SPEED DIVISION',
    sku: 'RLX-SPEC-132',
    price: 75,
    tagline: 'Ultralight 48-gram ripstop cap engineered for high-output track performance.',
    description: 'Weighing just 48 grams, the Aerorunner utilizes diamond-matrix micro-ripstop with an antimicrobial CoolMax interior sweatband. Easily packs down flat into running shorts or technical vest pockets.',
    category: 'RUNNER',
    profile: 'UNSTRUCTURED RUNNER',
    material: 'RIPSTOP NYLON',
    badge: 'NEW DROP',
    featured: false,
    newArrival: true,
    stockCount: 35,
    colors: [
      { name: 'Matte Charcoal', hex: '#27272A' },
      { name: 'Chalk White', hex: '#F4F4F5' }
    ],
    sizes: ['ONE SIZE (ADJUSTABLE)'],
    images: [
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: {
      material: '40D Diamond Grid Micro-Ripstop Nylon',
      weightGsm: '65 GSM (Finished Cap: 48g)',
      waterproofRating: 'Hydrophobic Quick-Dry Coated',
      closureSystem: 'Micro-Elastic Webbing with Low-Profile Clip',
      ventilation: '360-Degree Continuous Crown Micro-Perfs',
      brimStructure: 'Crushable EVA Foam Visor (Memory Return)',
      origin: 'Engineered in Stockholm'
    }
  },
  {
    id: 'rlx-06-monolith-cement',
    name: 'MONOLITH 02 // CEMENT STONE',
    series: 'SERIES 01 ARCHITECTURAL',
    sku: 'RLX-SPEC-098',
    price: 85,
    tagline: 'Architectural concrete grey twill cap featuring brutalist panel divisions.',
    description: 'Inspired by raw poured concrete facades and brutalist monuments. Finished in an industrial cold cement wash with hairline tonal seams and a serialized archival patch on the left temple.',
    category: 'STRUCTURED',
    profile: '6-PANEL HIGH',
    material: 'HEAVY TWILL',
    featured: false,
    newArrival: false,
    stockCount: 29,
    colors: [
      { name: 'Cement Grey', hex: '#71717A' },
      { name: 'Onyx Black', hex: '#0A0A0A' }
    ],
    sizes: ['S/M (54-57CM)', 'L/XL (58-61CM)', 'ADJUSTABLE'],
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: {
      material: '100% Dense Canvas Twill (Cold Stone Washed)',
      weightGsm: '360 GSM',
      waterproofRating: 'Standard Water-Resistant Coating',
      closureSystem: 'Brushed Stainless Metal Clasp with Hidden Tuck',
      ventilation: 'Reinforced Metal Grommets',
      brimStructure: 'Contoured Heavy Buckram Visor',
      origin: 'Manufactured in Porto'
    }
  },
  {
    id: 'rlx-07-alpine-delta',
    name: 'DELTA THERMAL // SOFTSHELL',
    series: 'SERIES 02 ALPINE DIVISION',
    sku: 'RLX-SPEC-150',
    price: 105,
    tagline: 'Windproof technical softshell cap insulated with micro-grid thermal fleece.',
    description: 'Engineered for sub-zero urban commutes and mountain ascents. Features a bonded windproof outer shell, drop-down minimal ear flaps that fold cleanly into the interior, and magnetic stowage anchors.',
    category: 'TECHNICAL',
    profile: '5-PANEL LOW',
    material: 'TECHNICAL SOFTSHELL',
    badge: 'ARCHIVE',
    featured: false,
    newArrival: false,
    stockCount: 9,
    colors: [
      { name: 'Pitch Black', hex: '#0A0A0A' }
    ],
    sizes: ['M (56-58CM)', 'L (59-61CM)'],
    images: [
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: {
      material: '3-Layer Stretch Softshell with Micro-Grid Polar Backer',
      weightGsm: '290 GSM',
      waterproofRating: 'Windproof 0 CFM / 15,000mm Hydrostatic Resistance',
      closureSystem: 'Elasticized Back with Aluminum Cam Lock',
      ventilation: 'Laser Cut Thermal Release Channels',
      brimStructure: 'Rigid Curved Peak with Thermal Lamination',
      origin: 'Engineered in Bern / Assembled in Italy'
    }
  },
  {
    id: 'rlx-08-modular-visor',
    name: 'MODULAR 08 // TACTICAL VISOR',
    series: 'SERIES 03 TACTICAL RECON',
    sku: 'RLX-SPEC-177',
    price: 90,
    tagline: 'Convertible 6-panel technical cap equipped with magnetic eyewear docks.',
    description: 'Designed in collaboration with endurance athletes. Integrates patented neodymium eyewear docking grooves along the lateral crowns that securely lock sunglasses in place during aggressive sprints and crosswinds.',
    category: 'COLLABORATION',
    profile: '6-PANEL HIGH',
    material: 'RIPSTOP NYLON',
    badge: 'NEW DROP',
    featured: true,
    newArrival: true,
    stockCount: 16,
    colors: [
      { name: 'Matte Onyx', hex: '#0A0A0A' },
      { name: 'Wolf Slate', hex: '#71717A' }
    ],
    sizes: ['S/M (54-57CM)', 'L/XL (58-61CM)', 'ADJUSTABLE'],
    images: [
      'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: {
      material: 'High-Tenacity 70D Cordura Ripstop',
      weightGsm: '140 GSM',
      waterproofRating: 'DWR Repellent Finish',
      closureSystem: 'Precision Ratchet Dial Tension System',
      ventilation: 'Modular Side Ports with Rubberized Dampers',
      brimStructure: 'Aerodynamic Stiffened Curved Visor with Eyewear Channels',
      origin: 'Engineered in Tokyo'
    }
  }
];

export const HERO_PRODUCT = PRODUCTS[0];
