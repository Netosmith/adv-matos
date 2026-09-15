import { z } from 'zod';
const short=z.string().trim().max(300);const date=z.string().refine(v=>!v||(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))),'Data inválida');
export const schemas={
 clients:z.object({name:short.min(2),type:z.enum(['PF','PJ']),document:short, email:z.union([z.literal(''),z.string().email().max(254)]),phone:short,address:z.string().max(1000),status:z.enum(['Ativo','Inativo']),notes:z.string().max(10000)}),
 processes:z.object({name:short.min(2),number:short.min(1),clientId:short.min(1),opponent:short,area:short,court:short,phase:z.enum(['Inicial','Instrução','Sentença','Recurso','Arquivado']),status:z.enum(['Ativo','Aguardando julgamento','Suspenso','Concluído']),deadline:date,notes:z.string().max(10000)}),
 contracts:z.object({name:short.min(2),clientId:short.min(1),processId:short,category:z.enum(['Honorários','Confidencialidade','Procuração','Personalizado']),status:z.enum(['Rascunho','Aguardando assinatura','Ativo','Encerrado']),expires:date,content:z.string().max(100000),font:z.enum(['Georgia','Arial','Times New Roman']),fontSize:z.enum(['12','14','16']),align:z.enum(['left','center','right','justify'])})
};
export const settingsSchema=z.object({name:short.min(2),oab:short,document:short,address:z.string().max(1000),email:z.union([z.literal(''),z.string().email().max(254)]),phone:short});
export const categories=['Petição','Prova','Contrato','Outros'];
