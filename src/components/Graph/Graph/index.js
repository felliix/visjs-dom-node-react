import React, { useMemo, useCallback, useState, useRef } from 'react'
import cn from 'classnames'
import fp from 'lodash/fp'
import Tree from 'rc-tree'
import Network from '../Network'
import Toolbar from '../Toolbar'
import { csvExport } from '../Helpers'
import './style.scss'
import 'rc-tree/assets/index.css'

export default props => {
  const { nodes, edges, events, popups, visOptions, className, options } = props
  
  const [hiddenGroups, setHiddenGroups] = useState([])
  const [hoverInfo, setHoverInfo] = useState(null)
  const [search, setSearch] = useState(null)
  const [view, setView] = useState(true)
  
  const networkRef = useRef(null)
  const focusNodeRef = useRef(null)

  const groups = useMemo(
    () => fp.compose(
      fp.map(group => ({
        name: group,
        color: (visOptions.groups && group && visOptions.groups[group]) ? visOptions.groups[group].color : null
      })),
      fp.sortBy(x => x),
      fp.uniq,
      fp.map('group')
    )(nodes),
    [nodes, visOptions.groups]
  )

  const info = useMemo(() => {
    let node = 0, edge = 0, table = 0, system = 0
    nodes.forEach(n => {
      if (!n.hidden) {
        node++
        n.group === 'TABL' && table++
        !n.isCustom && system++
      }
    })
    edges.forEach(e => !e.hidden && edge++)
    return { node, edge, table, system }
  }, [nodes, edges])

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

  const treeData = useCallback(() => {
    const n = {}
    const to = []
    let root = null
    
    const nodes = manipulatedNodes.map(node => ({
      key: node.id.toString(),
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
  }, [manipulatedNodes, icons, edges])

  const expandedTreeKeys = useCallback(
    () => !search ? [] : manipulatedNodes
      .filter(node => node.label.toLowerCase().includes(search))
      .map(node => node.id.toString()),
    [search, manipulatedNodes]
  )

  const filterTreeNode = node => {
    if (search === null || search.length === 0) {
      return false
    } else {
      return node.title.toLowerCase().includes(search)
    }
  }

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

        if (focusNodeRef.current) {
          if (focusNodeRef.current.dom) {
            // todo
          } else {
            // restore previously focused node
            update.push(focusNodeRef.current)
          }
        }

        networkRef.current.focus(node.id, option)
        networkRef.current.body.data.nodes.update(update)
        focusNodeRef.current = node
      }
    } else {
      alert('Cannot find matching node')
    }

    setSearch(query)
  }

  const handleNodeHover = e => {
    if (networkRef.current) {
      setHoverInfo({
        inbound: networkRef.current.getConnectedNodes(e.node, 'from').length,
        outbound: networkRef.current.getConnectedNodes(e.node, 'to').length
      })
    }
    events.hoverNode && events.hoverNode(e)
  }

  const handleNodeBlur = e => {
    setHoverInfo(null)
    events.blurNode && events.blurNode(e)
  }
  
  const handleClick = e => {
    const network = networkRef.current
    const focusNode = focusNodeRef.current
    
    network && focusNode && network.body.data.nodes.update(focusNode)
    focusNodeRef.current = null
    events.click && events.click(e)
  }

  const handleSaveClick = () => {
    const csvData = fp.compose(
      fp.filter(row => !!row),
      fp.map(([ id, e ]) => {
        const from = e.from.options
        const to = e.to.options

        if (from.hidden || to.hidden) {
          return null
        }

        return {
          fromType: from.group,
          fromTechnicalname: from.technicalName,
          fromDisplayName: from.label,
          fromDescription: from.title,
          relationship: e.options.type,
          toType: to.group,
          toTechnicalname: to.technicalName,
          toDisplayName: to.label,
          toDescription: to.title
        }
      }),
      fp.toPairs
    )(networkRef.current.body.edges)

    csvExport("object-relationships.csv", csvData)
  }
  
  const handleFitWindow = () => {
    networkRef.current && networkRef.current.fit({ animation: true })
  }
  
  const getNetwork = network => {
    networkRef.current = network
    props.getNetwork && props.getNetwork(network)
  }

  return (
    <div className={cn('Graph', className)}>
      {options.toolbar && (
        <Toolbar
          groups={groups}
          hiddenGroups={hiddenGroups}
          onToggleGroup={setHiddenGroups}
          onFitWindow={handleFitWindow}
          onSaveClick={handleSaveClick}
          onSearch={handleSearchChange}
          onToggleView={setView}
        />
      )}
      <div className='Graph__Content' style={{height: options.height}}>
        <Network
          className='Graph__Network'
          nodes={manipulatedNodes}
          edges={edges}
          events={{
            ...events,
            click: handleClick,
            hoverNode: handleNodeHover,
            blurNode: handleNodeBlur
          }}
          popups={popups}
          options={visOptions}
          getNetwork={getNetwork}
          style={{ visibility: view ? 'visible' : 'hidden' }}
        />
        {!view && (
          <Tree
            className='Graph__Tree'
            treeData={treeData()}
            defaultExpandedKeys={expandedTreeKeys()}
            filterTreeNode={filterTreeNode}
            key={search}
          />
        )}
      </div>
      <div className='Graph__BasicInfo'>
        <div>
          <strong>#Nodes</strong>&nbsp;
          { info.node }
        </div>
        <div>
          <strong>#Edges</strong>&nbsp;
          { info.edge }
        </div>
        <div>
          <strong>#Tables</strong>&nbsp;
          { info.table }
        </div>
        <div>
          <strong>#System</strong>&nbsp;
          { info.system }
        </div>
        {hoverInfo && (
          <>
            <div>
              <strong>#Inbound</strong>&nbsp;
              { hoverInfo.inbound }
            </div>
            <div>
              <strong>#Outbound</strong>&nbsp;
              { hoverInfo.outbound }
            </div>
          </>
        )}
      </div>
    </div>
  )
}
