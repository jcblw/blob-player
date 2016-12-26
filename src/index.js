import React from 'react'
import ReactDOM from 'react-dom'
import {configStore} from './store'
import Layout from './components/layout'
import {Provider} from 'react-redux'

ReactDOM.render(
  <Provider store={configStore({})}>
    <Layout />
  </Provider>,
  document.getElementById('container')
)
