import React, { useState, useRef, useEffect } from 'react';
import cn from 'classnames';
import Graph from 'react-graph-vis';
import Hammer from 'hammerjs';
import './Network.scss';

const getDomNodeStyle = (node, dom) => ({
  ...node,
  widthConstraint: dom.clientWidth,
  heightConstraint: dom.clientHeight,
  shape: 'box',
  margin: 0.01,
  color: {
    border: '#0000',
    background: '#0000',
    highlight: {
      border: '#0000',
      background: '#0000'
    },
    hover: {
      border: '#0000',
      background: '#0000'
    }
  }
})

function Network(props) {
  const { className, edges, options, popupOptions, ...otherProps } = props
  const [nodes, setNodes] = useState(props.nodes)
  const [domRefLoaded, setDomRefLoaded] = useState(false)
  const [popup, setPopup] = useState(null)
  const graph = { nodes, edges }

  const networkRef = useRef()
  const popupRef = useRef()
  const domRef = useRef({})

  useEffect(() => {
    domRef.current = {}
  }, [props.nodes])

  const getDomRef = key => el => {
    const dom = domRef.current
    const network = networkRef.current

    if (!dom[key] && el) {
      dom[key] = el

      if (network) {
        const hammer = new Hammer(el)
        hammer.on('hammer.input', e => e.isFirst && network.body.eventListeners.onTouch(e))
        hammer.on('panstart', network.body.eventListeners.onDragStart)
        hammer.on('panmove', network.body.eventListeners.onDrag)
        hammer.on('panend', network.body.eventListeners.onDragEnd)
        hammer.on('press', network.body.eventListeners.onHold)
        hammer.on('tap', network.body.eventListeners.onTap)
      }

      if (Object.keys(dom).length === nodes.length) {
        const nodes = props.nodes.map(node => getDomNodeStyle(node, el))
        setNodes(nodes)
        setDomRefLoaded(true)
      }
    }
  }

  const handleAfterDrawing = e => {
    const network = networkRef.current
    const dom = domRef.current
    const pos = network.getPositions()
    const scale = network.getScale()
    
    nodes.forEach(({ id }) => {
      const { x, y } = network.canvasToDOM({
        x: pos[id].x,
        y: pos[id].y
      })

      dom[id].style.left = `${x}px`
      dom[id].style.top = `${y}px`
      dom[id].style.transform = `translate(-50%, -50%) scale(${scale})`
    })
    props.events && props.events.afterDrawing && props.events.afterDrawing(e)
  }

  const handleClick = e => {
    const popupDom = popupRef.current

    if (e.edges.length) {
      if (popupOptions && popupOptions.edgeClick && otherProps[popupOptions.edgeClick]) {
        const popupEdgeClick = otherProps[popupOptions.edgeClick](e)
        popupDom.style.left = e.event.center.x + 'px'
        popupDom.style.top = e.event.center.y + 'px'
        popupDom.style.opacity = 1
        setPopup(popupEdgeClick)
      }
    } else {
      popupDom.style.opacity = 0
    }
    props.events && props.events.click && props.events.click(e)
  }

  const handleZoom = e => {
    popupRef.current.style.opacity = 0
    props.events && props.events.zoom && props.events.zoom(e)
  }

  const handleDragStart = e => {
    popupRef.current.style.opacity = 0
    props.events && props.events.dragStart && props.events.dragStart(e)
  }

  const handleHoverNode = e => {
    props.events && props.events.hoverNode && props.events.hoverNode(e)
  }

  const handleBlurNode = e => {
    props.events && props.events.blurNode && props.events.blurNode(e)
  }

  const getNetwork = obj => {
    networkRef.current = obj
    props.getNetwork && props.getNetwork(obj)
  }

  const events = {
    ...props.events,
    'afterDrawing': handleAfterDrawing,
    'click': handleClick,
    'zoom': handleZoom,
    'dragStart': handleDragStart,
    'hoverNode': handleHoverNode,
    'blurNode': handleBlurNode
  }

  return (
    <div className={cn('Network', className)}>
      {domRefLoaded && (
        <Graph
          graph={graph}
          options={options}
          events={events}
          getNetwork={getNetwork}
        />
      )}
      {nodes.map(({ id, dom }) => (
        <div
          className='Network__overlay-dom'
          ref={getDomRef(id)}
          onMouseMove={networkRef.current && networkRef.current.body.eventListeners.onMouseMove}
          key={id}
        >
            {dom}
        </div>
      ))}
      <div className='Network__popup' ref={popupRef}>
        {popup}
      </div>
    </div>
  )
}

export default Network
