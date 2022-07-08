import { useEffect, useState } from 'react'
import { getCategories, initialItems } from './mocks'
import { CategoryTypes } from './Types'

export function useMock() {
  const [items, setItems] = useState(initialItems)

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

  return [items, setItems]
}
