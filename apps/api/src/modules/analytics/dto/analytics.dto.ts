export class DashboardStatsDto {
    startDate?: Date;
    endDate?: Date;
}

export class SalesOverTimeDto {
    period: 'daily' | 'weekly' | 'monthly';
    startDate?: Date;
    endDate?: Date;
}

export class RevenueByCategory {
    period: 'daily' | 'weekly' | 'monthly';
    startDate?: Date;
    endDate?: Date;
}

export class TopBooksDto {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
}

export class CustomerGrowthDto {
    period: 'daily' | 'weekly' | 'monthly';
    startDate?: Date;
    endDate?: Date;
}
