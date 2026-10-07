export interface Me {
    name: string
    telegram_id: string
    wallet: number
    locked_wallet: number
    total_purchase: number
    joined: string
    invited_count: number
    successful_invites: number
    services_count: number
    orders_enabled: boolean
    agent_discount_percent?: number
    is_admin?: boolean
    is_reseller?: boolean
    commission_percent?: number
}

export interface Plan {
    key: string
    name: string
    price: number
    days: number
    volume_gb?: number
    type: "vip"
}

export interface VipCategory {
    key: string
    name: string
    plans: Plan[]
}

export interface PlansResponse {
    vip_categories: VipCategory[]
    orders_enabled: boolean
    intro_text?: string
    agent_discount_percent?: number
    is_admin?: boolean
    is_reseller?: boolean
    commission_percent?: number
    online_payment_enabled?: boolean
}

export interface FreeTrialResponse {
    plan: Plan
    wallet: number
    orders_enabled: boolean
}
export interface DiscountValidateResult {
    valid: boolean
    percent?: number
    discount_type?: "percent" | "amount"
    amount?: number
    min_order_amount?: number
    expires_at?: string | null
    reason?: "wrong_plan" | "user_limit_reached" | "not_allowed" | "min_order_amount"
}

export interface Transaction {
    type: string
    amount: number
    description: string
    created_at: string
}

export interface Wallet {
    wallet: number
    locked_wallet: number
    card_number: string
    card_holder: string
    min_purchase_gb: number
    online_payment_enabled?: boolean
    online_payment_min_amount?: number
    transactions: Transaction[]
}

export interface VipService {
    id: number
    plan: string
    created_at: string
    expiry: string | null
    sub_link: string | null
    has_qr: boolean
    panel_type?: "shahrah" | "marzban" | "pasargad" | null
    panel_name?: string | null
    remaining_days?: number | null
}

export interface UsageInfo {
    total: number | null
    used: number
    remaining: number | null
    percent: number | null
    expire: number | null
}

export interface ServiceUsageResponse {
    usage: UsageInfo | null
    remaining_days?: number | null
}

export interface ServicesResponse {
    vip: VipService[]
}

export type CustomBuildOrderType = "new" | "renew"

export interface CustomBuildLimits {
    min_gb: number
    max_gb: number
    min_days: number
    max_days: number
    price_per_gb: number
    price_per_30_days: number
}

export interface ReferralStats {
    invite_link: string
    invite_code: string
    invited_count: number
    successful_invites: number
    released_amount: number
    locked_wallet: number
    reward_amount: number
    min_purchase_gb: number
}
