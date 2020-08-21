import React, { useMemo } from 'react'
import cn from 'classnames'
import fp from 'lodash/fp'
import Network from '../Network'
import Toolbar from '../Toolbar'

export default props => {
  const { nodes, edges, events, popupOptions, visOptions, className, options } = props

  const groups = useMemo(
    () => fp.compose(
      fp.map(group => ({
        name: group,
        color: visOptions.groups ? visOptions.groups[group].color : null
      })),
      fp.sortBy(x => x),
      fp.uniq,
      fp.map('group')
    )(nodes),
    [nodes, visOptions.groups]
  )

  const style = {
    height: options.height
  }

  const handleToggleGroup = (hiddenGroups, toggled) => {

  }

  return (
    <div className={cn('Graph', className)}>
      <Toolbar groups={groups} onToggleGroup={handleToggleGroup} />
      <Network
        nodes={nodes}
        edges={edges}
        events={events}
        popupOptions={popupOptions}
        options={visOptions}
        style={style}
      />
    </div>
  )
}
