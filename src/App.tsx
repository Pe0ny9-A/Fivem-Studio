import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Generator from './pages/Generator'
import Analyzer from './pages/Analyzer'
import Debugger from './pages/Debugger'
import Docs from './pages/Docs'
import Tools from './pages/Tools'
import Settings from './pages/Settings'
import Shortcuts from './pages/Shortcuts'
import Tutorial from './features/tutorial/Tutorial'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/debugger" element={<Debugger />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/shortcuts" element={<Shortcuts />} />
          <Route path="/tutorial" element={<Tutorial />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

