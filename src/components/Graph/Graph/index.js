import React, { useMemo, useCallback, useState, useRef } from 'react'
import cn from 'classnames'
import fp from 'lodash/fp'
import Tree from 'rc-tree'
import Network from '../Network'
import Toolbar from '../Toolbar'
import './style.scss'
import 'rc-tree/assets/index.css'

export default props => {
  const { nodes, edges, events, popups, visOptions, className, options } = props
  const [hiddenGroups, setHiddenGroups] = useState([])
  const [view, setView] = useState(true)
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

  const icons = useMemo(
    () => {
      const icons = {}
      groups.forEach(({ name, color }) => {
        icons[name] = (
          <span
            className='Graph__Tree-icon'
            style={{ backgroundColor: color }}
          />
        )
      })
      return icons
    },
    [groups]
  )

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

  const getTreeData = useCallback(() => {
    const n = {}
    const to = []
    let root = null
    
    const nodes = manipulatedNodes.map(node => ({
      key: node.id,
      title: node.label,
      group: node.group,
      children: [],
      icon: icons[node.group]
    }))

    nodes.forEach(node => n[node.key] = node)

    edges.forEach(edge => {
      if (!n[edge.to].parent) {
        n[edge.to].parent = n[edge.from]
      }
      if (!to.includes(edge.to)) {
        n[edge.from].children.push(n[edge.to])
        to.push(edge.to)
      }
    })

    nodes.forEach(node => {
      if (node.children.length) {
        const groups = fp.compose(
          fp.sortBy(x => x),
          fp.uniq,
          fp.map('group')
        )(node.children)
        node.children = groups.map(group => ({
          key: `${node.key}-${group}`,
          title: group,
          children: node.children.filter(n => n.group === group)
        }))
      }
      if (!node.parent) {
        root = node
      }
    })

    return [root]
  }, [manipulatedNodes, edges])

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
        onToggleView={setView}
      />
      <Network
        nodes={manipulatedNodes}
        edges={edges}
        events={events}
        popups={popups}
        options={visOptions}
        getNetwork={getNetwork}
        style={{
          height: options.height,
          display: view ? 'block' : 'none'
        }}
      />
      {!view && (
        <Tree
          className='Graph__Tree'
          treeData={getTreeData()}
          style={{ height: options.height }}
        />
      )}
    </div>
  )
}
