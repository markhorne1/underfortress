import { z } from 'zod';

export const RequirementSchema = z.object({
  type: z.string(),
  key: z.string().optional(),
  value: z.any().optional(),
  qty: z.number().optional()
}).passthrough();

export const EffectSchema = z.object({
  type: z.string(),
  key: z.string().optional(),
  value: z.any().optional(),
  qty: z.number().optional()
}).passthrough();

export const ChoiceSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  text: z.string().optional(),
  requirements: z.array(RequirementSchema).optional(),
  effects: z.array(EffectSchema).optional(),
  goToAreaId: z.string().optional()
}).passthrough();

export const AreaSchema = z.object({
  id: z.string(),
  title: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  floorId: z.string().optional(),
  tileStyle: z.string().optional(),
  imagePrompt: z.string(),
  negativePrompt: z.string().optional(),
  text: z.string().optional(),
  actionsAvailable: z.record(z.any()).optional(),
  exits: z.record(z.string()).optional(),
  choices: z.array(ChoiceSchema).optional(),
  effectsOnEnter: z.array(EffectSchema).optional()
}).passthrough();

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string().optional(),
  stats: z.record(z.any()).optional(),
  imagePrompt: z.string().optional()
}).passthrough();

export const EnemySchema = z.object({
  id: z.string(),
  name: z.string(),
  skill: z.number().optional(),
  stamina: z.number().optional(),
  rewards: z.record(z.any()).optional(),
  imagePrompt: z.string().optional()
}).passthrough();

export const JobSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  startAreaId: z.string().optional(),
  objective: z.record(z.any()).optional(),
  rewards: z.record(z.any()).optional(),
  cooldownMinutes: z.number().optional()
}).passthrough();

export const NpcSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  imagePrompt: z.string().optional()
}).passthrough();

export const EnemyGroupSchema = z.object({
  id: z.string(),
  enemies: z.array(z.string())
}).passthrough();

export const SpellSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number().optional(),
  description: z.string().optional(),
  imagePrompt: z.string().optional()
}).passthrough();

export const RecipeSchema = z.object({
  id: z.string(),
  inputs: z.record(z.number()),
  output: z.string(),
  imagePrompt: z.string().optional()
}).passthrough();

export const QuestStageSchema = z.object({
  id: z.string(),
  title: z.string(),
  objectiveText: z.string(),
  requirements: z.array(RequirementSchema).optional(),
  onEnterEffects: z.array(EffectSchema).optional(),
  onCompleteEffects: z.array(EffectSchema).optional(),
  nextStageId: z.string().optional()
}).passthrough();

export const QuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.union([z.literal('quest'), z.literal('job')]),
  giverNpcId: z.string().optional(),
  startAreaId: z.string().optional(),
  summary: z.string().optional(),
  stages: z.array(QuestStageSchema),
  acceptRequirements: z.array(RequirementSchema).optional(),
  acceptEffects: z.array(EffectSchema).optional(),
  rewards: z.object({ xp: z.number().optional(), gold: z.number().optional(), items: z.array(z.object({ itemId: z.string(), qty: z.number().optional() })).optional() }).optional(),
  repeatable: z.boolean().optional(),
  cooldownHours: z.number().optional(),
  expiresAtTurns: z.number().optional(),
  failConditions: z.array(RequirementSchema).optional(),
  tags: z.array(z.string()).optional()
}).passthrough();

export const EndingMatrixSchema = z.object({
  id: z.string(),
  conditions: z.record(z.any()),
  title: z.string(),
  text: z.string()
}).passthrough();

export const ContentSchema = z.object({
  areas: z.array(AreaSchema).optional(),
  items: z.array(ItemSchema).optional(),
  enemies: z.array(EnemySchema).optional(),
  enemyGroups: z.array(EnemyGroupSchema).optional(),
  spells: z.array(SpellSchema).optional(),
  recipes: z.array(RecipeSchema).optional(),
  quests: z.array(QuestSchema).optional(),
  endings: z.array(EndingMatrixSchema).optional(),
  jobs: z.array(JobSchema).optional(),
  npcs: z.array(NpcSchema).optional(),
  leonardo_page_prompts: z.record(z.string()).optional(),
  leonardo_portrait_prompts: z.record(z.string()).optional()
}).passthrough();

export type Area = z.infer<typeof AreaSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type Requirement = z.infer<typeof RequirementSchema>;
export type Effect = z.infer<typeof EffectSchema>;
