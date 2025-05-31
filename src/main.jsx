import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' 
import injectContext from './front/js/store/appContext.jsx'
import './index.css'
import Layout from './front/js/Layout.jsx' 

const LayoutWithContext = injectContext(Layout)

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <LayoutWithContext/>
  </StrictMode>,
)
