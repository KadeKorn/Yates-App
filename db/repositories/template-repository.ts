import type { SQLiteDatabase } from 'expo-sqlite';

export type ActiveWorkoutTemplate = {
  code: string;
  id: string;
  name: string;
  orderIndex: number;
};

export type ActiveTemplateExercise = {
  id: string;
  name: string;
  orderIndex: number;
  templateId: string;
};

export type ActiveWorkoutTemplateDetail = ActiveWorkoutTemplate & {
  exercises: ActiveTemplateExercise[];
};

export type NextRecommendedWorkoutDay = {
  activeTemplateCount: number;
  basedOnCompletedWorkoutId: string | null;
  queueReason: 'first-active-template' | 'next-active-template';
  recommendedTemplate: ActiveWorkoutTemplate;
};

type ActiveWorkoutTemplateRow = {
  code: string;
  id: string;
  name: string;
  order_index: number;
};

type ActiveTemplateExerciseRow = {
  id: string;
  name: string;
  order_index: number;
  template_id: string;
};

type LastCompletedTemplateRow = {
  completed_at: string;
  template_id: string;
  template_order_index: number;
  workout_log_id: string;
};

export class TemplateRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  getClient(): SQLiteDatabase {
    return this.database;
  }

  async getActiveTemplates(): Promise<ActiveWorkoutTemplate[]> {
    const rows = await this.database.getAllAsync<ActiveWorkoutTemplateRow>(
      `SELECT id, code, name, order_index
       FROM workout_templates
       WHERE is_active = 1
       ORDER BY order_index ASC, id ASC;`
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      orderIndex: row.order_index,
    }));
  }

  async getActiveTemplateById(templateId: string): Promise<ActiveWorkoutTemplateDetail | null> {
    const templateRow = await this.database.getFirstAsync<ActiveWorkoutTemplateRow>(
      `SELECT id, code, name, order_index
       FROM workout_templates
       WHERE id = ?
         AND is_active = 1
       LIMIT 1;`,
      templateId
    );

    if (!templateRow) {
      return null;
    }

    const exerciseRows = await this.database.getAllAsync<ActiveTemplateExerciseRow>(
      `SELECT id, template_id, name, order_index
       FROM workout_template_exercises
       WHERE template_id = ?
         AND is_active = 1
       ORDER BY order_index ASC, id ASC;`,
      templateId
    );

    return {
      id: templateRow.id,
      code: templateRow.code,
      name: templateRow.name,
      orderIndex: templateRow.order_index,
      exercises: exerciseRows.map((row) => ({
        id: row.id,
        templateId: row.template_id,
        name: row.name,
        orderIndex: row.order_index,
      })),
    };
  }

  async getNextRecommendedWorkoutDay(): Promise<NextRecommendedWorkoutDay | null> {
    const activeTemplates = await this.getActiveTemplates();

    if (activeTemplates.length === 0) {
      return null;
    }

    const lastCompletedTemplate = await this.database.getFirstAsync<LastCompletedTemplateRow>(
      `SELECT
         wl.id AS workout_log_id,
         wl.completed_at,
         wt.id AS template_id,
         wt.order_index AS template_order_index
       FROM workout_logs wl
       INNER JOIN workout_templates wt ON wt.id = wl.template_id
       WHERE wl.status = 'completed'
         AND wl.completed_at IS NOT NULL
       ORDER BY wl.completed_at DESC, wl.id DESC
       LIMIT 1;`
    );

    if (!lastCompletedTemplate) {
      return {
        recommendedTemplate: activeTemplates[0],
        queueReason: 'first-active-template',
        basedOnCompletedWorkoutId: null,
        activeTemplateCount: activeTemplates.length,
      };
    }

    const nextTemplate =
      activeTemplates.find(
        (template) =>
          template.orderIndex > lastCompletedTemplate.template_order_index ||
          (template.orderIndex === lastCompletedTemplate.template_order_index &&
            template.id > lastCompletedTemplate.template_id)
      ) ?? activeTemplates[0];

    return {
      recommendedTemplate: nextTemplate,
      queueReason: 'next-active-template',
      basedOnCompletedWorkoutId: lastCompletedTemplate.workout_log_id,
      activeTemplateCount: activeTemplates.length,
    };
  }
}
