import React, { useMemo, useState, useRef } from 'react'
import cn from 'classnames'
import fp from 'lodash/fp'
import Network from '../Network'
import Toolbar from '../Toolbar'

export default props => {
  const { nodes, edges, events, popups, visOptions, className, options } = props
  const [hiddenGroups, setHiddenGroups] = useState([])
  const networkRef = useRef(null)
  const focusNode = useRef(null)

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

  const manipulatedNodes = useMemo(
    () => nodes.map(node => {
      const hidden = hiddenGroups.includes(node.group)
      return {
        ...node,
        hidden,
        physics: !hidden
      }
    }),
    [hiddenGroups, nodes]
  )

  const handleSearchChange = q => {
    const query = q.toLowerCase()
    const node = nodes.find(node => (
      node.label.toLowerCase().includes(query) ||
      node.technicalName.toLowerCase().includes(query)
    ))
    
    if (node) {
      if (networkRef.current) {
        const update = []
        const option = {
          scale: 1.25,
          offset: { x: 0, y: 0 },
          animation: true
        }
        
        if (node.dom) {
          // todo
        } else {
          update.push({
            ...node,
            borderWidth: 5,
            color: { border: 'yellow' }
          })
        }

        if (focusNode.current) {
          if (focusNode.current.dom) {
            // todo
          } else {
            update.push(focusNode.current)
          }
        }

        networkRef.current.focus(node.id, option)
        networkRef.current.body.data.nodes.update(update)
        focusNode.current = node
      }
    } else {
      alert('Cannot find matching node')
    }
  }

  const handleFitWindow = () => {
    networkRef.current && networkRef.current.fit({ animation: true })
  }
  
  const getNetwork = network => networkRef.current = network

  return (
    <div className={cn('Graph', className)}>
      <Toolbar
        groups={groups}
        onToggleGroup={setHiddenGroups}
        onFitWindow={handleFitWindow}
        onSearch={handleSearchChange}
      />
      <Network
        nodes={manipulatedNodes}
        edges={edges}
        events={events}
        popups={popups}
        options={visOptions}
        getNetwork={getNetwork}
        style={style}
      />
    </div>
  )
}
