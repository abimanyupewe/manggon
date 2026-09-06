export type UserRole = 'owner' | 'staff' | 'tenant';

export type RoomStatus = 'empty' | 'occupied' | 'maintenance';

export type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid' | 'rejected';

export type SecurityLogType = 'late_return' | 'guest_visit';

export type SecurityLogStatus = 'pending' | 'approved' | 'rejected';

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export interface BankAccountInfo {
    bank: string;
    account_number: string;
    account_holder: string;
}

export interface Property {
    id: number;
    name: string;
    slug: string;
    address: string;
    phone_number: string | null;
    description: string | null;
    facilities: string[] | null;
    images: string[] | null;
    bank_account_info: BankAccountInfo | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    rooms?: Room[];
    staff?: User[];
    tenants?: User[];
}

export interface Room {
    id: number;
    property_id: number;
    room_number: string;
    floor: number;
    price: string | number;
    status: RoomStatus;
    facilities: string[] | null;
    images: string[] | null;
    description: string | null;
    created_at: string;
    updated_at: string;
    property?: Property;
    tenant_profile?: TenantProfile;
}

export interface TenantProfile {
    id: number;
    user_id: number;
    room_id: number | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relation: string | null;
    identity_card_number: string | null;
    identity_card_image: string | null;
    entry_date: string;
    exit_date: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    room?: Room;
}

export interface User {
    id: number;
    name: string;
    email: string | null;
    username: string;
    phone_number: string | null;
    role: UserRole;
    property_id: number | null;
    is_active: boolean;
    must_change_password: boolean;
    created_at: string;
    updated_at: string;
    property?: Property;
    tenant_profile?: TenantProfile;
    avatar?: string;
    email_verified_at?: string | null;
}

export interface Payment {
    id: number;
    invoice_number: string;
    tenant_id: number;
    property_id: number;
    room_id: number | null;
    billing_period: string;
    amount: string | number;
    proof_image: string | null;
    status: PaymentStatus;
    rejection_reason: string | null;
    payment_date: string | null;
    verified_by: number | null;
    verified_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    tenant?: User;
    property?: Property;
    room?: Room;
    verifier?: User;
}

export interface SecurityLog {
    id: number;
    property_id: number;
    tenant_id: number;
    type: SecurityLogType;
    date: string;
    planned_time: string;
    actual_time: string | null;
    guest_name: string | null;
    notes: string;
    status: SecurityLogStatus;
    approved_by: number | null;
    approved_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    property?: Property;
    tenant?: User;
    approver?: User;
}

export interface ComplaintTicket {
    id: number;
    ticket_number: string;
    property_id: number;
    room_id: number;
    tenant_id: number;
    title: string;
    description: string;
    photo_evidence: string | null;
    status: ComplaintStatus;
    handled_by: number | null;
    resolution_notes: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    property?: Property;
    room?: Room;
    tenant?: User;
    handler?: User;
}

export interface ActivityLog {
    id: number;
    user_id: number | null;
    property_id: number | null;
    action: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    properties: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: User;
    property?: Property;
}
