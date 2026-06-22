import prisma from '../lib/prisma';

export const listMembers = (ownerCreatorId: string) =>
  prisma.teamMember.findMany({
    where: { ownerCreatorId },
    orderBy: { createdAt: 'desc' },
  });

export const countMembers = (ownerCreatorId: string) =>
  prisma.teamMember.count({ where: { ownerCreatorId } });

export const findMemberById = (id: string) =>
  prisma.teamMember.findUnique({ where: { id } });

export const findMemberByEmail = (ownerCreatorId: string, email: string) =>
  prisma.teamMember.findUnique({
    where: { ownerCreatorId_email: { ownerCreatorId, email } },
  });

export const createMember = (params: {
  ownerCreatorId: string;
  name: string;
  email: string;
  role: string;
}) => prisma.teamMember.create({ data: params });

export const deleteMember = (id: string) =>
  prisma.teamMember.delete({ where: { id } });
