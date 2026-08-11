/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { EventType, UserRole } from '@generated/prisma'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { parseISO } from 'date-fns'
import { Public, Roles } from '@/common/decorators'
import { RolesGuard } from '@/common/guards'
import { CreateEventCommand } from './commands/create-event'
import { DeleteEventCommand } from './commands/delete-event'
import { UpdateEventCommand } from './commands/update-event'
import { CreateEventDto, EventDto, UpdateEventDto } from './dtos'
import { GetEventByIdQuery } from './queries/get-event-by-id'
import { ListEventsQuery } from './queries/list-events'

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List all events',
    description: 'Get a list of all events with optional filters',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter events starting from this date (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter events ending before this date (ISO string)',
  })
  @ApiQuery({
    name: 'types',
    required: false,
    description: 'Filter by event types (comma-separated)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of events',
    type: [EventDto],
  })
  async listEvents(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('types') types?: string,
  ) {
    const eventTypes = types ? (types.split(',') as EventType[]) : undefined

    const events = await this.queryBus.execute(
      new ListEventsQuery(
        startDate ? parseISO(startDate) : undefined,
        endDate ? parseISO(endDate) : undefined,
        eventTypes,
      ),
    )

    return events.map(EventDto.fromEntity)
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get event by ID',
    description: 'Get a single event by its ID',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event details',
    type: EventDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEventById(@Param('id') id: string) {
    const event = await this.queryBus.execute(new GetEventByIdQuery(id))
    return EventDto.fromEntity(event)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create new event',
    description: 'Create a new event (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async createEvent(@Body() dto: CreateEventDto, @Request() req: { user?: { id: string } }) {
    const event = await this.commandBus.execute(
      new CreateEventCommand(
        dto.title,
        parseISO(dto.startDate),
        parseISO(dto.endDate),
        dto.type,
        dto.description,
        dto.location,
        dto.organizer,
        dto.attendees,
        dto.surveyLink,
        req.user?.id,
      ),
    )

    return EventDto.fromEntity(event)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update event',
    description: 'Update an existing event (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: EventDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    const event = await this.commandBus.execute(
      new UpdateEventCommand(
        id,
        dto.title,
        dto.description,
        dto.startDate ? parseISO(dto.startDate) : undefined,
        dto.endDate ? parseISO(dto.endDate) : undefined,
        dto.location,
        dto.type,
        dto.organizer,
        dto.attendees,
        dto.surveyLink,
      ),
    )

    return EventDto.fromEntity(event)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete event',
    description: 'Delete an event (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
    type: EventDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteEvent(@Param('id') id: string) {
    const event = await this.commandBus.execute(new DeleteEventCommand(id))
    return EventDto.fromEntity(event)
  }
}
