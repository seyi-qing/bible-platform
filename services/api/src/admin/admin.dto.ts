import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListAdminUsersDto { @IsOptional() @IsInt() @Min(1) @Max(100) limit = 50; }
export class SetUserRoleDto { @IsIn(['USER','MODERATOR','SUPPORT','ADMIN']) role!: string; }
export class ReportQueryDto { @IsOptional() @IsIn(['OPEN','RESOLVED','DISMISSED']) status?: string; }
export class ResolveReportDto { @IsIn(['RESOLVED','DISMISSED']) status!: 'RESOLVED' | 'DISMISSED'; }
export class AuditQueryDto { @IsOptional() @IsInt() @Min(1) @Max(200) limit = 100; }
