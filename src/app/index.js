import React, { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faEye, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Graph, { iterateFrom, csvExport, dumpEdge } from 'components/Graph'
import vo from './vis-options'
import neo4j from 'neo4j-driver'
import mockDriver from './mock-driver'
import queryGraph from 'neo4j'
import './style.scss'

const driver = mockDriver // neo4j

// const nodes = ['one', 'two', 'three', 'four'].map((label, i) => ({
//   id: i + 1,
//   label,
//   dom: (
//     <div className='overlay'>
//       <div className='command-panel'>
//         <span className='command' onClick={() => alert(`command 1 for node ${label}`)}>c1</span>
//         <span className='command' onClick={() => alert(`command 2 for node ${label}`)}>c2</span>
//       </div>
//       {label}
//     </div>
//   )
// }))

// const edges = [
//   {id: '1-3', from: 1, to: 3},
//   {id: '1-2', from: 1, to: 2},
//   {id: '1-4', from: 1, to: 4},
// ]

const visOptions = {
  height: '100%',
  width: '100%',
  autoResize: true,
  groups: {
    PROG: { mass: 1, shape: 'dot', color: 'red' },
    FUNC: { mass: 1, shape: 'dot', color: '#f5ab70' },
    METH: { mass: 1, shape: 'dot', color: '#059494' },
    DTEL: { mass: 2, shape: 'dot', color: '#059494' },
    STRU: { mass: 2, shape: 'dot', color: '#00b8ff' },
    TYPE: { mass: 2, shape: 'dot', color: 'darkslateblue' },
    TTYP: { mass: 2, shape: 'dot', color: 'coral' },
    TABL: { mass: 1, shape: 'dot', color: 'white' },
    TRAN: { mass: 5, shape: 'box', color: 'grey', font: { color:'white' } },
    VIEW: { mass: 1, shape: 'dot', color: 'yellow' }
  },
  ...vo
}

const options = {
  height: '500px',
  toolbar: true
}

function App() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const networkRef = useRef()
  const searchRef = useRef()

  useEffect(() => {
    const q = localStorage.getItem('search')
    if (q && searchRef.current) {
      searchRef.current.value = q
      searchRef.current.setAttribute('value', q)
      search(q)
    }
  }, [])

  const handleSearchChange = e => {
    const q = e.target.value
    if (e.which === 13 || q.length === 0) {
      localStorage.setItem('search', q)
      search(q)
    }
  }

  const search = q => {
    queryGraph(driver, 'zresource').then(({ nodes, edges }) => {
      setNodes(nodes)
      setEdges(edges)
    })
  }

  const handleSaveClick = nodeId => () => {
    const network = networkRef.current
    if (network) {
      const node = network.body.nodes[nodeId]
      const dump = iterateFrom(node).edges.map(dumpEdge)
      csvExport('objectRelationships.csv', dump)
    }
  }

  const popups = {
    popupOnEdgeClick: e => (
      <div className='edge-popup'>{e.edges[0]}</div>
    ),
    popupOnNodeHover: e => (
      <div className='hover-popup'>
        <FontAwesomeIcon icon={faSave} title='Save' onClick={handleSaveClick(e.node)}/>
        <FontAwesomeIcon icon={faEye} title='Hide/Unhide' />
        <FontAwesomeIcon icon={faArrowRight} title='Open/Close the Direct Children' />
      </div>
    )
  }

  const events = {
    click: () => console.log('hihi')
  }

  const getNetwork = network => networkRef.current = network

  return (
    <div className='App'>
      <input
        ref={searchRef}
        onKeyUp={handleSearchChange}
        placeholder='Search the codebase'
        className='SearchCodebase'
      />
      <Graph
        className='ProfileGraph'
        visOptions={visOptions}
        nodes={nodes}
        edges={edges}
        events={events}
        popups={popups}
        options={options}
        getNetwork={getNetwork}
      />
    </div>
  );
}

export default App;
