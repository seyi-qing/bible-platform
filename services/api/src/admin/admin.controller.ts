import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../common/guards/auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { AuditQueryDto, ListAdminUsersDto, ReportQueryDto, ResolveReportDto, SetUserRoleDto } from './admin.dto';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('overview') overview() { return this.service.overview(); }
  @Get('users') users(@Query() query: ListAdminUsersDto) { return this.service.listUsers(query.limit); }
  @Patch('users/:id/role') setRole(@Param('id') id: string, @Body() body: SetUserRoleDto, @Req() req: AuthenticatedRequest) { return this.service.setUserRole(id, body.role, req.user.sub); }
  @Get('reports') reports(@Query() query: ReportQueryDto) { return this.service.reports(query.status); }
  @Patch('reports/:id') resolve(@Param('id') id: string, @Body() body: ResolveReportDto, @Req() req: AuthenticatedRequest) { return this.service.resolveReport(id, req.user.sub, body.status); }
  @Get('audit') audit(@Query() query: AuditQueryDto) { return this.service.audit(query.limit); }
}
