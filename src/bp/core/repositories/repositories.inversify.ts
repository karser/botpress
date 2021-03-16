import { SessionRepository } from 'core/dialog/sessions'
import { EventRepository } from 'core/events'
import { LogsRepository } from 'core/logger'
import { ConversationRepository, MessageRepository } from 'core/messaging'
import { TelemetryRepository } from 'core/telemetry'
import { TYPES } from 'core/types'
import {
  ChannelUserRepository,
  StrategyUsersRepository,
  WorkspaceInviteCodesRepository,
  WorkspaceUsersRepository
} from 'core/users'
import { ContainerModule, interfaces } from 'inversify'

import { KnexNotificationsRepository, NotificationsRepository } from '.'
import { TasksRepository } from './tasks'

const RepositoriesContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<SessionRepository>(TYPES.SessionRepository)
    .to(SessionRepository)
    .inSingletonScope()

  bind<ChannelUserRepository>(TYPES.UserRepository)
    .to(ChannelUserRepository)
    .inSingletonScope()

  bind<LogsRepository>(TYPES.LogsRepository)
    .to(LogsRepository)
    .inSingletonScope()

  bind<NotificationsRepository>(TYPES.NotificationsRepository)
    .to(KnexNotificationsRepository)
    .inSingletonScope()

  bind<EventRepository>(TYPES.EventRepository)
    .to(EventRepository)
    .inSingletonScope()

  bind<StrategyUsersRepository>(TYPES.StrategyUsersRepository)
    .to(StrategyUsersRepository)
    .inSingletonScope()

  bind<TelemetryRepository>(TYPES.TelemetryRepository)
    .to(TelemetryRepository)
    .inSingletonScope()

  bind<WorkspaceUsersRepository>(TYPES.WorkspaceUsersRepository)
    .to(WorkspaceUsersRepository)
    .inSingletonScope()

  bind<WorkspaceInviteCodesRepository>(TYPES.WorkspaceInviteCodesRepository)
    .to(WorkspaceInviteCodesRepository)
    .inSingletonScope()

  bind<TasksRepository>(TYPES.TasksRepository)
    .to(TasksRepository)
    .inSingletonScope()

  bind<MessageRepository>(TYPES.MessageRepository)
    .to(MessageRepository)
    .inSingletonScope()

  bind<ConversationRepository>(TYPES.ConversationRepository)
    .to(ConversationRepository)
    .inSingletonScope()
})

export const RepositoriesContainerModules = [RepositoriesContainerModule]
