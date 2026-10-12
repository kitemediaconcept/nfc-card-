export type CardMaterial = 'pvc' | 'wooden' | 'metal';

export type PlanDuration = '1-year' | '2-year' | '3-year';

export interface PlanTier {
  duration: PlanDuration;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  features: string[];
}

export interface CardProduct {
  id: CardMaterial;
  title: string;
  badge: string;
  badgeColor: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  materialDescription: string;
  tiers: PlanTier[];
}

export interface SelectedPlanState {
  cardId: CardMaterial;
  cardTitle: string;
  tier: PlanTier;
}

export const CARD_PRODUCTS: CardProduct[] = [
  {
    id: 'pvc',
    title: 'PVC CARD',
    badge: 'BEST VALUE',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    materialDescription: 'High-durability matte finish PVC with embedded NTAG213 NFC microchip.',
    isPopular: true,
    tiers: [
      {
        duration: '1-year',
        name: '1-Year Plan',
        originalPrice: 1599,
        discountedPrice: 1399,
        features: [
          '1-year subscription',
          'Fully customizable card design',
          'Access to all features',
        ],
      },
      {
        duration: '2-year',
        name: '2-Year Plan',
        originalPrice: 1899,
        discountedPrice: 1699,
        features: [
          '2-year subscription',
          'Fully customizable card design',
          'Access to all features',
        ],
      },
      {
        duration: '3-year',
        name: '3-Year Plan',
        originalPrice: 2149,
        discountedPrice: 1949,
        features: [
          '3-year subscription',
          'Fully customizable card design',
          'Access to all features',
        ],
      },
    ],
  },
  {
    id: 'wooden',
    title: 'WOODEN CARD',
    badge: 'ECO FRIENDLY',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    materialDescription: 'Naturally grained organic bamboo and walnut wood with zero plastic casing.',
    tiers: [
      {
        duration: '1-year',
        name: '1-Year Plan',
        originalPrice: 1999,
        discountedPrice: 1799,
        features: [
          '1-year subscription',
          'Fully customizable card design',
          'Access to all features',
        ],
      },
      {
        duration: '2-year',
        name: '2-Year Plan',
        originalPrice: 2299,
        discountedPrice: 2099,
        features: [
          '2-year subscription',
          'Fully customizable card design',
          'Access to all features',
        ],
      },
      {
        duration: '3-year',
        name: '3-Year Plan',
        originalPrice: 2549,
        discountedPrice: 2349,
        features: [
          '3-year subscription',
          'Fully customizable card design',
          'Access to all features',
        ],
      },
    ],
  },
  {
    id: 'metal',
    title: 'METAL CARD',
    badge: 'PREMIUM',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    isFeatured: true,
    materialDescription: 'Laser-etched aerospace matte black stainless steel with hybrid high-frequency antenna.',
    tiers: [
      {
        duration: '1-year',
        name: '1-Year Plan',
        originalPrice: 2799,
        discountedPrice: 2599,
        features: [
          '1-year subscription',
          'Fully customizable card design',
          'Access to all features',
        ],
      },
      {
        duration: '2-year',
        name: '2-Year Plan',
        originalPrice: 3099,
        discountedPrice: 2899,
        features: [
          '2-year subscription',
          'Fully customizable card design',
          'Access to all features',
        ],
      },
      {
        duration: '3-year',
        name: '3-Year Plan',
        originalPrice: 3349,
        discountedPrice: 3149,
        features: [
          '3-year subscription',
          'Fully customizable card design',
          'Access to all features',
        ],
      },
    ],
  },
];
