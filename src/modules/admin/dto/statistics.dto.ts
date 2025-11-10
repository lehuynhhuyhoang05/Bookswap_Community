// ============================================================
// src/modules/admin/dto/statistics.dto.ts
// DTOs cho Statistics Dashboard
// ============================================================
import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({
    example: {
      total: 150,
      active: 120,
      locked: 10,
      new_today: 5,
    },
  })
  users: {
    total: number;
    active: number;
    locked: number;
    new_today: number;
  };

  @ApiProperty({
    example: {
      total: 500,
      available: 400,
      exchanging: 80,
      removed: 20,
    },
  })
  books: {
    total: number;
    available: number;
    exchanging: number;
    removed: number;
  };

  @ApiProperty({
    example: {
      total: 200,
      completed: 150,
      pending: 30,
      success_rate: 75.0,
    },
  })
  exchanges: {
    total: number;
    completed: number;
    pending: number;
    success_rate: number;
  };

  @ApiProperty({
    example: {
      total: 50,
      pending: 10,
      resolved: 35,
      avg_resolution_time: 2.5,
    },
  })
  reports: {
    total: number;
    pending: number;
    resolved: number;
    avg_resolution_time: number; // giờ
  };
}
