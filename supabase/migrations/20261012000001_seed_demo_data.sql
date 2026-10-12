-- ==============================================================================
-- Demo Seed Data: Sample NFC Cards with tokens and pre-hashed activation codes
-- ==============================================================================

-- Sample pre-minted physical NFC cards (ready for customer activation)
-- Activation code for card 1: "ACTV-8821-K9X2" (SHA-256 hash: b5e43a9d94943714dfbf659b83e449a7a6e1383794d249f39088198f80456187)
-- Activation code for card 2: "ACTV-4739-M2W8" (SHA-256 hash: d171415dfc3cf58bb01e0958dbcf1e85579621b194fbe05bf33c4114d284f6d3)
-- Activation code for card 3: "ACTV-9104-P5L1" (SHA-256 hash: 3a2830f305c48b26bc6a47a062c3e414c5c165a26a4574944ec7849cb737cfeb)

INSERT INTO public.nfc_cards (id, card_token, card_label, status)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'card-alpha-8821', 'Matte Black NFC Card #101', 'unclaimed'),
    ('a0000000-0000-0000-0000-000000000002', 'card-silver-4739', 'Brushed Steel NFC Card #102', 'unclaimed'),
    ('a0000000-0000-0000-0000-000000000003', 'card-bamboo-9104', 'Eco Bamboo NFC Card #103', 'unclaimed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.card_activations (card_id, code_hash, salt, is_used)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'b5e43a9d94943714dfbf659b83e449a7a6e1383794d249f39088198f80456187', 'seed_salt_1', false),
    ('a0000000-0000-0000-0000-000000000002', 'd171415dfc3cf58bb01e0958dbcf1e85579621b194fbe05bf33c4114d284f6d3', 'seed_salt_2', false),
    ('a0000000-0000-0000-0000-000000000003', '3a2830f305c48b26bc6a47a062c3e414c5c165a26a4574944ec7849cb737cfeb', 'seed_salt_3', false)
ON CONFLICT (card_id) DO NOTHING;
