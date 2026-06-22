import prisma from '../lib/prisma';

export const listTemplates = (creatorId: string) =>
  prisma.proposalTemplate.findMany({
    where: { creatorId },
    orderBy: { createdAt: 'desc' },
  });

export const findTemplateById = (id: string) =>
  prisma.proposalTemplate.findUnique({ where: { id } });

export const createTemplate = (creatorId: string, title: string, body: string) =>
  prisma.proposalTemplate.create({ data: { creatorId, title, body } });

export const updateTemplate = (id: string, data: { title?: string; body?: string }) =>
  prisma.proposalTemplate.update({ where: { id }, data });

export const deleteTemplate = (id: string) =>
  prisma.proposalTemplate.delete({ where: { id } });
