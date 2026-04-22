import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { presentRecord } from '../records/record-presenter';
import { InvitationsService } from '../invitations/invitations.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitationsService: InvitationsService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: {
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: {
          include: { user: true },
        },
        records: {
          include: { extracted: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found or access denied`);

    return {
      ...project,
      records: project.records.map((record) => presentRecord(record)),
    };
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    // Only owner can update project settings
    const project = await this.prisma.project.findFirst({ where: { id, userId } });
    if (!project) throw new NotFoundException(`Project ${id} not found or you are not the owner`);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
      },
    });
  }

  async remove(id: string, userId: string) {
    // Only owner can delete project
    const project = await this.prisma.project.findFirst({ where: { id, userId } });
    if (!project) throw new NotFoundException(`Project ${id} not found or you are not the owner`);

    return this.prisma.project.delete({ where: { id } });
  }

  async addMember(projectId: string, email: string, ownerId: string) {
    // Verify ownership
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId: ownerId },
    });
    if (!project) throw new NotFoundException('Project not found or access denied');

    const userToAdd = await this.prisma.user.findUnique({ where: { email } });

    // If user doesn't exist, automatically create an invitation
    if (!userToAdd) {
      await this.invitationsService.create(
        { email, role: UserRole.WORKER, projectId }, // Defaulting to worker role for site invites
        ownerId,
      );
      return { message: `Invitation sent to ${email}. they will be added once they register.` };
    }

    // If user exists, add them directly
    const membership = await this.prisma.projectMember.upsert({
      where: {
        projectId_userId: { projectId, userId: userToAdd.id },
      },
      update: {},
      create: {
        projectId,
        userId: userToAdd.id,
      },
    });

    // Notify existing user
    await this.emailService.sendProjectAssignment(email, project.name);

    return membership;
  }

  async removeMember(projectId: string, memberUserId: string, ownerId: string) {
    // Verify ownership
    const project = await this.prisma.project.findFirst({ where: { id: projectId, userId: ownerId } });
    if (!project) throw new NotFoundException('Project not found or access denied');

    return this.prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId: memberUserId },
      },
    });
  }
}
