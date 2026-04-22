import { Controller, Post, Get, Body, Param, UseGuards, Query, Patch, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, UserContext } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new invitation (Admin only)' })
  create(
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: UserContext,
  ) {
    return this.invitationsService.create(dto, user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all invitations (Admin only)' })
  findAll(
    @CurrentUser() user: UserContext,
    @Query('projectId') projectId?: string,
  ) {
    return this.invitationsService.findAll(projectId, user.userId);
  }

  @Patch(':id/revoke')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke an invitation (Admin only)' })
  revoke(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    return this.invitationsService.revoke(id, user.userId);
  }

  @Get(':token')
  @Public()
  @ApiOperation({ summary: 'Validate an invitation token (Public)' })
  validate(@Param('token') token: string) {
    return this.invitationsService.validateToken(token);
  }
}
