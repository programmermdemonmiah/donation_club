export interface AuthUser {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    referral_code?: string;
}

export interface FlashMessages {
    success?: string;
    error?: string;
    status?: string;
}

export interface PageProps {
    auth: { user: AuthUser | null };
    flash?: FlashMessages;
    [key: string]: unknown;
}
