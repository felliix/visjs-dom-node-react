import React from 'react';
import Network from './components/Network'
import './App.scss';

const nodes = ['one', 'two', 'three', 'four'].map((label, i) => ({
  id: i + 1,
  label,
  dom: (
    <div className='overlay'>
      <div className='command-panel'>
        <span className='command' onClick={() => alert(`command 1 for node ${label}`)}>c1</span>
        <span className='command' onClick={() => alert(`command 2 for node ${label}`)}>c2</span>
      </div>
      {label}
    </div>
  )
}))

const edges = [
  {id: '1-3', from: 1, to: 3},
  {id: '1-2', from: 1, to: 2},
  {id: '1-4', from: 1, to: 4},
]

const options = {
  interaction: {
    hover: true,
    selectConnectedEdges: false
  },
  nodes: {
    borderWidth: 2,
    size: 24,
    shapeProperties: {
      useBorderWithImage: false
    },
    scaling: {
      min: 10,
      max: 30
    },
    fixed: {
      x: false,
      y: false
    }
  },
  edges: {
    length: 400,
    color: '#3598DC',
  },

  layout: {
    randomSeed: 1,
  },
  physics: {
    enabled: true
  }
}

function App() {
  const popupOptions = { edgeClick: 'popupEdge' }
  const getPopupOnEdgeClick = e => <div className='popup'>{e.edges[0]}</div>
  const events = {
    'click': () => console.log('hihi')
  }

  return (
    <div className="App">
      <Network
        className='OverlayNetwork'
        options={options}
        nodes={nodes}
        edges={edges}
        events={events}
        popupOptions={popupOptions}
        popupEdge={getPopupOnEdgeClick}
      />
    </div>
  );
}

export default App;
