import { Board } from './components/Board'
import { CardPreviewProvider } from './components/CardPreview'
import { CompsPanel } from './components/CompsPanel'
import { LangSwitch } from './components/LangSwitch'
import { MinionList } from './components/MinionList'
import { useBoard } from './hooks/useBoard'

export default function App() {
  const { board, add, place, remove, move, clear, load } = useBoard()

  return (
    <CardPreviewProvider>
      <div className="app">
        <header className="app__header">
          <h1>Battlegrounds Planner</h1>
          <LangSwitch />
        </header>
        <main className="app__main">
          <MinionList onAdd={add} />
          <div className="app__workspace">
            <Board board={board} onPlace={place} onMove={move} onRemove={remove} onClear={clear} />
            <CompsPanel onAdd={add} onLoad={load} />
          </div>
        </main>
      </div>
    </CardPreviewProvider>
  )
}
