import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

// TODO: Phase 3.1 - add @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(UserRole.ADMIN)
// For now, we keep it open so we can create the first invitations.

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invitation (Admin only)' })
  // @ApiBearerAuth()
  create(@Body() dto: CreateInvitationDto) {
    // TODO: replace with req.user.id after Auth is wired
    const TEMP_ADMIN_ID = 'system'; 
    return this.invitationsService.create(dto, TEMP_ADMIN_ID);
  }

  @Get(':token')
  @ApiOperation({ summary: 'Validate an invitation token' })
  validate(@Param('token') token: string) {
    return this.invitationsService.validateToken(token);
  }
}
