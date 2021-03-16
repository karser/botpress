import { IO } from 'botpress/sdk'
import LicensingService from 'common/licensing-service'
import { CMSService } from 'core/cms'
import { ConverseService } from 'core/converse'
import { EventEngine, Queue, MemoryQueue } from 'core/events'
import { KeyValueStore } from 'core/kvs'
import { LogsJanitor, LogsService } from 'core/logger'
import { MessageService, ConversationService } from 'core/messaging'
import { DialogContainerModule } from 'core/services/dialog/dialog.inversify'
import { CEJobService, JobService } from 'core/services/job-service'
import { StatsService } from 'core/telemetry'
import { TYPES } from 'core/types'
import { ContainerModule, interfaces } from 'inversify'

import ActionServersService from './action/action-servers-service'
import ActionService from './action/action-service'
import { AlertingService, CEAlertingService } from './alerting-service'
import { AuthStrategies, CEAuthStrategies } from './auth-strategies'
import AuthService from './auth/auth-service'
import { BotMonitoringService } from './bot-monitoring-service'
import { BotService } from './bot-service'
import { SkillService } from './dialog/skill/service'
import { GhostContainerModule } from './ghost/ghost.inversify'
import { HintsService } from './hints'
import { HookService } from './hook/hook-service'
import CELicensingService from './licensing'
import { MediaServiceProvider } from './media'
import { CEMonitoringService, MonitoringService } from './monitoring'
import { NLUService } from './nlu/nlu-service'
import { NotificationsService } from './notification/service'
import RealtimeService from './realtime'

const ServicesContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<ConversationService>(TYPES.ConversationService)
    .to(ConversationService)
    .inSingletonScope()

  bind<MessageService>(TYPES.MessageService)
    .to(MessageService)
    .inSingletonScope()

  bind<CMSService>(TYPES.CMSService)
    .to(CMSService)
    .inSingletonScope()

  bind<NLUService>(TYPES.NLUService)
    .to(NLUService)
    .inSingletonScope()

  bind<MediaServiceProvider>(TYPES.MediaServiceProvider)
    .to(MediaServiceProvider)
    .inSingletonScope()

  bind<ActionService>(TYPES.ActionService)
    .to(ActionService)
    .inSingletonScope()

  bind<ActionServersService>(TYPES.ActionServersService)
    .to(ActionServersService)
    .inSingletonScope()

  bind<LicensingService>(TYPES.LicensingService)
    .to(CELicensingService)
    .inSingletonScope()
    .when(() => !process.IS_PRO_ENABLED)

  bind<JobService>(TYPES.JobService)
    .to(CEJobService)
    .inSingletonScope()
    .when(() => !process.IS_PRODUCTION || !process.CLUSTER_ENABLED || !process.IS_PRO_ENABLED)

  bind<MonitoringService>(TYPES.MonitoringService)
    .to(CEMonitoringService)
    .inSingletonScope()
    .when(() => !process.CLUSTER_ENABLED || !process.IS_PRO_ENABLED)

  bind<AlertingService>(TYPES.AlertingService)
    .to(CEAlertingService)
    .inSingletonScope()
    .when(() => !process.CLUSTER_ENABLED || !process.IS_PRO_ENABLED)

  bind<BotMonitoringService>(TYPES.BotMonitoringService)
    .to(BotMonitoringService)
    .inSingletonScope()

  bind<AuthStrategies>(TYPES.AuthStrategies)
    .to(CEAuthStrategies)
    .inSingletonScope()
    .when(() => !process.IS_PRO_ENABLED)

  bind<Queue<IO.IncomingEvent>>(TYPES.IncomingQueue).toDynamicValue((context: interfaces.Context) => {
    return new MemoryQueue('Incoming', context.container.getTagged(TYPES.Logger, 'name', 'IQueue'))
  })

  bind<Queue<IO.OutgoingEvent>>(TYPES.OutgoingQueue).toDynamicValue((context: interfaces.Context) => {
    return new MemoryQueue('Outgoing', context.container.getTagged(TYPES.Logger, 'name', 'OQueue'))
  })

  bind<HookService>(TYPES.HookService)
    .to(HookService)
    .inSingletonScope()

  bind<HintsService>(TYPES.HintsService)
    .to(HintsService)
    .inSingletonScope()

  bind<EventEngine>(TYPES.EventEngine)
    .to(EventEngine)
    .inSingletonScope()

  bind<RealtimeService>(TYPES.RealtimeService)
    .to(RealtimeService)
    .inSingletonScope()

  bind<AuthService>(TYPES.AuthService)
    .to(AuthService)
    .inSingletonScope()

  bind<LogsJanitor>(TYPES.LogJanitorRunner)
    .to(LogsJanitor)
    .inSingletonScope()

  bind<LogsService>(TYPES.LogsService)
    .to(LogsService)
    .inSingletonScope()

  bind<NotificationsService>(TYPES.NotificationsService)
    .to(NotificationsService)
    .inSingletonScope()

  bind<KeyValueStore>(TYPES.KeyValueStore)
    .to(KeyValueStore)
    .inSingletonScope()

  bind<SkillService>(TYPES.SkillService)
    .to(SkillService)
    .inSingletonScope()

  bind<ConverseService>(TYPES.ConverseService)
    .to(ConverseService)
    .inSingletonScope()

  bind<BotService>(TYPES.BotService)
    .to(BotService)
    .inSingletonScope()

  bind<StatsService>(TYPES.StatsService)
    .to(StatsService)
    .inSingletonScope()
})

export const ServicesContainerModules = [ServicesContainerModule, DialogContainerModule, GhostContainerModule]
