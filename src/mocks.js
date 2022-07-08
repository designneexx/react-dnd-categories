import { CategoryTypes, ContainerTypes } from './Types'
import { longHash } from './helpers'

export const initialItems = [
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

export const getItem = (title, category) => ({
  id: longHash(),
  type: category,
  content: `Текст по сути ${title}`,
})

export const getCategories = () => [
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
      getItem('Акции ' + index, CategoryTypes.Shares)
    ),
  },
  {
    id: longHash(),
    type: CategoryTypes.Funds,
    title: 'Фонды',
    items: Array.from({ length: 4 }, (_, index) =>
      getItem('Фонды ' + index, CategoryTypes.Funds)
    ),
  },
  {
    id: longHash(),
    type: CategoryTypes.Bonds,
    title: 'Облигации',
    items: Array.from({ length: 4 }, (_, index) =>
      getItem('Облигации ' + index, CategoryTypes.Bonds)
    ),
  },
  {
    id: longHash(),
    type: CategoryTypes.Money,
    title: 'Валюты',
    items: Array.from({ length: 4 }, (_, index) =>
      getItem('Валюты ' + index, CategoryTypes.Money)
    ),
  },
]
