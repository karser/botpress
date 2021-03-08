import classnames from 'classnames'
import React from 'react'

import SideList from './SideList'
import style from './style.scss'

const SidePanel = ({
  eventCounts,
  selectedStatus,
  events,
  checkedEventIds,
  selectedEventIndex,
  onSelectedStatusChange,
  onSelectedEventChange,
  onEventCheckedOrUnchecked,
  applyAllPending
}) => (
  <div className={style.sidePanel}>
    <div className={classnames(style.contentStretch, style.sidePanelContentStretch)}>
      <SideList
        eventCounts={eventCounts}
        selectedStatus={selectedStatus}
        events={events}
        checkedEventIds={checkedEventIds}
        selectedEventIndex={selectedEventIndex}
        onSelectedStatusChange={onSelectedStatusChange}
        onSelectedEventChange={onSelectedEventChange}
        onEventCheckedOrUnchecked={onEventCheckedOrUnchecked}
        applyAllPending={applyAllPending}
      />
    </div>
  </div>
)

export default SidePanel
