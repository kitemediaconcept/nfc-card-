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
    title: 'NFC CARD',
    badge: 'OFFICIAL',
    badgeColor: 'bg-neutral-100 text-neutral-900 border border-neutral-300',
    materialDescription: 'Premium matte black contactless NFC card with dynamic cloud sync.',
    isPopular: true,
    tiers: [
      {
        duration: '1-year',
        name: '1 Year Plan',
        originalPrice: 1099,
        discountedPrice: 801,
        features: [
          '1-Year cloud profile sync',
          'Instant contactless NFC tap',
          'Offline dynamic QR code backup',
          '1-Tap native vCard contact saving',
          'Real-time contact analytics',
        ],
      },
      {
        duration: '2-year',
        name: '2 Year Plan',
        originalPrice: 1599,
        discountedPrice: 1201,
        features: [
          '2-Year cloud profile sync',
          'Instant contactless NFC tap',
          'Offline dynamic QR code backup',
          '1-Tap native vCard contact saving',
          'Real-time contact analytics',
          'Priority support & update guarantee',
        ],
      },
      {
        duration: '3-year',
        name: '3 Year Plan',
        originalPrice: 1999,
        discountedPrice: 1401,
        features: [
          '3-Year cloud profile sync',
          'Instant contactless NFC tap',
          'Offline dynamic QR code backup',
          '1-Tap native vCard contact saving',
          'Real-time contact analytics',
          'Best value per year with zero hidden fees',
        ],
      },
    ],
  },
];
