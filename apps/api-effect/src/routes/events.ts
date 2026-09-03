import { HttpApiBuilder } from 'effect/unstable/httpapi';

import { api } from '../api';
import { wrap, bodyOf } from '../lib/http';
import type { Event, EventType } from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import { bindBody, readJsonObject } from '../lib/validate';
import { requireAdmin } from '../lib/auth';
import { goTime, newId } from '../lib/util';

// Mirrors events.validTypes
const VALID_TYPES = ['MEETING', 'WORKSHOP', 'SOCIAL', 'COMPETITION', 'SURVEY', 'OTHER'];

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

// ponytail: Go's time.Parse(time.RFC3339) is strict; regex + Date.parse is a close approximation.
function parseIso(v: unknown): Date | null {
  if (typeof v !== 'string' || !ISO_RE.test(v)) return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : new Date(t);
}

function toDTO(e: Event) {
  const out: Record<string, unknown> = {
    id: e.id,
    title: e.title,
    description: e.description,
    startDate: goTime(e.startDate),
    endDate: goTime(e.endDate),
    location: e.location,
    type: e.type,
    organizer: e.organizer,
    attendees: e.attendees,
    surveyLink: e.surveyLink,
    createdAt: goTime(e.createdAt),
    updatedAt: goTime(e.updatedAt),
  };
  if (e.createdBy !== null) out.createdBy = e.createdBy;
  return out;
}

export const eventsHandlers = HttpApiBuilder.group(api, 'events', (h) =>
  h
    .handle(
      'listEvents',
      wrap(true, async (ctx) => {
        const where: Record<string, unknown> = {};
        const start = parseIso(ctx.query.startDate);
        if (start) where.startDate = { gte: start };
        const end = parseIso(ctx.query.endDate);
        if (end) where.endDate = { lte: end };
        if (ctx.query.types) {
          const types = String(ctx.query.types)
            .split(',')
            .filter((t) => t !== '');
          if (types.length > 0) where.type = { in: types };
        }
        const rows = await ctx.db.event.findMany({ where, orderBy: { startDate: 'asc' } });
        return rows.map(toDTO);
      }),
    )
    .handle(
      'getEvent',
      wrap(true, async (ctx) => {
        const e = await ctx.db.event.findUnique({ where: { id: ctx.params.id! } });
        if (e === null) throw new ApiError(404, `Event with ID ${ctx.params.id} not found`);
        return toDTO(e);
      }),
    )
    .handle(
      'createEvent',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        const in1 = bindBody<{
          title?: string;
          description?: string | null;
          startDate?: string;
          endDate?: string;
          location?: string | null;
          type?: string;
          organizer?: string | null;
          attendees?: number | null;
          surveyLink?: string | null;
        }>(await bodyOf(ctx), {
          Title: { type: 'string', required: true, maxLen: 255 },
          StartDate: { type: 'string', required: true },
          EndDate: { type: 'string', required: true },
          Type: { type: 'string', required: true },
          Description: { type: 'string' },
          Location: { type: 'string' },
          Organizer: { type: 'string' },
          Attendees: { type: 'number', integer: true },
          SurveyLink: { type: 'string' },
        });
        if (!VALID_TYPES.includes(in1.type ?? '')) {
          throw new ApiError(
            400,
            'type must be one of MEETING, WORKSHOP, SOCIAL, COMPETITION, SURVEY, OTHER',
          );
        }
        const sd = parseIso(in1.startDate);
        const ed = parseIso(in1.endDate);
        if (sd === null || ed === null) {
          throw new ApiError(400, 'startDate/endDate must be ISO date strings');
        }
        const e = await ctx.db.event.create({
          data: {
            id: newId(),
            title: in1.title!,
            description: in1.description ?? null,
            startDate: sd,
            endDate: ed,
            location: in1.location ?? null,
            type: in1.type! as EventType,
            organizer: in1.organizer ?? null,
            attendees: in1.attendees ?? null,
            surveyLink: in1.surveyLink ?? null,
          },
        });
        ctx.status = 201;
        return toDTO(e);
      }),
    )
    .handle(
      'updateEvent',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        const in1 = await readJsonObject(ctx.http);
        const e = await ctx.db.event.findUnique({ where: { id: ctx.params.id! } });
        if (e === null) throw new ApiError(404, `Event with ID ${ctx.params.id} not found`);
        const updates: Record<string, unknown> = {};
        for (const k of ['title', 'description', 'location', 'organizer', 'surveyLink']) {
          const v = in1[k];
          if (typeof v === 'string') updates[k] = v;
        }
        if ('type' in in1) {
          const s = typeof in1.type === 'string' ? in1.type : '';
          if (!VALID_TYPES.includes(s)) throw new ApiError(400, 'invalid event type');
          updates.type = s;
        }
        if ('attendees' in in1) {
          // ponytail: mirrors Go `f, _ := v.(float64); int(f)` — non-number zero-fills.
          const f = typeof in1.attendees === 'number' ? in1.attendees : 0;
          updates.attendees = Math.trunc(f);
        }
        for (const k of ['startDate', 'endDate']) {
          if (k in in1) {
            const t = parseIso(in1[k]);
            if (t === null) throw new ApiError(400, `${k} must be an ISO date string`);
            updates[k] = t;
          }
        }
        if (Object.keys(updates).length > 0) {
          updates.updatedAt = new Date();
          const updated = await ctx.db.event.update({ where: { id: e.id }, data: updates });
          return toDTO(updated);
        }
        return toDTO(e);
      }),
    )
    .handle(
      'deleteEvent',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        const res = await ctx.db.event.deleteMany({ where: { id: ctx.params.id! } });
        if (res.count === 0) throw new ApiError(404, `Event with ID ${ctx.params.id} not found`);
        return { success: true };
      }),
    ),
);
