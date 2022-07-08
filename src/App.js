import logo from './logo.svg'
import './App.css'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { forwardRef, memo, useEffect, useState } from 'react'
import produce from 'immer'

const longHash = () => Math.random().toString(32).slice(2).repeat(2)

const ContainerTypes = {
  Available: 'AVAILABLE',
  Current: 'CURRENT',
}

const initialItems = [
  {
    id: longHash(),
    title: 'Доступные',
    type: ContainerTypes.Available,
    items: [],
  },
  {
    id: longHash(),
    title: 'Активные',
    type: ContainerTypes.Current,
    items: [],
  },
]

const getItem = (title, category) => ({
  id: longHash(),
  type: category,
  content: `Текст по сути ${title}`,
})

const CategoryTypes = {
  Shares: 'SHARES',
  Funds: 'FUNDS',
  Bonds: 'BODS',
  Money: 'Money',
  Trash: 'TRASH',
}

const getCategories = () => [
  {
    id: longHash(),
    type: CategoryTypes.Trash,
    title: 'Корзина',
    items: [],
  },
  {
    id: longHash(),
    type: CategoryTypes.Shares,
    title: 'Акции',
    items: Array.from({ length: 4 }, (_, index) =>
      getItem('Акции', CategoryTypes.Shares)
    ),
  },
  {
    id: longHash(),
    type: CategoryTypes.Funds,
    title: 'Фонды',
    items: Array.from({ length: 4 }, (_, index) =>
      getItem('Фонды', CategoryTypes.Funds)
    ),
  },
  {
    id: longHash(),
    type: CategoryTypes.Bonds,
    title: 'Облигации',
    items: Array.from({ length: 4 }, (_, index) =>
      getItem('Облигации', CategoryTypes.Bonds)
    ),
  },
  {
    id: longHash(),
    type: CategoryTypes.Money,
    title: 'Валюты',
    items: Array.from({ length: 4 }, (_, index) =>
      getItem('Валюты', CategoryTypes.Money)
    ),
  },
]

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: 8 * 2,
  margin: `0 0 ${8}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
})

function arrayMove2d([source, destination], sourceIndex, destinationIndex) {
  const newSource = Array.from(source)
  const [removed] = newSource.splice(sourceIndex, 1)

  if (source === destination) {
    newSource.splice(destinationIndex, 0, removed)

    return [newSource, newSource]
  }

  const newDestination = Array.from(destination)

  newDestination.splice(destinationIndex, 0, removed)

  return [newSource, newDestination, removed]
}

const DraggableItem = forwardRef(
  ({ content, draggableProps, dragHandleProps, isDragging }, ref) => {
    return (
      <div
        ref={ref}
        {...draggableProps}
        style={getItemStyle(isDragging, draggableProps.style)}
      >
        <div>
          <div {...dragHandleProps}>Перетащи за меня</div>
        </div>
        <div>{content}</div>
      </div>
    )
  }
)

function App() {
  const [items, setItems] = useState(initialItems)

  function findDroppable(list, id) {
    let droppable = null
    let container = null

    list.forEach((containerItem) => {
      containerItem.items.forEach((droppableItem) => {
        if (droppableItem.id === id) {
          droppable = droppableItem
          container = containerItem
        }
      })
    })

    return [droppable, container]
  }

  const onDragEnd = (result) => {
    const { destination, source } = result

    if (!destination || !source) return

    setItems((prevState) => {
      return produce(prevState, (draftState) => {
        const [droppableDestination, containerDestination] = findDroppable(
          draftState,
          destination.droppableId
        )
        const [droppableSource, containerSource] = findDroppable(
          draftState,
          source.droppableId
        )

        const isEqContainers = containerDestination === containerSource
        const isEqDroppables = droppableDestination === droppableSource

        if (isEqContainers && !isEqDroppables) return draftState

        const [sourceItems, destinationItems, removedSource] = arrayMove2d(
          [droppableSource.items, droppableDestination.items],
          source.index,
          destination.index
        )

        const isDropToAvailable =
          containerSource.type === ContainerTypes.Current && !isEqContainers
        const isDropToCurrent =
          containerSource.type === ContainerTypes.Available && !isEqContainers

        const isTrashDroppable =
          droppableDestination.type === CategoryTypes.Trash

        if (isDropToAvailable && !isTrashDroppable) {
          const trash = containerDestination.items.find(
            (category) => category.type === CategoryTypes.Trash
          )

          if (trash) {
            droppableSource.items = sourceItems

            trash.items.push(removedSource)
          }

          return draftState
        }

        if (isDropToCurrent && !isEqDroppables) {
          const droppableSourceItem = droppableSource.items[source.index]

          const category = containerDestination.items.find(
            (category) => category.type === droppableSourceItem?.type
          )

          if (category) {
            droppableSource.items = sourceItems

            category.items.push(removedSource)
          }

          return draftState
        }

        droppableSource.items = sourceItems
        droppableDestination.items = destinationItems
      })
    })
  }

  useEffect(() => {
    setTimeout(() => {
      setItems((prevState) => {
        return [
          {
            ...prevState[0],
            items: getCategories(),
          },
          {
            ...prevState[1],
            items: getCategories().filter(
              (category) => category.type !== CategoryTypes.Trash
            ),
          },
        ]
      })
    }, 1500)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

      <DragDropContext onDragEnd={onDragEnd} onDragUpdate={console.log}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: '30px',
            width: '800px',
            paddingBottom: '80px',
          }}
        >
          {items.map((container) => (
            <div key={container.id}>
              <h1>{container.title}</h1>
              <div style={{ height: '300px', overflowY: 'auto' }}>
                {container.items.map((category) => (
                  <div
                    key={category.id}
                    style={{
                      display: category.items.length ? 'block' : 'none',
                    }}
                  >
                    <h3>{category.title}</h3>
                    <Droppable droppableId={category.id}>
                      {(providedCategory, providedSnapshot) => (
                        <div
                          ref={providedCategory.innerRef}
                          {...providedCategory.droppableProps}
                        >
                          {category.items.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(draggableProvided, draggableSnapshot) => (
                                <DraggableItem
                                  draggableProps={
                                    draggableProvided.draggableProps
                                  }
                                  ref={draggableProvided.innerRef}
                                  dragHandleProps={
                                    draggableProvided.dragHandleProps
                                  }
                                  content={item.content}
                                  isDragging={draggableSnapshot.isDragging}
                                />
                              )}
                            </Draggable>
                          ))}
                          {providedCategory.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

export default App
