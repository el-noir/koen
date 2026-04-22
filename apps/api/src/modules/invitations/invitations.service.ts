import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { EmailService } from '../email/email.service';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateInvitationDto, invitedById: string) {
    const invitedByUser = await this.prisma.user.findUnique({
      where: { id: invitedById },
    });

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Deactivate any existing pending invitations for this email
    await this.prisma.invitation.updateMany({
      where: {
        email: dto.email,
        status: InvitationStatus.PENDING,
      },
      data: {
        status: InvitationStatus.EXPIRED,
      },
    });

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // 3 days expiry as per request

    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email,
        role: dto.role,
        projectId: dto.projectId,
        token,
        expiresAt,
        invitedById,
        status: InvitationStatus.PENDING,
      },
    });

    // Send the email
    await this.emailService.sendAccountInvitation(
      dto.email,
      token,
      invitedByUser?.name || 'A KOEN Admin',
    );

    return invitation;
  }

  async validateToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Invitation has already been ${invitation.status.toLowerCase()}`);
    }

    if (new Date() > invitation.expiresAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Invitation token has expired');
    }

    return invitation;
  }

  async accept(token: string) {
    const invitation = await this.validateToken(token);
    
    return this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED },
    });
  }

  async findAll(projectId?: string, invitedById?: string) {
    return this.prisma.invitation.findMany({
      where: {
        projectId,
        invitedById,
        // We might want to see all regardless of status, but filtered by project/admin
      },
      orderBy: { createdAt: 'desc' },
      include: {
        invitedBy: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async revoke(id: string, invitedById: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Only the person who sent it (or an admin conceptually) can revoke it
    if (invitation.invitedById !== invitedById) {
      throw new BadRequestException('You do not have permission to revoke this invitation');
    }

    return this.prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.EXPIRED },
    });
  }
}
