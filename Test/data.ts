interface TenantData {
    id: number;
    name: string;
    Rent: number;
    dateOfCommencement: string;
    AdvancePaid: number;
    Security: number;
    AvatarUrl?: number;
}

export const data: TenantData[] = [
    {
        id: 1,
        name: "DEV",
        Rent: 6700,
        dateOfCommencement: "2023-01-15",
        AdvancePaid: 6500,
        Security: 6500,
        AvatarUrl: require("@/assets/images/Avatar-1.png")
    },
    {
        id: 2,
        name: "GUPTA",
        Rent: 12500,
        dateOfCommencement: "2023-02-15",
        AdvancePaid: 12500,
        Security: 12500,
        AvatarUrl: require("@/assets/images/Avatar-2.png")
    }
];